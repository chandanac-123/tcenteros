from fastapi import APIRouter, Body, Depends, HTTPException, Query, UploadFile, File, Form
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.platforms.models.models import PlatformBranchSetting
from sqlalchemy.future import select
from sqlalchemy import or_
from app.core.database import get_async_session
from app.core.dependencies import superadmin_required, centeradmin_required
from app.auth.models.models import CenterAdmin
from app.core.security import get_password_hash
from app.settings.models.models import Address, CenterCategory
from app.billing.models.models import PaymentOrder, PaymentOrderStatus
from app.center.models.models import Center
from app.auth.models.models import Employee, Member, MemberStatusEnum
from uuid import uuid4
from datetime import datetime
from app.s3.service import upload_file, get_file_url
from app.accounts.branching_helper import post_branching_purchase_journal  # <-- You must implement this helper

router = APIRouter()


#-------------------------------------
# Branching Routes
#-------------------------------------

#1. Superadmin: Set Branching Price
@router.post("/superadmin/branching-price")
async def set_branching_price(
    price: float = Body(..., embed=True),
    session: AsyncSession = Depends(get_async_session),
    current_superadmin=Depends(superadmin_required)
):
    # Store price in a settings table (e.g., PlatformSetting)
    
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    if setting:
        setting.value = str(price)
    else:
        setting = PlatformBranchSetting(key="branching_price", value=str(price))
        session.add(setting)
    await session.commit()
    return {"branching_price": price, "detail": "Branching price set successfully"}



#2. Centeradmin: View Branching Price
@router.get("/centeradmin/branching-price")
async def get_branching_price(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    price = float(setting.value) if setting else 0.0
    return {"branching_price": price}


#3. Centeradmin: Request Branch Creation & Calculate Amount

@router.post("/centeradmin/branch/request")
async def request_branch_creation(
    branch_count: int = Body(..., embed=True),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # 1. Get the current branching price from settings
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    price = float(setting.value) if setting else 0.0
    subtotal_amount = branch_count * price

    # 2. Check for tax category with tax_scope = "add_on"
    from app.settings.models.models import TaxCategory
    tax_result = await session.execute(
        select(TaxCategory).where(TaxCategory.tax_scope == "add_on")
    )
    tax_category = tax_result.scalar_one_or_none()
    if tax_category:
        tax_percentage = float(tax_category.tax_percentage or 0)
        tax_category_id = str(tax_category.id)
        tax_type = tax_category.tax_type
        tax_rate = tax_percentage
        tax_amount = round(subtotal_amount * tax_percentage / 100, 2)
    else:
        tax_percentage = 0.0
        tax_category_id = None
        tax_type = None
        tax_rate = 0.0
        tax_amount = 0.0

    total_amount = subtotal_amount + tax_amount
    from app.billing.models.models import PaymentOrder, PaymentOrderStatus, OrderType, PayeeType, PayerType, ReferenceSchema, Currency
    # 3. Create payment order (simulate payment success)
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        center_id=current_admin["center_id"],
        payer_user_id=current_admin["user_id"],
        payer_type=PayerType.center_admin,
        payee_type=PayeeType.platform,
        order_type=OrderType.branch_purchase,  # Use the correct enum value as per your DB
        reference_schema=ReferenceSchema.center,
        reference_id=current_admin["center_id"],
        subtotal_amount=subtotal_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        currency=Currency.INR,
        status=PaymentOrderStatus.paid,
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(payment_order)

    # 4. Fetch the parent center and increment branch_count if it is a parent (parent_center_id is None)
    parent_center = await session.get(Center, current_admin["center_id"])
    total_branch_count = None
    if parent_center and parent_center.parent_center_id is None:
        parent_center.branch_count = (parent_center.branch_count or 0) + branch_count
        total_branch_count = parent_center.branch_count

    await session.commit()

    # 5. Post to accounting (center only, no platform)
    await post_branching_purchase_journal(
        session=session,
        center_id=current_admin["center_id"],
        platform_center_id=None,  # No platform center
        subtotal_amount=subtotal_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        tax_type=tax_type,
        tax_rate=tax_rate,
        payment_order_id=payment_order.payment_order_id,
        created_by=current_admin["user_id"]
    )
    await session.commit()

    return {
        "branch_count": branch_count,
        "branching_price": price,
        "subtotal_amount": subtotal_amount,
        "tax_percentage": tax_percentage,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "payment_order_id": str(payment_order.payment_order_id),
        "payment_status": "success",
        "total_branch_count": total_branch_count,
        "tax_category_id": tax_category_id,
    }



# @router.post("/centeradmin/branch/request")
# async def request_branch_creation(
#     branch_count: int = Body(..., embed=True),
#     session: AsyncSession = Depends(get_async_session),
#     current_admin=Depends(centeradmin_required)
# ):
#     # Get the current branching price from settings
#     setting = await session.execute(
#         select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
#     )
#     setting = setting.scalar_one_or_none()
#     price = float(setting.value) if setting else 0.0
#     subtotal_amount = branch_count * price

#     # Check for tax category with tax_scope = "add_on"
#     from app.settings.models.models import TaxCategory
#     tax_result = await session.execute(
#         select(TaxCategory).where(TaxCategory.tax_scope == "add_on")
#     )
#     tax_category = tax_result.scalar_one_or_none()
#     if tax_category:
#         tax_percentage = float(tax_category.tax_percentage or 0)
#         tax_amount = round(subtotal_amount * (tax_percentage / 100), 2)
#         total_amount = round(subtotal_amount + tax_amount, 2)
#         tax_category_id = str(tax_category.id)
#     else:
#         tax_percentage = 0.0
#         tax_amount = 0.0
#         total_amount = subtotal_amount
#         tax_category_id = None

#     # Create payment order (simulate payment success)
#     payment_order = PaymentOrder(
#         payment_order_id=uuid4(),
#         center_id=current_admin["center_id"],
#         payer_user_id=current_admin["user_id"],
#         payer_type="center_admin",
#         payee_type="platform",
#         order_type="add_on",  # Use the correct enum value as per your DB
#         reference_schema="center",
#         reference_id=current_admin["center_id"],
#         subtotal_amount=subtotal_amount,
#         tax_amount=tax_amount,
#         total_amount=total_amount,
#         currency="INR",
#         status="paid",
#         created_by=current_admin["user_id"],
#         updated_by=current_admin["user_id"],
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow(),
#     )
#     session.add(payment_order)

#     # Fetch the parent center and increment branch_count if it is a parent (parent_center_id is None)
#     parent_center = await session.get(Center, current_admin["center_id"])
#     total_branch_count = None
#     if parent_center and parent_center.parent_center_id is None:
#         parent_center.branch_count = (parent_center.branch_count or 0) + branch_count
#         total_branch_count = parent_center.branch_count

#     await session.commit()
#     return {
#         "branch_count": branch_count,
#         "branching_price": price,
#         "subtotal_amount": subtotal_amount,
#         "tax_percentage": tax_percentage,
#         "tax_amount": tax_amount,
#         "total_amount": total_amount,
#         "payment_order_id": str(payment_order.payment_order_id),
#         "payment_status": "success",
#         "total_branch_count": total_branch_count,
#         "tax_category_id": tax_category_id,
#     }

#GET API that allows the logged-in center admin to view their latest branch purchase calculation, including tax details:
@router.get("/centeradmin/branch/request/summary")
async def get_branch_request_summary(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Get the current branching price from settings
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    price = float(setting.value) if setting else 0.0

    # Get the latest paid payment order for add_on
    result = await session.execute(
        select(PaymentOrder)
        .where(
            PaymentOrder.center_id == current_admin["center_id"],
            PaymentOrder.status == "paid",
            PaymentOrder.order_type == "branch_purchase"
        )
        .order_by(PaymentOrder.created_at.desc())
        .limit(1)
    )
    payment_order = result.scalar_one_or_none()

    if not payment_order:
        raise HTTPException(404, "No branch purchase found for this center.")

    subtotal_amount = float(payment_order.subtotal_amount)
    tax_amount = float(payment_order.tax_amount)
    total_amount = float(payment_order.total_amount)
    # Fix: convert both to float before division
    branch_count = int(subtotal_amount // price) if price > 0 else 0

    # Get tax details
    from app.settings.models.models import TaxCategory
    tax_result = await session.execute(
        select(TaxCategory).where(TaxCategory.tax_scope == "add_on")
    )
    tax_category = tax_result.scalar_one_or_none()
    tax_percentage = float(tax_category.tax_percentage or 0) if tax_category else 0.0
    tax_category_id = str(tax_category.id) if tax_category else None

    # Get total branch count
    parent_center = await session.get(Center, current_admin["center_id"])
    total_branch_count = parent_center.branch_count if parent_center else None

    return {
        "branch_count": branch_count,
        "branching_price": price,
        "subtotal_amount": subtotal_amount,
        "tax_percentage": tax_percentage,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "payment_order_id": str(payment_order.payment_order_id),
        "payment_status": payment_order.status,
        "total_branch_count": total_branch_count,
        "tax_category_id": tax_category_id,
    }




@router.get("/centeradmin/branch/purchased")
async def get_purchased_branch_count(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.billing.models.models import PaymentOrder
    from app.center.models.models import Center

    parent_center_id = current_admin["center_id"]
    parent_center = await session.get(Center, parent_center_id)
    if not parent_center:
        raise HTTPException(404, "Parent center not found")

    purchased_count = parent_center.branch_count or 0

    # Get the latest payment order for branch purchase (only 'add_on')
    result = await session.execute(
        select(PaymentOrder)
        .where(
            PaymentOrder.center_id == parent_center_id,
            PaymentOrder.status == "paid",
            PaymentOrder.order_type == "branch_purchase"
        )
        .order_by(PaymentOrder.created_at.desc())
        .limit(1)
    )
    payment_order = result.scalar_one_or_none()
    payment_order_id = str(payment_order.payment_order_id) if payment_order else None

    return {
        "center_id": str(parent_center_id),
        "branches_purchased": purchased_count,
        "payment_order_id": payment_order_id
    }


#4. Centeradmin: Make Payment for Branches
# @router.post("/centeradmin/branch/payment")
# async def pay_for_branches(
#     branch_count: int = Body(..., embed=True),
#     session: AsyncSession = Depends(get_async_session),
#     current_admin=Depends(centeradmin_required)
# ):
#     # Calculate total amount

#     from app.billing.models.models import PaymentOrder
#     from uuid import uuid4
#     from datetime import datetime

#     setting = await session.execute(
#         select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
#     )
#     setting = setting.scalar_one_or_none()
#     price = float(setting.value) if setting else 0.0
#     total_amount = branch_count * price

#     # Create payment order (simulate payment success)
#     payment_order = PaymentOrder(
#         payment_order_id=uuid4(),
#         center_id=current_admin["center_id"],
#         payer_user_id=current_admin["user_id"],
#         payer_type="center_admin",
#         payee_type="platform",
#         order_type="branch_creation",
#         reference_schema="center",
#         reference_id=current_admin["center_id"],
#         subtotal_amount=total_amount,
#         tax_amount=0.0,
#         total_amount=total_amount,
#         currency="INR",
#         status="paid",
#         created_by=current_admin["user_id"],
#         updated_by=current_admin["user_id"],
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow(),
#     )
#     session.add(payment_order)
#     await session.commit()
#     return {
#         "branch_count": branch_count,
#         "total_amount": total_amount,
#         "payment_order_id": str(payment_order.payment_order_id),
#         "payment_status": "success"
#     }


#5. Centeradmin: Create Sub-Branches (after payment)


from uuid import UUID

@router.post("/centeradmin/branch/create")
async def create_sub_branch(
    payment_order_id: str = Query(..., description="Payment order ID"),
    name: str = Form(...),
    center_category_id: str = Form(...),
    address_line_1: str = Form(...),
    address_line_2: str = Form(...),
    city: str = Form(...),
    district: str = Form(...),
    state: str = Form(...),
    country: str = Form(...),
    postal_code: str = Form(...),
    center_email: str = Form(...),
    password: str = Form(...),
    center_phone: str = Form(...),
    center_image: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from uuid import UUID
    # 1. Verify payment (convert to UUID for DB lookup)
    try:
        payment_uuid = UUID(payment_order_id)
    except Exception:
        raise HTTPException(400, "Invalid payment_order_id format")
    payment = await session.get(PaymentOrder, payment_uuid)
    if not payment or payment.status != PaymentOrderStatus.paid:
        raise HTTPException(400, "Payment not successful")

    parent_center_id = current_admin["center_id"]
    parent_center = await session.get(Center, parent_center_id)
    if not parent_center:
        raise HTTPException(404, "Parent center not found")

    # 2. Check purchased vs. already created branches
    purchased_count = parent_center.branch_count or 0
    result = await session.execute(
        select(Center).where(Center.parent_center_id == parent_center_id)
    )
    already_created = len(result.scalars().all())
    remaining = purchased_count - already_created

    if remaining <= 0:
        raise HTTPException(400, "No branch slots available. Please purchase more branches.")

    # 3. Upload center image to S3
    image_key = f"center_images/{uuid4()}_{center_image.filename}"
    image_bytes = await center_image.read()
    upload_file(image_bytes, image_key, center_image.content_type)
    center_image_url = get_file_url(image_key)  # Get the presigned/public URL

    # 4. Create Address
    address_obj = Address(
        id=uuid4(),
        address_line_1=address_line_1,
        address_line_2=address_line_2,
        city=city,
        district=district,
        state=state,
        country=country,
        postal_code=postal_code,
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(address_obj)
    await session.flush()

    # 5. Create branch center
    branch = Center(
        id=uuid4(),
        parent_center_id=parent_center_id,
        center_name=name,
        center_category_id=center_category_id,
        address_id=address_obj.id,
        center_phone=center_phone,
        center_image=image_key,  # Store S3 key in DB
        approval_status="approved",
        center_status="active",
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(branch)
    await session.flush()

    # 6. Create CenterAdmin for the new branch
    # Check for duplicate email
    existing_admin = await session.execute(
        select(CenterAdmin).where(CenterAdmin.email == center_email)
    )
    if existing_admin.scalar_one_or_none():
        raise HTTPException(400, "A center admin with this email already exists.")

    # Use email prefix as full_name
    full_name = center_email.split("@")[0]

    from app.core.security import get_password_hash
    center_admin = CenterAdmin(
        id=uuid4(),
        full_name=full_name,
        email=center_email,
        password_hash=get_password_hash(password),
        center_id=branch.id,
        is_approved=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        status="active"
    )
    session.add(center_admin)

    await session.commit()

    # Prepare parent center data
    parent_center_data = {
        "center_id": str(parent_center.id),
        "center_name": parent_center.center_name,
        "center_phone": parent_center.center_phone,
        "center_email": parent_center.center_email,
        "center_status": parent_center.center_status.value if parent_center.center_status else None,
        "approval_status": parent_center.approval_status.value if parent_center.approval_status else None,
        "created_at": parent_center.created_at,
        "updated_at": parent_center.updated_at,
        "center_image_url": get_file_url(parent_center.center_image) if parent_center.center_image else None,
        # Add more fields as needed
    }

    return {
        "parent_center": parent_center_data,
        "branch_id": str(branch.id),
        "center_admin_id": str(center_admin.id),
        "center_admin_email": center_admin.email,
        "center_phone": branch.center_phone,
        "center_image_key": branch.center_image,  # S3 key
        "center_image_url": center_image_url,      # Public/presigned URL
        "detail": "Branch and center admin created successfully"
    }


# list all branches under the logged-in centeradmin's center
@router.get("/centeradmin/branches/list-summary")
async def list_branches_and_summary(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    parent_center_id = current_admin["center_id"]
    center = await session.get(Center, parent_center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    # If this is a sub-branch, only show this branch and its stats
    if center.parent_center_id is not None:
        # Fetch address
        address = None
        if center.address_id:
            address_obj = await session.get(Address, center.address_id)
            if address_obj:
                address = {
                    "address_line_1": address_obj.address_line_1,
                    "address_line_2": address_obj.address_line_2,
                    "city": address_obj.city,
                    "district": address_obj.district,
                    "state": address_obj.state,
                    "country": address_obj.country,
                    "postal_code": address_obj.postal_code,
                }
            else:
                address = {}
        else:
            address = {}

        # Fetch category name
        category_name = None
        if center.center_category_id:
            category_obj = await session.get(CenterCategory, center.center_category_id)
            if category_obj:
                category_name = category_obj.name

        # Fetch center admin email
        admin_email = None
        admin_result = await session.execute(
            select(CenterAdmin).where(CenterAdmin.center_id == center.id)
        )
        admin_obj = admin_result.scalar_one_or_none()
        if admin_obj:
            admin_email = admin_obj.email

        # Get employees for this sub-branch
        emp_result = await session.execute(
            select(Employee).where(Employee.center_id == str(center.id))
        )
        employees = emp_result.scalars().all()
        total_employees = len(employees)

        # Get members for this sub-branch
        mem_result = await session.execute(
            select(Member).where(Member.home_center_id == str(center.id))
        )
        members = mem_result.scalars().all()
        total_active_members = sum(1 for m in members if m.member_status == MemberStatusEnum.member)
        total_inactive_members = sum(1 for m in members if m.member_status != MemberStatusEnum.member)

        # Prepare branch data
        center_image_url = get_file_url(center.center_image) if center.center_image else None

        branch_data = [{
            "id": str(center.id),
            "center_name": center.center_name,
            "parent_center_id": str(center.parent_center_id),
            "center_category_id": str(center.center_category_id) if center.center_category_id else None,
            "center_category_name": category_name,
            "address_id": str(center.address_id) if center.address_id else None,
            "address": address,
            "center_email": admin_email,
            "center_phone": center.center_phone,
            "center_image_url": center_image_url,
            "approval_status": center.approval_status.value if center.approval_status else None,
            "center_status": center.center_status.value if center.center_status else None,
            "created_at": center.created_at,
            "updated_at": center.updated_at,
        }]

        return {
            "branches": branch_data,
            "total_centers": 1,
            "total_employees": total_employees,
            "total_active_members": total_active_members,
            "total_inactive_members": total_inactive_members
        }

    # Otherwise, parent center: show parent + all sub-branches
    # 1. Get parent branch (parent_center_id is None)
    parent_branch_data = {
        "id": str(center.id),
        "center_name": center.center_name,
        "parent_center_id": None,
        "center_category_id": str(center.center_category_id) if center.center_category_id else None,
        "center_category_name": None,  # You can fetch category name if needed
        "address_id": str(center.address_id) if center.address_id else None,
        "address": {},  # You can fetch address details if needed
        "center_email": center.center_email,
        "center_phone": center.center_phone,
        "center_image_url": get_file_url(center.center_image) if center.center_image else None,
        "approval_status": center.approval_status.value if center.approval_status else None,
        "center_status": center.center_status.value if center.center_status else None,
        "created_at": center.created_at,
        "updated_at": center.updated_at,
    }

    # 2. Get all sub-branches (exclude parent center)
    result = await session.execute(
        select(Center).where(Center.parent_center_id == parent_center_id)
    )
    centers = result.scalars().all()
    center_ids = [str(c.id) for c in centers]

    # 3. Total count of centers (parent + sub-branches)
    total_centers = 1 + len(centers)

    # 4. Total employees in all these centers (parent + sub-branches)
    all_center_ids = [str(parent_center_id)] + center_ids
    emp_result = await session.execute(
        select(Employee).where(Employee.center_id.in_(all_center_ids))
    )
    employees = emp_result.scalars().all()
    total_employees = len(employees)

    # 5. Total active/inactive members in all these centers (parent + sub-branches)
    mem_result = await session.execute(
        select(Member).where(Member.home_center_id.in_(all_center_ids))
    )
    members = mem_result.scalars().all()
    total_active_members = sum(1 for m in members if m.member_status == MemberStatusEnum.member)
    total_inactive_members = sum(1 for m in members if m.member_status != MemberStatusEnum.member)

    # 6. Batch fetch related data for sub-branches only
    category_ids = [c.center_category_id for c in centers if c.center_category_id]
    address_ids = [c.address_id for c in centers if c.address_id]

    # Fetch all categories
    categories = {}
    if category_ids:
        cat_result = await session.execute(
            select(CenterCategory).where(CenterCategory.id.in_(category_ids))
        )
        for cat in cat_result.scalars().all():
            categories[str(cat.id)] = cat.name

    # Fetch all addresses
    addresses = {}
    if address_ids:
        addr_result = await session.execute(
            select(Address).where(Address.id.in_(address_ids))
        )
        for addr in addr_result.scalars().all():
            addresses[str(addr.id)] = {
                "address_line_1": addr.address_line_1,
                "address_line_2": addr.address_line_2,
                "city": addr.city,
                "district": addr.district,
                "state": addr.state,
                "country": addr.country,
                "postal_code": addr.postal_code,
            }

    # Fetch all center admins for these branches
    center_admins = {}
    if center_ids:
        admin_result = await session.execute(
            select(CenterAdmin).where(CenterAdmin.center_id.in_(center_ids))
        )
        for admin in admin_result.scalars().all():
            center_admins[str(admin.center_id)] = admin.email

    # 7. Prepare branch data (sub-branches only)
    branch_data = []
    for c in centers:
        center_image_url = get_file_url(c.center_image) if c.center_image else None
        branch_data.append({
            "id": str(c.id),
            "center_name": c.center_name,
            "parent_center_id": str(c.parent_center_id) if c.parent_center_id else None,
            "center_category_id": str(c.center_category_id) if c.center_category_id else None,
            "center_category_name": categories.get(str(c.center_category_id)),
            "address_id": str(c.address_id) if c.address_id else None,
            "address": addresses.get(str(c.address_id), {}),
            "center_email": center_admins.get(str(c.id)),
            "center_phone": c.center_phone,
            "center_image_url": center_image_url,
            "approval_status": c.approval_status.value if c.approval_status else None,
            "center_status": c.center_status.value if c.center_status else None,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        })

    # 8. Combine parent branch and sub-branches
    all_branches = [parent_branch_data] + branch_data

    return {
        "branches": all_branches,
        "total_centers": total_centers,
        "total_employees": total_employees,
        "total_active_members": total_active_members,
        "total_inactive_members": total_inactive_members
    }

