from app.core.models.models import StatusEnum, User
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Query, Path
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.membership.models.models import Membership, MembershipFeature
from app.membership.schema.schema import MembershipCreate, MemberCreate, MemberUpdate ,GuestRegisterIn
from app.auth.models.models import Member, MemberStatusEnum
from app.core.security import get_password_hash, generate_random_password
from app.membership.models.models import MemberMembership, Membership, MembershipActionTypeEnum
from app.settings.models.models import Address
from app.core.models.models import GenderEnum
from datetime import datetime, date
from app.core.database import get_async_session
from app.auth.models.models import CenterAdmin
from app.core.dependencies import centeradmin_required, get_current_user, member_required
from app.s3.service import upload_file, get_file_url
from uuid import uuid4
from sqlalchemy import select, func
from app.membership.schema.schema import MembershipOut, MembershipOutMini , MembershipFeatureIn, MembershipFeatureOut , TimeSlotChangeRequestIn
from sqlalchemy.orm import selectinload
from dateutil.relativedelta import relativedelta
from random import randint
from app.center.models.models import CenterTimeSlot, TimeSlotChangeRequest,  TimeSlotChangeStatus, TimeSlotChangeType, Center
router = APIRouter()

#create membership plan
@router.post("/memberships-plans", response_model=MembershipOut, status_code=201)
async def create_membership_plan(
    payload: MembershipCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    user = await db.get(User, current_user["user_id"])
    if not user or user.role != "centeradmin":
        raise HTTPException(status_code=403, detail="Not a center admin")
    result = await db.execute(
        select(CenterAdmin.center_id).where(CenterAdmin.id == user.id)
    )
    center_id = result.scalar_one_or_none()
    if not center_id:
        raise HTTPException(status_code=403, detail="CenterAdmin record not found or no center assigned")

    membership_code = f"{str(center_id)[:8].upper()}-{randint(1000, 9999)}"

    membership = Membership(
        membership_id=uuid4(),
        center_id=center_id,
        membership_name=payload.membership_name,
        membership_code=membership_code,
        description=payload.description,
        duration_count=payload.duration_count,
        duration_unit=payload.duration_unit,
        default_price=payload.default_price,
        status=StatusEnum.active,
        network_enabled=payload.network_enabled if hasattr(payload, "network_enabled") else False,
        created_by=user.id,
        updated_by=user.id,
    )
    db.add(membership)
    await db.flush()

    features = []
    for feature_name in payload.membership_features:
        feat = MembershipFeature(
            membership_id=membership.membership_id,
            feature_name=feature_name,
            feature_description=None,
            created_by=user.id,
            updated_by=user.id,
        )
        db.add(feat)
        features.append(feat)

    await db.commit()
    await db.refresh(membership)

    return MembershipOut(
        membership_id=str(membership.membership_id),
        center_id=str(membership.center_id),
        membership_name=membership.membership_name,
        membership_code=membership.membership_code,
        description=membership.description,
        duration_count=membership.duration_count,
        duration_unit=membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit,
        default_price=float(membership.default_price),
        status=membership.status.value,
        network_enabled=membership.network_enabled,
        membership_features=[
            MembershipFeatureOut(
                id=str(feat.id),
                feature_name=feat.feature_name,
                feature_description=feat.feature_description,
            ) for feat in features
        ]
    )



# #List Membership Plans (superadmin, centeradmin, member)
@router.get("/memberships-plans", response_model=List[MembershipOut])
async def list_membership_plans(
    status: str = Query(None, pattern="^(active|inactive)$"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    from app.auth.models.models import CenterAdmin, Member
    from app.core.models.models import StatusEnum

    role = current_user["role"]
    query = select(Membership).options(selectinload(Membership.membership_features))

    if role == "centeradmin":
        center_admin = await db.get(CenterAdmin, current_user["user_id"])
        if not center_admin:
            raise HTTPException(status_code=403, detail="Not a center admin")
        query = query.where(Membership.center_id == center_admin.center_id)
    elif role == "member":
        member = await db.get(Member, current_user["user_id"])
        if not member:
            raise HTTPException(status_code=403, detail="Not a member")
        query = query.where(Membership.center_id == member.home_center_id)
    # else: superadmin or other roles get all

    if status:
        # Convert string to enum for correct comparison
        query = query.where(Membership.status == StatusEnum[status])

    result = await db.execute(query)
    memberships = result.scalars().all()
    return [
        MembershipOut(
            membership_id=str(m.membership_id),
            center_id=str(m.center_id),
            membership_name=m.membership_name,
            membership_code=m.membership_code,
            description=m.description,
            duration_count=m.duration_count,
            duration_unit=m.duration_unit.value if hasattr(m.duration_unit, "value") else m.duration_unit,
            default_price=float(m.default_price),
            status=m.status.value,
            network_enabled=m.network_enabled,
            membership_features=[
                MembershipFeatureOut(
                    id=str(f.id),
                    feature_name=f.feature_name,
                    feature_description=f.feature_description
                ) for f in m.membership_features
            ]
        )
        for m in memberships
    ]

#list membership plans with minium data
@router.get("/memberships-plans-mini", response_model=List[MembershipOutMini])
async def list_membership_plans(
    status: str = Query(None, pattern="^(active|inactive)$"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    from app.auth.models.models import CenterAdmin, Member
    from app.core.models.models import StatusEnum

    role = current_user["role"]
    query = select(Membership).options(selectinload(Membership.membership_features))

    if role == "centeradmin":
        center_admin = await db.get(CenterAdmin, current_user["user_id"])
        if not center_admin:
            raise HTTPException(status_code=403, detail="Not a center admin")
        query = query.where(Membership.center_id == center_admin.center_id)
    elif role == "member":
        member = await db.get(Member, current_user["user_id"])
        if not member:
            raise HTTPException(status_code=403, detail="Not a member")
        query = query.where(Membership.center_id == member.home_center_id)
    # else: superadmin or other roles get all

    if status:
        # Convert string to enum for correct comparison
        query = query.where(Membership.status == StatusEnum[status])

    result = await db.execute(query)
    memberships = result.scalars().all()
    return [
        MembershipOutMini(
            membership_id=str(m.membership_id),
            membership_name=m.membership_name,
            default_price=float(m.default_price)
        )
        for m in memberships
    ]



# # #Get Membership Plan by ID (superadmin, centeradmin, member)
@router.get("/memberships-plans/{membership_id}", response_model=MembershipOut)
async def get_membership_plan(
    membership_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    result = await db.execute(
        select(Membership)
        .options(selectinload(Membership.membership_features))
        .where(Membership.membership_id == membership_id)
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    return MembershipOut(
        membership_id=str(membership.membership_id),
            center_id=str(membership.center_id),
            membership_name=membership.membership_name,
            membership_code=membership.membership_code,
            description=membership.description,
            duration_count=membership.duration_count,
            duration_unit=membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit,
            default_price=float(membership.default_price),
            status=membership.status.value,
            network_enabled=membership.network_enabled,
            membership_features=[
                MembershipFeatureOut(
                    id=str(f.id),
                    feature_name=f.feature_name,
                    feature_description=f.feature_description
                ) for f in membership.membership_features
            ]
    )


# # #Update Membership Plan (centeradmin only)
@router.put("/memberships-plans/{membership_id}", response_model=MembershipOut)
async def update_membership_plan(
    membership_id: str,
    payload: MembershipCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    membership = await db.get(Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if membership.center_id != center_admin.center_id:
        raise HTTPException(status_code=403, detail="Not allowed to update this plan")

    # Update fields
    for field, value in payload.dict(exclude={"membership_features"}).items():
        setattr(membership, field, value)
    membership.updated_by = current_user["user_id"]
    membership.updated_at = datetime.utcnow()

    # Remove all existing features (async-safe)
    await db.execute(
        MembershipFeature.__table__.delete().where(
            MembershipFeature.membership_id == membership.membership_id
        )
    )
    await db.flush()

    # Add new features
    features = []
    for feature_name in payload.membership_features:
        feat = MembershipFeature(
            membership_id=membership.membership_id,
            feature_name=feature_name,
            feature_description=None,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
        )
        db.add(feat)
        features.append(feat)

    await db.commit()
    await db.refresh(membership)

    # Query features again to get their IDs (if needed)
    result = await db.execute(
        select(MembershipFeature).where(MembershipFeature.membership_id == membership.membership_id)
    )
    features = result.scalars().all()

    return MembershipOut(
        membership_id=str(membership.membership_id),
        center_id=str(membership.center_id),
        membership_name=membership.membership_name,
        membership_code=membership.membership_code,
        description=membership.description,
        duration_count=membership.duration_count,
        duration_unit=membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit,
        default_price=float(membership.default_price),
        status=membership.status.value,
        network_enabled=membership.network_enabled,
        membership_features=[
            MembershipFeatureOut(
                id=str(f.id),
                feature_name=f.feature_name,
                feature_description=f.feature_description
            ) for f in features
        ]
    )


# # #Delete Membership Plan (centeradmin only)
@router.delete("/memberships-plans/{membership_id}")
async def delete_membership_plan(
    membership_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    membership = await db.get(Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    await db.delete(membership)
    await db.commit()
    return {"detail": "Membership plan deleted"}

# #Activate/Inactivate Membership Plan (centeradmin only)
@router.patch("/memberships-plans/{membership_id}/status")
async def set_membership_plan_status(
    membership_id: str,
    status: str = Query(..., pattern="^(active|inactive)$"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    membership = await db.get(Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if membership.center_id != center_admin.center_id:
        raise HTTPException(status_code=403, detail="Not allowed to change status of this plan")
    membership.status = StatusEnum(status)
    membership.updated_by = current_user["user_id"]
    membership.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(membership)
    return {"detail": f"Membership plan status set to {status}"}


#create member, visitor, gust
@router.post("/center/members", status_code=201)
async def create_member(
    payload: MemberCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    
    print(f"[DEBUG] Called create_member for email={payload.email}, center_id={payload.center_id}")

    from app.billing.models.models import PaymentOrder, PaymentOrderStatus, PaymentMethod
    from app.accounts.helpers import auto_record_payment_in_accounts
    from app.settings.models.models import TaxCategory, TaxScope

    # Get logged-in centeradmin and their center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Validate center_id in payload
    from app.center.models.models import Center
    target_center = await db.get(Center, payload.center_id)
    if not target_center:
        raise HTTPException(status_code=404, detail="Center not found")

    # Check if admin is parent or sub-branch
    if target_center.parent_center_id:
        if admin_center_id != str(target_center.id):
            raise HTTPException(status_code=403, detail="Sub-branch admin can only create members in their own center")
    else:
        if admin_center_id != str(target_center.id):
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(target_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="You can only create members in your own center or sub-branches")

    # --- EMAIL & PHONE VALIDATION ---
    # Check for duplicate email in the same center
    email_query = await db.execute(
        select(Member).where(
            Member.email == payload.email,
            Member.home_center_id == target_center.id
        )
    )
    existing_email_member = email_query.scalar_one_or_none()
    if existing_email_member:
        raise HTTPException(status_code=400, detail="A member with this email already exists in this center.")

    # Check for duplicate mobile in the same center
    if payload.mobile:
        mobile_query = await db.execute(
            select(Member).where(
                Member.mobile == payload.mobile,
                Member.home_center_id == target_center.id
            )
        )
        existing_mobile_member = mobile_query.scalar_one_or_none()
        if existing_mobile_member:
            raise HTTPException(status_code=400, detail="A member with this mobile number already exists in this center.")

    # Validate membership plan if provided
    membership = None
    if payload.membership_id:
        membership = await db.get(Membership, payload.membership_id)
        if not membership or str(membership.center_id) != str(target_center.id):
            raise HTTPException(status_code=400, detail="Selected membership plan does not belong to the target center")

    # Validate time slot if provided
    if payload.time_slot_id:
        time_slot = await db.get(CenterTimeSlot, payload.time_slot_id)
        if not time_slot or str(time_slot.center_id) != str(target_center.id):
            raise HTTPException(status_code=400, detail="Selected time slot does not belong to the target center")

    # Create Address
    address = Address(
        id=uuid4(),
        address_line_1=payload.address_line_1,
        address_line_2=payload.address_line_2,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        postal_code=payload.postal_code,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(address)
    await db.flush()

    # Password logic
    password = None
    if payload.member_status in ["member", "lead"]:
        if payload.payment_status == "unpaid":
            password = generate_random_password()
        elif payload.payment_status == "paid":
            if not payload.password:
                raise HTTPException(status_code=400, detail="Password required for paid member")
            password = payload.password
        else:
            password = generate_random_password()
    elif payload.member_status in ["visitor", "guest"]:
        password = generate_random_password()
    else:
        raise HTTPException(status_code=400, detail="Invalid member_status")

    # Create Member
    member = Member(
        id=uuid4(),
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(password),
        role="member",
        status=StatusEnum.active,
        gender=GenderEnum(payload.gender) if payload.gender else None,
        mobile=payload.mobile,
        profile_photo=None,
        home_center_id=target_center.id,
        date_of_birth=payload.date_of_birth,
        blood_group=payload.blood_group,
        time_slot_id=payload.time_slot_id,
        member_status=MemberStatusEnum(payload.member_status),
        address_id=address.id,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(member)
    await db.flush()

    # Only create MemberMembership and PaymentOrder if member_status is "member" or "lead" and membership is provided
    member_membership = None
    payment_order = None
    subtotal_amount = 0.0
    tax_amount = 0.0
    total_amount = 0.0
    applied_tax_rate = 0.0
    tax_warning_message = None

    if payload.member_status in ["member", "lead"] and membership:
        start_date = date.today()
        duration_unit = membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit
        if duration_unit == "month":
            end_date = start_date + relativedelta(months=membership.duration_count)
        elif duration_unit == "year":
            end_date = start_date + relativedelta(years=membership.duration_count)
        elif duration_unit == "day":
            end_date = start_date + relativedelta(days=membership.duration_count)
        else:
            end_date = None

        # Automatically fetch tax category with tax_scope = "membership"
        subtotal_amount = float(membership.default_price)
        tax_amount = 0.0
        tax_category_id = None
        applied_tax_rate = 0.0
        tax_warning_message = None

        # Query for active tax category with tax_scope = "membership"
        tax_result = await db.execute(
            select(TaxCategory).where(
                TaxCategory.tax_scope == TaxScope.membership,
                TaxCategory.is_active == True
            ).limit(1)
        )
        tax_category = tax_result.scalar_one_or_none()

        if tax_category:
            # Tax category found - calculate tax
            tax_amount = subtotal_amount * (float(tax_category.tax_percentage) / 100)
            tax_category_id = tax_category.id
            applied_tax_rate = float(tax_category.tax_percentage)
        else:
            # No tax category found - set warning message
            tax_warning_message = "Tax category for membership not found. Please add it in settings."

        total_amount = subtotal_amount + tax_amount

        # Create MemberMembership with tax info
        member_membership = MemberMembership(
            id=uuid4(),
            member_id=member.id,
            membership_id=payload.membership_id,
            center_id=target_center.id,
            start_date=start_date,
            end_date=end_date,
            tax_category_id=tax_category_id,
            total_amount=total_amount,
            membership_status=StatusEnum.active,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            action_type=MembershipActionTypeEnum.created
        )
        db.add(member_membership)
        await db.flush()

        # Only create PaymentOrder if payment_status is "paid"
        if hasattr(payload, "payment_status") and payload.payment_status == "paid":
            if not hasattr(payload, "payment_method") or not payload.payment_method:
                raise HTTPException(status_code=400, detail="payment_method required for paid member")

            try:
                payment_status_enum = PaymentOrderStatus(payload.payment_status)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid payment_status")

            try:
                payment_method_enum = PaymentMethod(payload.payment_method)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid payment_method")

            payment_order = PaymentOrder(
                payment_order_id=uuid4(),
                payer_user_id=member.id,
                payer_type="user",
                payee_type="center",
                center_id=target_center.id,
                order_type="membership",
                reference_schema="center",
                reference_id=member_membership.id,
                subtotal_amount=subtotal_amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                currency="INR",
                status=payment_status_enum,
                payment_method=payment_method_enum,
                created_by=current_user["user_id"],
                updated_by=current_user["user_id"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(payment_order)
            await db.flush()

            # AUTO-RECORD IN ACCOUNTING MODULE
            await auto_record_payment_in_accounts(
            db=db,
            payment_order=payment_order,
            created_by=current_user["user_id"]
        )

    # 6. Commit all at once
    await db.commit()


    # Build response
    response_data = {
        "id": str(member.id),
        "email": member.email,
        "full_name": member.full_name,
        "mobile": member.mobile,
        "gender": member.gender.value if member.gender else None,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "address_id": str(address.id),
        "address": address.address_line_1 + " " + (address.address_line_2 or ""),
        "city": address.city,
        "state": address.state,
        "country": address.country,
        "postal_code": address.postal_code,
        "center_id": str(target_center.id),
        "membership_id": str(payload.membership_id) if payload.membership_id else None,
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "member_status": member.member_status.value,
        "payment_method": payload.payment_method if hasattr(payload, "payment_method") else None,
        "payment_status": payload.payment_status if hasattr(payload, "payment_status") else None,
        "payment_order_id": str(payment_order.payment_order_id) if payment_order else None,
        "subtotal_amount": subtotal_amount if membership else None,
        "tax_amount": tax_amount if membership else None,
        "tax_rate": applied_tax_rate if membership else None,
        "total_amount": total_amount if membership else None,
        "password": password if password else None,
        "status": member.status.value,
    }

    # Add tax warning message if tax category not found
    if tax_warning_message:
        response_data["tax_warning"] = tax_warning_message

    return response_data



#Get Member by ID (centeradmin can get their own and sub-branch members; sub-branch admin only their own)
@router.get("/center/members/{member_id}")
async def get_member_by_id(
    member_id: str = Path(..., description="Member ID"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Get the member with relationships loaded
    result = await db.execute(
        select(Member)
        .options(selectinload(Member.member_memberships))
        .where(Member.id == member_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Get the member's center
    from app.center.models.models import Center, CenterTimeSlot
    member_center = await db.get(Center, member.home_center_id)
    if not member_center:
        raise HTTPException(status_code=404, detail="Member's center not found")

    # Access control
    if member_center.parent_center_id:
        if admin_center_id != str(member_center.id) and admin_center_id != str(member_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not allowed to access this member")
    else:
        if admin_center_id != str(member_center.id):
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(member_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not allowed to access this member")

    # Get address details (fallback to member fields if address_id is missing)
    address = None
    if member.address_id:
        address_obj = await db.get(Address, member.address_id)
        if address_obj:
            address = {
                "id": str(address_obj.id),
                "address_type": address_obj.address_type.value if address_obj.address_type else None,
                "address_line_1": address_obj.address_line_1,
                "address_line_2": address_obj.address_line_2,
                "city": address_obj.city,
                "district": address_obj.district,
                "state": address_obj.state,
                "country": address_obj.country,
                "postal_code": address_obj.postal_code,
                "latitude": float(address_obj.latitude) if address_obj.latitude else None,
                "longitude": float(address_obj.longitude) if address_obj.longitude else None,
                "is_primary": address_obj.is_primary,
                "status": address_obj.status.value if address_obj.status else None,
            }
    else:
        address = {
            "address_line_1": getattr(member, "address_line_1", None),
            "address_line_2": getattr(member, "address_line_2", None),
            "city": getattr(member, "city", None),
            "state": getattr(member, "state", None),
            "country": getattr(member, "country", None),
            "postal_code": getattr(member, "postal_code", None),
        }

    # Get time slot details
    time_slot = None
    if member.time_slot_id:
        time_slot_obj = await db.get(CenterTimeSlot, member.time_slot_id)
        if time_slot_obj:
            time_slot = {
                "id": str(time_slot_obj.id),
                "start_time": time_slot_obj.start_time,
                "end_time": time_slot_obj.end_time,
                "slot_capacity": time_slot_obj.slot_capacity,
            }

    # Get latest membership info
    membership_id = None
    start_date = None
    end_date = None
    status_val = None
    if member.member_memberships:
        latest_mm = sorted(member.member_memberships, key=lambda mm: mm.start_date, reverse=True)[0]
        membership_id = latest_mm.membership_id
        start_date = latest_mm.start_date
        end_date = latest_mm.end_date
        status_val = latest_mm.membership_status.value if latest_mm.membership_status else None

    # Get latest payment status from PaymentOrder
    from app.billing.models.models import PaymentOrder
    payment_status_val = None
    payment_order_result = await db.execute(
        select(PaymentOrder)
        .where(PaymentOrder.payer_user_id == member.id)
        .order_by(PaymentOrder.created_at.desc())
    )
    payment_orders = payment_order_result.scalars().all()
    if payment_orders:
        payment_status_val = payment_orders[0].status.value if payment_orders[0].status else None
    return {
        "id": str(member.id),
        "full_name": member.full_name,
        "email": member.email,
        "mobile": member.mobile,
        "gender": member.gender.value if member.gender else None,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "address_id": str(member.address_id) if member.address_id else None,
        "address": address,
        "home_center_id": str(member.home_center_id),
        "home_center_name": member_center.center_name if member_center else None,
        "center_name": member_center.center_name if member_center else None,
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "time_slot": time_slot,
        "membership_id": str(membership_id) if membership_id else None,
        "start_date": start_date,
        "end_date": end_date,
        "payment_status": payment_status_val,
        "member_status": member.member_status.value,
        "status": member.status.value,
        "created_at": member.created_at,
        "updated_at": member.updated_at,
    }


#Update Member by ID (centeradmin can update their own and sub-branch members; sub-branch admin only their own; all fields editable)
@router.patch("/center/members/{member_id}")
async def partial_update_member(
    member_id: str,
    payload: MemberUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.membership.models.models import MemberMembership, Membership, MembershipActionTypeEnum
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    update_fields = payload.dict(exclude_unset=True)
    address_fields = ["address_line_1", "address_line_2", "city", "state", "country", "postal_code"]

    # Update or create address if address fields are present
    if any(field in update_fields for field in address_fields):
        from app.settings.models.models import Address
        if member.address_id:
            address_obj = await db.get(Address, member.address_id)
            if address_obj:
                for field in address_fields:
                    if field in update_fields:
                        setattr(address_obj, field, update_fields[field])
                address_obj.updated_at = datetime.utcnow()
                address_obj.updated_by = current_user["user_id"]
                await db.flush()
        else:
            address_obj = Address(
                id=uuid4(),
                address_line_1=update_fields.get("address_line_1"),
                address_line_2=update_fields.get("address_line_2"),
                city=update_fields.get("city"),
                state=update_fields.get("state"),
                country=update_fields.get("country"),
                postal_code=update_fields.get("postal_code"),
                created_by=current_user["user_id"],
                updated_by=current_user["user_id"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(address_obj)
            await db.flush()
            member.address_id = address_obj.id

    # Update member fields
    for field, value in update_fields.items():
        if hasattr(member, field) and field not in address_fields:
            setattr(member, field, value)
    member.updated_at = datetime.utcnow()
    member.updated_by = current_user["user_id"]

    # If membership_id is present, create a new MemberMembership record (plan change)
    if "membership_id" in update_fields and update_fields["membership_id"]:
        membership = await db.get(Membership, update_fields["membership_id"])
        if not membership:
            raise HTTPException(status_code=404, detail="Membership plan not found")

        # Calculate start and end date for new membership
        now = datetime.utcnow()
        duration_unit = membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit
        duration_count = membership.duration_count
        if duration_unit == "day":
            end_date = now + relativedelta(days=duration_count)
        elif duration_unit == "month":
            end_date = now + relativedelta(months=duration_count)
        elif duration_unit == "year":
            end_date = now + relativedelta(years=duration_count)
        else:
            raise HTTPException(status_code=400, detail="Invalid duration unit in membership plan")

        # Tax calculation (optional, can be expanded as needed)
        subtotal_amount = float(membership.default_price)
        tax_amount = 0.0
        applied_tax_rate = 0.0
        tax_category_id = None
        from app.settings.models.models import TaxCategory, TaxScope
        tax_result = await db.execute(
            select(TaxCategory).where(
                TaxCategory.tax_scope == TaxScope.membership,
                TaxCategory.is_active == True
            ).limit(1)
        )
        tax_category = tax_result.scalar_one_or_none()
        if tax_category:
            applied_tax_rate = float(tax_category.tax_percentage)
            tax_category_id = tax_category.id
            tax_amount = subtotal_amount * applied_tax_rate / 100.0
        total_amount = subtotal_amount + tax_amount

        member_membership = MemberMembership(
            id=uuid4(),
            member_id=member.id,
            membership_id=membership.membership_id,
            center_id=member.home_center_id,
            start_date=now,
            end_date=end_date,
            tax_category_id=tax_category_id,
            total_amount=total_amount,
            auto_renewal_enabled=False,
            membership_status=StatusEnum.active,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            action_type=MembershipActionTypeEnum.plan_change  # <-- Set action_type
        )
        db.add(member_membership)

    await db.commit()
    await db.refresh(member)

    # Fetch updated address for response
    address_obj = None
    if member.address_id:
        from app.settings.models.models import Address
        address_obj = await db.get(Address, member.address_id)

    # Fetch latest MemberMembership for response
    result = await db.execute(
        select(MemberMembership)
        .where(MemberMembership.member_id == member.id)
        .order_by(MemberMembership.start_date.desc())
    )
    member_memberships = result.scalars().all()
    membership_id = None
    if member_memberships:
        membership_id = str(member_memberships[0].membership_id)

    return {
        "id": str(member.id),
        "full_name": member.full_name,
        "email": member.email,
        "mobile": member.mobile,
        "gender": member.gender.value if member.gender else None,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "address_id": str(member.address_id) if member.address_id else None,
        "address": {
            "address_line_1": address_obj.address_line_1 if address_obj else None,
            "address_line_2": address_obj.address_line_2 if address_obj else None,
            "city": address_obj.city if address_obj else None,
            "state": address_obj.state if address_obj else None,
            "country": address_obj.country if address_obj else None,
            "postal_code": address_obj.postal_code if address_obj else None,
        } if address_obj else None,
        "home_center_id": str(member.home_center_id),
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "member_status": member.member_status.value,
        "status": member.status.value,
        "membership_id": membership_id,
        "created_at": member.created_at,
        "updated_at": member.updated_at,
    }


#list all members of a center (centeradmin can see their own and sub-branch members; sub-branch admin only their own)
@router.get("/center/members", response_model=dict)
async def list_center_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by member status (active/inactive)"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status (paid/unpaid)"),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.center.models.models import Center, CenterTimeSlot
    from app.auth.models.models import CenterAdmin, Member, MemberStatusEnum
    from app.settings.models.models import Address
    from app.membership.models.models import MemberMembership
    from app.billing.models.models import PaymentOrder

    # Get logged-in centeradmin and their center_id
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Determine allowed center IDs
    center = await session.get(Center, admin_center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")

    if center.parent_center_id:
        allowed_center_ids = [admin_center_id]
    else:
        sub_centers_result = await session.execute(
            select(Center.id).where(Center.parent_center_id == admin_center_id)
        )
        sub_center_ids = [str(row[0]) for row in sub_centers_result.fetchall()]
        allowed_center_ids = [admin_center_id] + sub_center_ids

    # Base query for members with role 'member' and member_status 'member'
    member_query = select(Member).where(
        Member.home_center_id.in_(allowed_center_ids),
        Member.role == "member",
        Member.member_status == MemberStatusEnum.member
    )
    if status:
        member_query = member_query.where(Member.status == status)
    member_query = member_query.offset((page - 1) * page_size).limit(page_size)
    member_result = await session.execute(member_query)
    members = member_result.scalars().all()

    # For payment_status filter, check latest PaymentOrder for each member
    filtered_members = []
    for m in members:
        payment_order_result = await session.execute(
            select(PaymentOrder)
            .where(PaymentOrder.payer_user_id == m.id)
            .order_by(PaymentOrder.created_at.desc())
        )
        payment_orders = payment_order_result.scalars().all()
        latest_payment_status = None
        if payment_orders:
            latest_payment_status = payment_orders[0].status.value if payment_orders[0].status else None

        # Apply payment_status filter
        if payment_status:
            if payment_status == "paid" and latest_payment_status != "paid":
                continue
            if payment_status == "unpaid" and latest_payment_status == "paid":
                continue

        filtered_members.append((m, latest_payment_status))

    # Pagination total
    count_query = select(func.count()).select_from(Member).where(
        Member.home_center_id.in_(allowed_center_ids),
        Member.role == "member",
        Member.member_status == MemberStatusEnum.member
    )
    if status:
        count_query = count_query.where(Member.status == status)
    total_filtered_result = await session.execute(count_query)
    total_filtered = total_filtered_result.scalar_one()

    # Serialize members
    async def serialize_member(m, payment_status_val):
        # Address details
        address = None
        if m.address_id:
            address_obj = await session.get(Address, m.address_id)
            if address_obj:
                address = {
                    "id": str(address_obj.id),
                    "address_line_1": address_obj.address_line_1,
                    "address_line_2": address_obj.address_line_2,
                    "city": address_obj.city,
                    "state": address_obj.state,
                    "country": address_obj.country,
                    "postal_code": address_obj.postal_code,
                }
        else:
            address = {
                "address_line_1": None,
                "address_line_2": None,
                "city": None,
                "state": None,
                "country": None,
                "postal_code": None,
            }

        # Home center name
        home_center_name = None
        if m.home_center_id:
            center_obj = await session.get(Center, m.home_center_id)
            if center_obj:
                home_center_name = center_obj.center_name

        # Time slot details
        time_slot = None
        if m.time_slot_id:
            slot_obj = await session.get(CenterTimeSlot, m.time_slot_id)
            if slot_obj:
                time_slot = {
                    "id": str(slot_obj.id),
                    "start_time": slot_obj.start_time,
                    "end_time": slot_obj.end_time,
                    "slot_capacity": slot_obj.slot_capacity,
                }

        # Membership info (latest MemberMembership)
        membership_id = None
        start_date = None
        end_date = None
        result = await session.execute(
            select(MemberMembership)
            .where(MemberMembership.member_id == m.id)
            .order_by(MemberMembership.start_date.desc())
        )
        member_memberships = result.scalars().all()
        if member_memberships:
            latest_mm = member_memberships[0]
            membership_id = str(latest_mm.membership_id) if latest_mm.membership_id else None
            start_date = latest_mm.start_date
            end_date = latest_mm.end_date

        return {
            "id": str(m.id),
            "full_name": getattr(m, "full_name", None),
            "email": getattr(m, "email", None),
            "mobile": getattr(m, "mobile", None),
            "gender": m.gender.value if getattr(m, "gender", None) else None,
            "date_of_birth": getattr(m, "date_of_birth", None),
            "blood_group": getattr(m, "blood_group", None),
            "address_id": getattr(m, "address_id", None),
            "address": address,
            "home_center_id": str(getattr(m, "home_center_id", "")),
            "home_center_name": home_center_name,
            "time_slot_id": getattr(m, "time_slot_id", None),
            "time_slot": time_slot,
            "membership_id": membership_id,
            "start_date": start_date,
            "end_date": end_date,
            "payment_status": payment_status_val,
            "member_status": m.member_status.value if getattr(m, "member_status", None) else None,
            "status": m.status.value if getattr(m, "status", None) else None,
        }

    members_data = []
    for m, payment_status_val in filtered_members:
        members_data.append(await serialize_member(m, payment_status_val))

    return {
        "members": members_data,
        "page": page,
        "page_size": page_size,
        "total": total_filtered
        
    }


@router.delete("/center/members/{member_id}", status_code=204)
async def delete_member(
    member_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Handle time slot occupancy
    if member.time_slot_id:
        from app.center.models.models import CenterTimeSlot
        slot = await db.get(CenterTimeSlot, member.time_slot_id)
        if slot and hasattr(slot, "current_occupancy"):
            slot.current_occupancy = max(0, (slot.current_occupancy or 1) - 1)
            db.add(slot)

    await db.delete(member)
    await db.commit()
    return {"detail": "Member deleted"}

@router.get("/center/member-counts", response_model=dict)
async def get_center_member_counts(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Member, MemberStatusEnum
    from app.membership.models.models import MemberMembership
    from datetime import datetime

    # Get logged-in centeradmin and their center_id
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = str(center_admin.center_id)

    # Query all members for this center with role 'member' and member_status 'member'
    result = await session.execute(
        select(Member)
        .where(
            Member.home_center_id == center_id,
            Member.role == "member",
            Member.member_status == MemberStatusEnum.member
        )
    )
    members = result.scalars().all()

    now = datetime.utcnow()
    total_members = len(members)
    active_members = 0
    inactive_members = 0
    expired_members = 0

    for m in members:
        # status field comes from User model (inherited by Member)
        status_val = m.status.value if hasattr(m.status, "value") else m.status
        if status_val == "active":
            active_members += 1
        elif status_val == "inactive":
            inactive_members += 1

        # Expired calculation from latest MemberMembership
        mm_result = await session.execute(
            select(MemberMembership)
            .where(MemberMembership.member_id == m.id)
            .order_by(MemberMembership.start_date.desc())
        )
        member_memberships = mm_result.scalars().all()
        if member_memberships:
            latest_mm = member_memberships[0]
            if latest_mm.end_date and latest_mm.end_date < now:
                expired_members += 1

    return {
        "total_members": total_members,
        "active_members": active_members,
        "inactive_members": inactive_members,
        "expired_members": expired_members
    }


@router.patch("/center/members/{member_id}/status")
async def change_member_status(
    member_id: str,
    status: str = Query(..., pattern="^(active|inactive|suspended)$"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # Get logged-in centeradmin
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Get the member
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Get member's center
    from app.center.models.models import Center, CenterTimeSlot
    member_center = await db.get(Center, member.home_center_id)
    if not member_center:
        raise HTTPException(status_code=404, detail="Member's center not found")

    # Access control: only allow if member is in admin's center or sub-branch
    if member_center.parent_center_id:
        # Sub-branch center
        if admin_center_id != str(member_center.id) and admin_center_id != str(member_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not allowed to change status for this member")
    else:
        # Parent center
        if admin_center_id != str(member_center.id):
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(member_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not allowed to change status for this member")

    # Handle time slot occupancy
    if member.time_slot_id:
        slot = await db.get(CenterTimeSlot, member.time_slot_id)
        if slot and hasattr(slot, "current_occupancy"):
            # If member is being inactivated/suspended and was active, decrement occupancy
            if member.status == StatusEnum.active and status in ["inactive", "suspended"]:
                slot.current_occupancy = max(0, (slot.current_occupancy or 1) - 1)
                db.add(slot)
            # If member is being activated and was inactive/suspended, increment occupancy
            elif member.status in [StatusEnum.inactive, StatusEnum.suspended] and status == "active":
                slot.current_occupancy = (slot.current_occupancy or 0) + 1
                db.add(slot)

    # Change status
    member.status = StatusEnum(status)
    member.updated_at = datetime.utcnow()
    member.updated_by = current_user["user_id"]
    await db.commit()
    await db.refresh(member)
    return {
        "id": str(member.id),
        "status": member.status.value
    }


#list visitors of a center with search and pagination (centeradmin can see their own and sub-branch visitors; sub-branch admin only their own)
@router.get("/center/visitors", response_model=dict)
async def list_visitors_in_center(
    name: Optional[str] = Query(None, description="Search by full name"),
    phone: Optional[str] = Query(None, description="Search by mobile number"),
    email: Optional[str] = Query(None, description="Search by email"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Member, MemberStatusEnum
    from sqlalchemy import or_

    # Get the center admin and their center_id
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Build base query for visitors
    query = select(Member).where(
        Member.home_center_id == center_id,
        Member.role == "member",
        Member.member_status == MemberStatusEnum.visitor
    )

    # Add search filters if provided
    if name or phone or email:
        search_conditions = []
        if name:
            search_conditions.append(Member.full_name.ilike(f"%{name}%"))
        if phone:
            search_conditions.append(Member.mobile.ilike(f"%{phone}%"))
        if email:
            search_conditions.append(Member.email.ilike(f"%{email}%"))
        query = query.where(or_(*search_conditions))

    # Get total count for pagination
    count_query = select(func.count()).select_from(Member).where(
        Member.home_center_id == center_id,
        Member.role == "member",
        Member.member_status == MemberStatusEnum.visitor
    )
    if name or phone or email:
        search_conditions = []
        if name:
            search_conditions.append(Member.full_name.ilike(f"%{name}%"))
        if phone:
            search_conditions.append(Member.mobile.ilike(f"%{phone}%"))
        if email:
            search_conditions.append(Member.email.ilike(f"%{email}%"))
        count_query = count_query.where(or_(*search_conditions))
    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    visitors = result.scalars().all()

    # If visited_date is not set, assign created_at as visited_date and save
    updated = False
    for visitor in visitors:
        if visitor.visited_date is None:
            visitor.visited_date = visitor.created_at.date() if visitor.created_at else None
            session.add(visitor)
            updated = True
    if updated:
        await session.commit()

    # Return visitor info with pagination
    return {
        "visitors": [
            {
                "id": str(visitor.id),
                "full_name": visitor.full_name,
                "email": visitor.email,
                "mobile": visitor.mobile,
                "visited_date": str(visitor.visited_date) if visitor.visited_date else None
            }
            for visitor in visitors
        ],
        
            "page": page,
            "page_size": page_size,
            "total": total
    
    }

@router.get("/center/visitors/{visitor_id}", response_model=dict)
async def get_visitor_by_id(
    visitor_id: str = Path(..., description="Visitor ID"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Member, MemberStatusEnum
    from app.settings.models.models import Address
    from app.center.models.models import Center, CenterTimeSlot
    from app.billing.models.models import PaymentOrder

    # Get the center admin and their center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Get the visitor
    visitor = await db.get(Member, visitor_id)
    if not visitor or visitor.member_status != MemberStatusEnum.visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    # Access control: only allow if visitor is in admin's center or sub-branch
    visitor_center = await db.get(Center, visitor.home_center_id)
    if not visitor_center:
        raise HTTPException(status_code=404, detail="Visitor's center not found")
    if visitor_center.parent_center_id:
        if admin_center_id != str(visitor_center.id) and admin_center_id != str(visitor_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not allowed to access this visitor")
    else:
        if admin_center_id != str(visitor_center.id):
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(visitor_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not allowed to access this visitor")

    # Get address details
    address = None
    if visitor.address_id:
        address_obj = await db.get(Address, visitor.address_id)
        if address_obj:
            address = {
                "id": str(address_obj.id),
                "address_line_1": address_obj.address_line_1,
                "address_line_2": address_obj.address_line_2,
                "city": address_obj.city,
                "state": address_obj.state,
                "country": address_obj.country,
                "postal_code": address_obj.postal_code,
            }
    else:
        address = {
            "address_line_1": getattr(visitor, "address_line_1", None),
            "address_line_2": getattr(visitor, "address_line_2", None),
            "city": getattr(visitor, "city", None),
            "state": getattr(visitor, "state", None),
            "country": getattr(visitor, "country", None),
            "postal_code": getattr(visitor, "postal_code", None),
        }

    # Get time slot details
    time_slot = None
    if visitor.time_slot_id:
        time_slot_obj = await db.get(CenterTimeSlot, visitor.time_slot_id)
        if time_slot_obj:
            time_slot = {
                "id": str(time_slot_obj.id),
                "start_time": time_slot_obj.start_time,
                "end_time": time_slot_obj.end_time,
                "slot_capacity": time_slot_obj.slot_capacity,
            }

    # Get latest payment status from PaymentOrder
    payment_status_val = None
    payment_order_result = await db.execute(
        select(PaymentOrder)
        .where(PaymentOrder.payer_user_id == visitor.id)
        .order_by(PaymentOrder.created_at.desc())
    )
    payment_orders = payment_order_result.scalars().all()
    if payment_orders:
        payment_status_val = payment_orders[0].status.value if payment_orders[0].status else None

    return {
        "id": str(visitor.id),
        "full_name": visitor.full_name,
        "email": visitor.email,
        "mobile": visitor.mobile,
        "gender": visitor.gender.value if visitor.gender else None,
        "date_of_birth": visitor.date_of_birth,
        "blood_group": visitor.blood_group,
        "address_id": str(visitor.address_id) if visitor.address_id else None,
        "address": address,
        "home_center_id": str(visitor.home_center_id),
        "home_center_name": visitor_center.center_name if visitor_center else None,
        "time_slot_id": str(visitor.time_slot_id) if visitor.time_slot_id else None,
        "time_slot": time_slot,
        "visited_date": str(visitor.visited_date) if visitor.visited_date else None,
        "payment_status": payment_status_val,
        "member_status": visitor.member_status.value,
        "status": visitor.status.value,
        "created_at": visitor.created_at,
        "updated_at": visitor.updated_at,
    }



@router.get("/member/membership")
async def get_member_membership(
    current_member=Depends(member_required),
    session: AsyncSession = Depends(get_async_session)
):
    # Fetch MemberMembership with related Membership and Center
    result = await session.execute(
        select(MemberMembership)
        .options(
            selectinload(MemberMembership.membership),
            selectinload(MemberMembership.center)
        )
        .where(MemberMembership.member_id == current_member["user_id"])
    )
    member_membership = result.scalar_one_or_none()
    if not member_membership:
        return {"detail": "No membership found for this member."}

    membership = member_membership.membership
    center = member_membership.center

    # Fetch member to get time_slot_id
    member_result = await session.execute(
        select(Member).where(Member.id == current_member["user_id"])
    )
    member = member_result.scalar_one_or_none()
    time_slot_id = member.time_slot_id if member else None

    # Fetch time slot details if time_slot_id exists
    time_slot_details = None
    if time_slot_id:
        slot_result = await session.execute(
            select(CenterTimeSlot).where(CenterTimeSlot.id == time_slot_id)
        )
        slot = slot_result.scalar_one_or_none()
        if slot:
            time_slot_details = {
                "id": str(slot.id),
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "slot_capacity": slot.slot_capacity
            }

    # --- Time Slot Change Request Logic ---
    today = date.today()
    # Find any approved, active temporary slot change
    temp_req_result = await session.execute(
        select(TimeSlotChangeRequest)
        .where(
            TimeSlotChangeRequest.member_id == current_member["user_id"],
            TimeSlotChangeRequest.change_type == TimeSlotChangeType.temporary,
            TimeSlotChangeRequest.status == TimeSlotChangeStatus.approved,
            TimeSlotChangeRequest.start_date <= today,
            TimeSlotChangeRequest.end_date >= today
        )
        .order_by(TimeSlotChangeRequest.created_at.desc())
    )
    temp_req = temp_req_result.scalar_one_or_none()
    temp_time_slot_details = None
    if temp_req and temp_req.new_time_slot_id:
        temp_slot_result = await session.execute(
            select(CenterTimeSlot).where(CenterTimeSlot.id == temp_req.new_time_slot_id)
        )
        temp_slot = temp_slot_result.scalar_one_or_none()
        if temp_slot:
            temp_time_slot_details = {
                "id": str(temp_slot.id),
                "start_time": temp_slot.start_time,
                "end_time": temp_slot.end_time,
                "slot_capacity": temp_slot.slot_capacity
            }

    # Calculate days left and remaining days
    end_date = member_membership.end_date.date() if member_membership.end_date else None
    days_left = (end_date - today).days if end_date and end_date > today else 0

    # Determine if currently in temporary or permanent slot
    if temp_req:
        active_time_slot_type = "temporary"
        active_time_slot_id = str(temp_req.new_time_slot_id)
        active_time_slot_details = temp_time_slot_details
    else:
        active_time_slot_type = "permanent"
        active_time_slot_id = str(time_slot_id) if time_slot_id else None
        active_time_slot_details = time_slot_details

    return {
        "member_id": str(member_membership.member_id),
        "membership_id": str(member_membership.membership_id),
        "membership_name": membership.membership_name,
        "membership_code": membership.membership_code,
        "description": membership.description,
        "status": membership.status.value,
        "start_date": member_membership.start_date,
        "end_date": member_membership.end_date,
        "days_left": days_left,
        "remaining_days": days_left,
        "center_id": str(center.id) if center else None,
        "center_name": center.center_name if center else None,
        "permanent_time_slot_id": str(time_slot_id) if time_slot_id else None,
        "permanent_time_slot_details": time_slot_details,
        "active_time_slot_id": active_time_slot_id,
        "active_time_slot_details": active_time_slot_details,
        "active_time_slot_type": active_time_slot_type,  # <-- NEW FIELD
        "active_time_slot_change_request": {
            "id": str(temp_req.id),
            "start_date": str(temp_req.start_date),
            "end_date": str(temp_req.end_date),
            "reason": temp_req.reason,
        } if temp_req else None
    }


#List All Time Slots with Status
@router.get("/center/time-slots")
async def list_time_slots(
    center_id: str = None,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    role = current_user["role"]

    if role == "centeradmin":
        # Always use the centeradmin's own center
        result = await session.execute(
            select(CenterAdmin).where(CenterAdmin.id == current_user["user_id"])
        )
        center_admin = result.scalar_one_or_none()
        if not center_admin:
            raise HTTPException(status_code=404, detail="CenterAdmin not found")
        center_id = str(center_admin.center_id)
    elif role == "member":
        # Use provided center_id, or fallback to member's home_center_id
        if not center_id:
            result = await session.execute(
                select(Member).where(Member.id == current_user["user_id"])
            )
            member = result.scalar_one_or_none()
            if not member:
                raise HTTPException(status_code=404, detail="Member not found")
            center_id = str(member.home_center_id)
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all time slots for the center
    slots_result = await session.execute(
        select(CenterTimeSlot).where(CenterTimeSlot.center_id == center_id)
    )
    slots = slots_result.scalars().all()

    # Get member count per slot (from Member table)
    slot_ids = [slot.id for slot in slots]
    member_counts = {}
    if slot_ids:
        count_result = await session.execute(
            select(Member.time_slot_id, func.count(Member.id))
            .where(Member.time_slot_id.in_(slot_ids), Member.home_center_id == center_id)
            .group_by(Member.time_slot_id)
        )
        member_counts = dict(count_result.all())

    slot_list = []
    for slot in slots:
        count = member_counts.get(slot.id, 0)
        available = count < slot.slot_capacity
        slot_list.append({
            "id": str(slot.id),
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "slot_capacity": slot.slot_capacity,
            "current_count": count,
            "status": "available" if available else "not available"
        })
    return slot_list


#Time Slot Change Request
@router.post("/member/time-slot-change-request")
async def request_time_slot_change(
    payload: TimeSlotChangeRequestIn,
    current_member=Depends(member_required),
    session: AsyncSession = Depends(get_async_session)
):
    # Get member's current time slot
    member_result = await session.execute(
        select(Member).where(Member.id == current_member["user_id"])
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    old_time_slot_id = member.time_slot_id

    # Check new slot capacity
    slot_result = await session.execute(
        select(CenterTimeSlot).where(CenterTimeSlot.id == payload.new_time_slot_id)
    )
    slot = slot_result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")

    count_result = await session.execute(
        select(func.count(Member.id)).where(Member.time_slot_id == slot.id)
    )
    count = count_result.scalar_one()
    if count >= slot.slot_capacity:
        raise HTTPException(status_code=400, detail="Selected time slot is full")

    # Get the member's current membership end date
    membership_result = await session.execute(
        select(MemberMembership).where(MemberMembership.member_id == member.id)
    )
    member_membership = membership_result.scalar_one_or_none()
    membership_end_date = member_membership.end_date.date() if member_membership and member_membership.end_date else None

    # Set end_date for the request and response
    if payload.change_type == "permanent":
        end_date = membership_end_date
        print("end_date:", end_date)
        print("membership_end_date:", membership_end_date)

    else:
        end_date = payload.end_date  # For temporary, use the provided end_date

    # Create the time slot change request record
    req = TimeSlotChangeRequest(
        member_id=member.id,
        old_time_slot_id=old_time_slot_id,
        new_time_slot_id=payload.new_time_slot_id,
        change_type=payload.change_type,
        start_date=payload.start_date,
        end_date=end_date,
        reason=payload.reason,
        status=TimeSlotChangeStatus.pending
    )
    session.add(req)
    await session.commit()
    await session.refresh(req)

    # Always return the correct end_date and member_id in the response
    return {
        "detail": "Time slot change request submitted",
        "request_id": str(req.id),
        "member_id": str(member.id),
        "change_type": payload.change_type,
        "start_date": str(payload.start_date),
        "end_date": str(end_date) if end_date else None,
        "selected_time_slot_id": str(payload.new_time_slot_id)
    }


@router.post("/admin/approve-time-slot-change/{request_id}")
async def approve_time_slot_change(
    request_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Fetch the request
    req = await session.get(TimeSlotChangeRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Time slot change request not found")
    if req.status != TimeSlotChangeStatus.pending:
        raise HTTPException(status_code=400, detail="Request is not pending")

    # Approve the request
    req.status = TimeSlotChangeStatus.approved
    req.approved_by = current_admin["user_id"]

    # If permanent, update the member's slot
    if req.change_type == TimeSlotChangeType.permanent:
        # Fetch the member and update their time_slot_id
        member = await session.get(Member, req.member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        member.time_slot_id = req.new_time_slot_id
        member.updated_at = datetime.utcnow()
        member.updated_by = current_admin["user_id"]
        await session.flush()  # Ensure changes are staged

    await session.commit()
    return {"detail": "Time slot change request approved"}


# Add this endpoint after the existing time-slot change request endpoints
@router.get("/admin/time-slot-change-requests")
async def list_time_slot_change_requests_for_admin(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected"),
    change_type: Optional[str] = Query(None, description="Filter by type: temporary, permanent"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    List all time-slot change requests for members in the center admin's center.
    Supports filtering by status and change_type, with pagination.
    """
    from sqlalchemy import and_
    
    # Get center admin's center_id
    center_admin = await session.get(CenterAdmin, current_admin["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Build base query - get all requests for members in this center
    query = (
        select(TimeSlotChangeRequest)
        .join(Member, TimeSlotChangeRequest.member_id == Member.id)
        .where(Member.home_center_id == center_id)
        .order_by(TimeSlotChangeRequest.created_at.desc())
    )

    # Apply filters
    filters = []
    if status:
        try:
            status_enum = TimeSlotChangeStatus(status)
            filters.append(TimeSlotChangeRequest.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status value")
    
    if change_type:
        try:
            change_type_enum = TimeSlotChangeType(change_type)
            filters.append(TimeSlotChangeRequest.change_type == change_type_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid change_type value")
    
    if filters:
        query = query.where(and_(*filters))

    # Get total count
    count_query = (
        select(func.count())
        .select_from(TimeSlotChangeRequest)
        .join(Member, TimeSlotChangeRequest.member_id == Member.id)
        .where(Member.home_center_id == center_id)
    )
    if filters:
        count_query = count_query.where(and_(*filters))
    
    total_result = await session.execute(count_query)
    total = total_result.scalar()

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    requests = result.scalars().all()

    # Collect slot IDs and member IDs for bulk fetching
    slot_ids = set()
    member_ids = set()
    for req in requests:
        member_ids.add(req.member_id)
        if req.old_time_slot_id:
            slot_ids.add(req.old_time_slot_id)
        if req.new_time_slot_id:
            slot_ids.add(req.new_time_slot_id)

    # Fetch all time slots
    slot_details = {}
    if slot_ids:
        slots_result = await session.execute(
            select(CenterTimeSlot).where(CenterTimeSlot.id.in_(slot_ids))
        )
        for slot in slots_result.scalars().all():
            slot_details[slot.id] = {
                "id": str(slot.id),
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "slot_capacity": slot.slot_capacity
            }

    # Fetch all members
    member_details = {}
    if member_ids:
        members_result = await session.execute(
            select(Member).where(Member.id.in_(member_ids))
        )
        for member in members_result.scalars().all():
            member_details[member.id] = {
                "id": str(member.id),
                "full_name": member.full_name,
                "email": member.email,
                "mobile": member.mobile
            }

    # Build response
    requests_list = [
        {
            "id": str(req.id),
            "member": member_details.get(req.member_id),
            "old_time_slot": slot_details.get(req.old_time_slot_id),
            "new_time_slot": slot_details.get(req.new_time_slot_id),
            "change_type": req.change_type.value,
            "start_date": str(req.start_date),
            "end_date": str(req.end_date) if req.end_date else None,
            "reason": req.reason,
            "status": req.status.value,
            "approved_by": str(req.approved_by) if req.approved_by else None,
            "created_at": str(req.created_at),
            "updated_at": str(req.updated_at)
        }
        for req in requests
    ]

    return {
        "requests": requests_list,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0
    }


@router.get("/member/time-slot-change-requests")
async def get_member_time_slot_change_requests(
    current_member=Depends(member_required),
    session: AsyncSession = Depends(get_async_session)
):
    # Fetch all requests for the member, including related time slots
    result = await session.execute(
        select(TimeSlotChangeRequest)
        .where(TimeSlotChangeRequest.member_id == current_member["user_id"])
        .order_by(TimeSlotChangeRequest.created_at.desc())
    )
    requests = result.scalars().all()

    # Collect all slot IDs to fetch details in bulk
    slot_ids = set()
    for req in requests:
        if req.old_time_slot_id:
            slot_ids.add(req.old_time_slot_id)
        if req.new_time_slot_id:
            slot_ids.add(req.new_time_slot_id)

    # Fetch all relevant time slots
    slot_details = {}
    if slot_ids:
        slots_result = await session.execute(
            select(CenterTimeSlot).where(CenterTimeSlot.id.in_(slot_ids))
        )
        for slot in slots_result.scalars().all():
            slot_details[slot.id] = {
                "id": str(slot.id),
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "slot_capacity": slot.slot_capacity
            }

    # Build response
    return [
        {
            "id": str(req.id),
            "old_time_slot": slot_details.get(req.old_time_slot_id),
            "new_time_slot": slot_details.get(req.new_time_slot_id),
            "change_type": req.change_type.value,
            "start_date": str(req.start_date),
            "end_date": str(req.end_date) if req.end_date else None,
            "reason": req.reason,
            "status": req.status.value,
            "approved_by": str(req.approved_by) if req.approved_by else None,
            "created_at": str(req.created_at),
            "updated_at": str(req.updated_at)
        }
        for req in requests
    ]




#expaired memberships 
@router.get("/member/expired-memberships")
async def get_expired_member_memberships(
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    now = datetime.utcnow()
    result = await session.execute(
        select(MemberMembership)
        .options(selectinload(MemberMembership.membership))
        .where(
            MemberMembership.member_id == current_member["user_id"],
            MemberMembership.end_date != None,
            MemberMembership.end_date < now
        )
    )
    expired_memberships = result.scalars().all()
    return [
        {
            "id": str(m.id),
            "membership_id": str(m.membership_id),
            "center_id": str(m.center_id),
            "start_date": m.start_date,
            "end_date": m.end_date,
            "total_amount": float(m.total_amount),
            "membership_status": m.membership_status.value,
            "membership_plan": {
                "membership_id": str(m.membership.membership_id),
                "membership_name": m.membership.membership_name,
                "membership_code": m.membership.membership_code,
                "description": m.membership.description,
                "duration": m.membership.duration,
                "default_price": float(m.membership.default_price),
                "status": m.membership.status.value
            } if m.membership else None
        }
        for m in expired_memberships
    ]



@router.post("/member/register-guest/{center_id}")
async def register_guest_member_to_center(
    center_id: str = Path(..., description="ID of the center to register the guest in"),
    payload: GuestRegisterIn = Depends(),
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    # Fetch the member from DB
    member = await session.get(Member, current_member["user_id"])
    if not member:
        raise HTTPException(404, "Member not found")
    if member.member_status != MemberStatusEnum.guest:
        raise HTTPException(400, "Only guest members can use this endpoint")

    # Check if the center exists
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    # Update full name and register the guest to the center
    member.full_name = payload.full_name
    member.home_center_id = center.id
    member.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(member)

    return {
        "id": str(member.id),
        "email": member.email,
        "mobile": member.mobile,
        "full_name": member.full_name,
        "member_status": member.member_status.value,
        "home_center_id": str(center.id),
        "center_name": center.center_name,
        "detail": "Guest member registered to center"
    }


#list guest members assigned to the logged-in center admin’s center
@router.get("/center/guests", response_model=Dict[str, Any])
async def list_guests_in_center(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # Get center admin
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    center_id = center_admin.center_id

    offset = (page - 1) * page_size

    # Get total guest count
    total_result = await session.execute(
        select(func.count())
        .select_from(Member)
        .where(
            Member.home_center_id == center_id,
            Member.member_status == MemberStatusEnum.guest
        )
    )
    total = total_result.scalar()

    # Fetch paginated guests
    result = await session.execute(
        select(Member)
        .where(
            Member.home_center_id == center_id,
            Member.member_status == MemberStatusEnum.guest
        )
        .offset(offset)
        .limit(page_size)
    )

    guests = result.scalars().all()

    guest_list = [
        {
            "id": str(guest.id),
            "email": guest.email,
            "mobile": guest.mobile,
            "full_name": guest.full_name,
            "member_status": guest.member_status.value,
            "home_center_id": str(guest.home_center_id),
        }
        for guest in guests
    ]

    return {
        "guests": guest_list,
        "page": page,
        "page_size": page_size,
        "total_records": total,
        "total_pages": (total + page_size - 1) // page_size
        
    }


@router.get("/center/guests/{guest_id}", response_model=dict)
async def get_guest_by_id(
    guest_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Member, MemberStatusEnum
    from app.settings.models.models import Address
    from app.center.models.models import Center, CenterTimeSlot
    from app.billing.models.models import PaymentOrder
    from app.membership.models.models import MemberMembership
    from sqlalchemy import select

    # Get logged-in centeradmin and their center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Resolve the guest
    guest = await db.get(Member, guest_id)
    if not guest or guest.member_status != MemberStatusEnum.guest:
        raise HTTPException(status_code=404, detail="Guest not found")

    # Ensure guest.home_center exists
    guest_center = await db.get(Center, guest.home_center_id)
    if not guest_center:
        raise HTTPException(status_code=404, detail="Guest's center not found")

    # Access control: same rules as other center endpoints
    if guest_center.parent_center_id:
        # guest is in a sub-branch center
        if admin_center_id != str(guest_center.id) and admin_center_id != str(guest_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not allowed to access this guest")
    else:
        # guest is in a parent center — allow admin if same parent or admin of parent with sub-centers
        if admin_center_id != str(guest_center.id):
            sub_centers_result = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers_result.fetchall()]
            if str(guest_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not allowed to access this guest")

    # Address details
    address = None
    if guest.address_id:
        address_obj = await db.get(Address, guest.address_id)
        if address_obj:
            address = {
                "id": str(address_obj.id),
                "address_type": address_obj.address_type.value if address_obj.address_type else None,
                "address_line_1": address_obj.address_line_1,
                "address_line_2": address_obj.address_line_2,
                "city": address_obj.city,
                "district": address_obj.district,
                "state": address_obj.state,
                "country": address_obj.country,
                "postal_code": address_obj.postal_code,
                "latitude": float(address_obj.latitude) if address_obj.latitude else None,
                "longitude": float(address_obj.longitude) if address_obj.longitude else None,
                "is_primary": address_obj.is_primary,
                "status": address_obj.status.value if address_obj.status else None,
            }
    else:
        address = {
            "address_line_1": getattr(guest, "address_line_1", None),
            "address_line_2": getattr(guest, "address_line_2", None),
            "city": getattr(guest, "city", None),
            "state": getattr(guest, "state", None),
            "country": getattr(guest, "country", None),
            "postal_code": getattr(guest, "postal_code", None),
        }

    # Time slot details
    time_slot = None
    if guest.time_slot_id:
        slot_obj = await db.get(CenterTimeSlot, guest.time_slot_id)
        if slot_obj:
            time_slot = {
                "id": str(slot_obj.id),
                "start_time": slot_obj.start_time,
                "end_time": slot_obj.end_time,
                "slot_capacity": slot_obj.slot_capacity,
            }

    # Latest payment status (if any)
    payment_status_val = None
    payment_order_result = await db.execute(
        select(PaymentOrder)
        .where(PaymentOrder.payer_user_id == guest.id)
        .order_by(PaymentOrder.created_at.desc())
    )
    payment_orders = payment_order_result.scalars().all()
    if payment_orders:
        payment_status_val = payment_orders[0].status.value if payment_orders[0].status else None

    # Member memberships (if any) - return list of memberships for completeness
    mm_result = await db.execute(
        select(MemberMembership)
        .where(MemberMembership.member_id == guest.id)
        .order_by(MemberMembership.start_date.desc())
    )
    member_memberships = []
    for mm in mm_result.scalars().all():
        member_memberships.append({
            "id": str(mm.id),
            "membership_id": str(mm.membership_id) if mm.membership_id else None,
            "center_id": str(mm.center_id) if mm.center_id else None,
            "start_date": mm.start_date,
            "end_date": mm.end_date,
            "total_amount": float(mm.total_amount) if mm.total_amount is not None else None,
            "membership_status": mm.membership_status.value if mm.membership_status else None,
        })

    return {
        "id": str(guest.id),
        "full_name": guest.full_name,
        "email": guest.email,
        "mobile": guest.mobile,
        "gender": guest.gender.value if guest.gender else None,
        "date_of_birth": guest.date_of_birth,
        "blood_group": guest.blood_group,
        "address_id": str(guest.address_id) if guest.address_id else None,
        "address": address,
        "home_center_id": str(guest.home_center_id) if guest.home_center_id else None,
        "home_center_name": guest_center.center_name if guest_center else None,
        "time_slot_id": str(guest.time_slot_id) if guest.time_slot_id else None,
        "time_slot": time_slot,
        "visited_date": str(guest.visited_date) if guest.visited_date else None,
        "payment_status": payment_status_val,
        "member_status": guest.member_status.value,
        "status": guest.status.value if guest.status else None,
        "member_memberships": member_memberships,
        "created_at": guest.created_at,
        "updated_at": guest.updated_at,
    }


#Renew or Update Membership for a Member (by Center Admin)
@router.post("/center/members/{member_id}/renew-membership", status_code=201)
async def renew_or_update_membership(
    member_id: str,
    payload: dict,  # Using dict to accept JSON body
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    """
    Renew or update membership for a member.
    Request Body:
    {
        "membership_id": "optional-uuid",  // If not provided, renews current plan
        "payment_method": "cash|bank_transfer|upi|card|other",
        "payment_status": "paid|unpaid"
    }
    """
    from app.billing.models.models import PaymentOrder, PaymentOrderStatus, PaymentMethod
    from app.accounts.helpers import auto_record_payment_in_accounts
    from app.settings.models.models import TaxCategory, TaxScope
    from app.membership.models.models import DurationUnitEnum, MembershipActionTypeEnum
    from uuid import uuid4
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    # Extract and validate payload
    membership_id = payload.get("membership_id")
    payment_method = payload.get("payment_method")
    payment_status = payload.get("payment_status")
    
    if not payment_method:
        raise HTTPException(status_code=400, detail="payment_method is required")
    if not payment_status:
        raise HTTPException(status_code=400, detail="payment_status is required")
    
    valid_payment_methods = ["cash", "bank_transfer", "upi", "card", "other"]
    if payment_method not in valid_payment_methods:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid payment_method. Must be one of: {', '.join(valid_payment_methods)}"
        )
    valid_payment_statuses = ["paid", "unpaid"]
    if payment_status not in valid_payment_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid payment_status. Must be one of: {', '.join(valid_payment_statuses)}"
        )

    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    from app.center.models.models import Center
    member_center = await db.get(Center, member.home_center_id)
    if not member_center:
        raise HTTPException(status_code=404, detail="Member's center not found")
    admin_center_id = str(center_admin.center_id)
    admin_center = await db.get(Center, admin_center_id)
    if member_center.parent_center_id:
        if admin_center_id != str(member_center.id) and admin_center_id != str(member_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not authorized for this member")
    else:
        if admin_center_id != str(member_center.id):
            sub_centers_result = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers_result.fetchall()]
            if str(member_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not authorized for this member")

    # Get the latest membership record for this member
    result = await db.execute(
        select(MemberMembership)
        .where(MemberMembership.member_id == member.id)
        .order_by(MemberMembership.end_date.desc())
    )
    latest_membership_record = result.scalars().first()
    
    # Determine which membership plan to use and action_type
    if membership_id:
        membership = await db.get(Membership, membership_id)
        if not membership:
            raise HTTPException(status_code=404, detail="Membership plan not found")
        if str(membership.center_id) != str(member.home_center_id):
            raise HTTPException(status_code=400, detail="Membership does not belong to member's center")
        renewal_type = "plan_change"
        action_type = MembershipActionTypeEnum.plan_change
    else:
        if not latest_membership_record:
            raise HTTPException(status_code=400, detail="No existing membership to renew")
        membership = await db.get(Membership, latest_membership_record.membership_id)
        if not membership:
            raise HTTPException(status_code=404, detail="Current membership plan not found")
        renewal_type = "renewal"
        action_type = MembershipActionTypeEnum.renewal

    now = datetime.utcnow()
    if renewal_type == "renewal" and latest_membership_record and latest_membership_record.end_date:
        last_end = latest_membership_record.end_date
        start_date = last_end + relativedelta(days=1) if last_end > now else now
    else:
        start_date = now

    duration_unit = membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit
    duration_count = membership.duration_count
    if duration_unit == "day":
        end_date = start_date + relativedelta(days=duration_count)
    elif duration_unit == "month":
        end_date = start_date + relativedelta(months=duration_count)
    elif duration_unit == "year":
        end_date = start_date + relativedelta(years=duration_count)
    else:
        raise HTTPException(status_code=400, detail="Invalid duration unit in membership plan")

    subtotal_amount = float(membership.default_price)
    tax_amount = 0.0
    applied_tax_rate = 0.0
    tax_category_id = None
    tax_warning_message = None
    tax_result = await db.execute(
        select(TaxCategory).where(
            TaxCategory.tax_scope == TaxScope.membership,
            TaxCategory.is_active == True
        ).limit(1)
    )
    tax_category = tax_result.scalar_one_or_none()
    if tax_category:
        applied_tax_rate = float(tax_category.tax_percentage)
        tax_amount = round(subtotal_amount * applied_tax_rate / 100, 2)
        tax_category_id = tax_category.id
    else:
        tax_amount = 0.0
        applied_tax_rate = 0.0
        tax_category_id = None
        tax_warning_message = "No active tax category found for membership. Tax not applied."

    # --- FIX: Calculate total_amount before using it ---
    total_amount = subtotal_amount + tax_amount

    # Create PaymentOrder
    order_type = "renewal" if renewal_type == "renewal" else "membership"
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        center_id=member.home_center_id,
        payer_user_id=member.id,
        payer_type="user",
        payee_type="center",
        order_type=order_type,
        reference_schema="center",
        reference_id=member.home_center_id,
        subtotal_amount=subtotal_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method=PaymentMethod(payment_method),
        status=PaymentOrderStatus(payment_status),
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(payment_order)
    await db.flush()

    # Create new MemberMembership record
    member_membership = MemberMembership(
        id=uuid4(),
        member_id=member.id,
        membership_id=membership.membership_id,
        center_id=member.home_center_id,
        start_date=start_date,
        end_date=end_date,
        tax_category_id=tax_category_id,
        total_amount=total_amount,
        auto_renewal_enabled=False,
        membership_status=StatusEnum.active,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        action_type=action_type
    )
    db.add(member_membership)
    await db.commit()
    await db.refresh(member_membership)
    await db.refresh(payment_order)

    # --- ACCOUNTS INTEGRATION ---
    # This will create the journal entry and ledger records for the payment order
    try:
        await auto_record_payment_in_accounts(payment_order, db)
    except Exception as e:
        # Optionally log or handle accounting errors, but do not block the main flow
        print(f"⚠️ Accounting integration failed: {e}")

    response = {
        "member_id": str(member.id),
        "membership_id": str(membership.membership_id),
        "membership_name": membership.membership_name,
        "start_date": start_date,
        "end_date": end_date,
        "subtotal_amount": subtotal_amount,
        "tax_amount": tax_amount,
        "tax_rate": applied_tax_rate,
        "total_amount": total_amount,
        "payment_order_id": str(payment_order.payment_order_id),
        "payment_status": payment_order.status.value,
        "payment_method": payment_order.payment_method.value,
        "action_type": action_type.value,
        "tax_warning_message": tax_warning_message,
        "status": "success"
    }
    return response




