from fastapi import APIRouter, Body, Depends, HTTPException, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.platforms.models.models import PlatformBranchSetting
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.core.dependencies import superadmin_required, centeradmin_required
from app.auth.models.models import CenterAdmin
from app.core.security import get_password_hash
from app.settings.models.models import Address
from app.billing.models.models import PaymentOrder, PaymentOrderStatus
from app.center.models.models import Center
from uuid import uuid4
from datetime import datetime

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
    # Get the current branching price from settings
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    price = float(setting.value) if setting else 0.0
    total_amount = branch_count * price

    # Create payment order (simulate payment success)
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        center_id=current_admin["center_id"],
        payer_user_id=current_admin["user_id"],
        payer_type="center_admin",
        payee_type="platform",
        order_type="add_on",  # Use the correct enum value as per your DB
        reference_schema="center",
        reference_id=current_admin["center_id"],
        subtotal_amount=total_amount,
        tax_amount=0.0,
        total_amount=total_amount,
        currency="INR",
        status="paid",
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(payment_order)

    # Fetch the parent center and increment branch_count if it is a parent (parent_center_id is None)
    parent_center = await session.get(Center, current_admin["center_id"])
    total_branch_count = None
    if parent_center and parent_center.parent_center_id is None:
        parent_center.branch_count = (parent_center.branch_count or 0) + branch_count
        total_branch_count = parent_center.branch_count

    await session.commit()
    return {
        "branch_count": branch_count,
        "branching_price": price,
        "total_amount": total_amount,
        "payment_order_id": str(payment_order.payment_order_id),
        "payment_status": "success",
        "total_branch_count": total_branch_count
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
            PaymentOrder.order_type == "add_on"
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
    data: dict = Body(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
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

    # 3. Validate required fields
    required_fields = ["name", "center_category_id", "address", "center_email", "password"]
    for field in required_fields:
        if field not in data:
            raise HTTPException(400, f"Missing required field: {field}")

    # 4. Validate address fields
    address = data["address"]
    required_addr_fields = [
        "address_line_1", "address_line_2", "city", "district", "state", "country", "postal_code"
    ]
    for field in required_addr_fields:
        if field not in address:
            raise HTTPException(400, f"Missing address field: {field}")

    # 5. Create Address
    address_obj = Address(
        id=uuid4(),
        address_line_1=address["address_line_1"],
        address_line_2=address["address_line_2"],
        city=address["city"],
        district=address["district"],
        state=address["state"],
        country=address["country"],
        postal_code=address["postal_code"],
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(address_obj)
    await session.flush()

    # 6. Create branch center
    branch = Center(
        id=uuid4(),
        parent_center_id=parent_center_id,
        center_name=data["name"],
        center_category_id=data["center_category_id"],
        address_id=address_obj.id,
        approval_status="approved",
        center_status="active",
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(branch)
    await session.flush()

    # 7. Create CenterAdmin for the new branch
    # Check for duplicate email
    existing_admin = await session.execute(
        select(CenterAdmin).where(CenterAdmin.email == data["center_email"])
    )
    if existing_admin.scalar_one_or_none():
        raise HTTPException(400, "A center admin with this email already exists.")

    # Use email prefix as full_name
    full_name = data["center_email"].split("@")[0]

    center_admin = CenterAdmin(
        id=uuid4(),
        full_name=full_name,
        email=data["center_email"],
        password_hash=get_password_hash(data["password"]),
        center_id=branch.id,
        is_approved=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        status="active"
    )
    session.add(center_admin)

    await session.commit()
    return {
        "parent_center_id": str(parent_center_id),
        "branch_id": str(branch.id),
        "center_admin_id": str(center_admin.id),
        "center_admin_email": center_admin.email,
        "detail": "Branch and center admin created successfully"
    }


