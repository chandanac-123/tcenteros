from app.core.models.models import StatusEnum, User
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Query, Path
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.membership.models.models import Membership, MembershipFeature
from app.membership.schema.schema import MembershipCreate, MemberCreate, GuestRegisterIn
from app.auth.models.models import Member, MemberStatusEnum
from app.core.security import get_password_hash, generate_random_password
from app.membership.models.models import MemberMembership, Membership
from app.settings.models.models import Address
from app.core.models.models import GenderEnum
from datetime import datetime, date
from app.core.database import get_async_session
from app.auth.models.models import CenterAdmin
from app.core.dependencies import centeradmin_required, get_current_user, member_required
from app.s3.service import upload_file, get_file_url
from uuid import uuid4
from sqlalchemy import select, func
from app.membership.schema.schema import MembershipOut, MembershipFeatureIn, MembershipFeatureOut , TimeSlotChangeRequestIn
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
    # Get logged-in centeradmin and their center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Validate center_id in payload
    # If parent centeradmin, allow own center and sub-branches
    # If sub-branch centeradmin, only allow own center
    from app.center.models.models import Center
    target_center = await db.get(Center, payload.center_id)
    if not target_center:
        raise HTTPException(status_code=404, detail="Center not found")

    # Check if admin is parent or sub-branch
    if target_center.parent_center_id:
        # Sub-branch center
        if admin_center_id != str(target_center.id):
            raise HTTPException(status_code=403, detail="Sub-branch admin can only create members in their own center")
    else:
        # Parent center
        # Allow own center or any sub-branch
        if admin_center_id != str(target_center.id):
            # Check if target_center is a sub-branch of this admin
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(target_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="You can only create members in your own center or sub-branches")

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
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(member)
    await db.flush()

    # Only create MemberMembership if member_status is "member" or "lead" and membership is provided
    member_membership = None
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

        member_membership = MemberMembership(
            id=uuid4(),
            member_id=member.id,
            membership_id=payload.membership_id,
            center_id=target_center.id,
            start_date=start_date,
            end_date=end_date,
            total_amount=0,  # Set as needed
            membership_status=StatusEnum.active,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(member_membership)

    await db.commit()
    await db.refresh(member)

    return {
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
        "payment_method": payload.payment_method if payload.member_status == "member" and payload.payment_status == "paid" else None,
        "payment_status": payload.payment_status if payload.member_status == "member" else None,
        "password": password if password else None,
    }

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

    # Get the member
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Get the member's center
    from app.center.models.models import Center
    member_center = await db.get(Center, member.home_center_id)
    if not member_center:
        raise HTTPException(status_code=404, detail="Member's center not found")

    # Access control
    if member_center.parent_center_id:
        # Sub-branch member
        if admin_center_id != str(member_center.id) and admin_center_id != str(member_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not allowed to access this member")
    else:
        # Parent center member
        if admin_center_id != str(member_center.id):
            # Check if member is in a sub-branch of this admin
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(member_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not allowed to access this member")

    # Return all member data
    return {
        "id": str(member.id),
        "full_name": member.full_name,
        "email": member.email,
        "mobile": member.mobile,
        "gender": member.gender.value if member.gender else None,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "address_id": str(member.address_id) if hasattr(member, "address_id") else None,
        "home_center_id": str(member.home_center_id),
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "member_status": member.member_status.value,
        "created_at": member.created_at,
        "updated_at": member.updated_at,
        # Add other fields as needed
    }


#Update Member by ID (centeradmin can update their own and sub-branch members; sub-branch admin only their own; all fields editable)
@router.put("/center/members/{member_id}")
async def update_member_by_id(
    member_id: str,
    payload: MemberCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    # Get the member
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # Get the member's center
    from app.center.models.models import Center
    member_center = await db.get(Center, member.home_center_id)
    if not member_center:
        raise HTTPException(status_code=404, detail="Member's center not found")

    # Access control (same as get)
    if member_center.parent_center_id:
        if admin_center_id != str(member_center.id) and admin_center_id != str(member_center.parent_center_id):
            raise HTTPException(status_code=403, detail="Not allowed to update this member")
    else:
        if admin_center_id != str(member_center.id):
            sub_centers = await db.execute(
                select(Center.id).where(Center.parent_center_id == admin_center_id)
            )
            allowed_sub_ids = [str(row[0]) for row in sub_centers.fetchall()]
            if str(member_center.id) not in allowed_sub_ids:
                raise HTTPException(status_code=403, detail="Not allowed to update this member")

    # Update all fields from payload
    update_fields = payload.dict(exclude_unset=True)
    for field, value in update_fields.items():
        if hasattr(member, field):
            setattr(member, field, value)
    member.updated_at = datetime.utcnow()
    member.updated_by = current_user["user_id"]

    await db.commit()
    await db.refresh(member)

    return {
        "id": str(member.id),
        "full_name": member.full_name,
        "email": member.email,
        "mobile": member.mobile,
        "gender": member.gender.value if member.gender else None,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "address_id": str(member.address_id) if hasattr(member, "address_id") else None,
        "home_center_id": str(member.home_center_id),
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "member_status": member.member_status.value,
        "created_at": member.created_at,
        "updated_at": member.updated_at,
        # Add other fields as needed
    }


#list all members of a center (centeradmin can see their own and sub-branch members; sub-branch admin only their own)
@router.get("/center/members")
async def list_members(
    payment_status: str = Query(None, description="Filter by payment status: paid/unpaid"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    admin_center_id = str(center_admin.center_id)

    from app.center.models.models import Center
    # Determine allowed center IDs
    allowed_center_ids = [admin_center_id]
    parent_center = await db.get(Center, admin_center_id)
    if parent_center and not parent_center.parent_center_id:
        # Parent center: include sub-branches
        sub_centers = await db.execute(
            select(Center.id).where(Center.parent_center_id == admin_center_id)
        )
        allowed_center_ids += [str(row[0]) for row in sub_centers.fetchall()]

    # Build query for members in allowed centers
    query = (
        select(Member)
        .options(selectinload(Member.member_memberships))
        .where(Member.home_center_id.in_(allowed_center_ids))
    )

    # Filter by payment status if provided
    if payment_status:
        query = query.join(MemberMembership).where(MemberMembership.payment_status == payment_status)

    # Pagination
    total_members_result = await db.execute(query)
    total_members = total_members_result.scalars().all()
    total_count = len(total_members)

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    members = result.scalars().all()

    # Prepare response data
    member_list = []
    active_count = 0
    inactive_count = 0
    expired_count = 0

    today = date.today()
    for member in members:
        # Get latest membership (if any)
        membership = None
        start_date = None
        end_date = None
        payment_status_val = None
        status_val = None
        if member.member_memberships:
            membership = member.member_memberships[-1]
            start_date = membership.start_date
            end_date = membership.end_date
            payment_status_val = getattr(membership, "payment_status", None)
            status_val = membership.membership_status.value if membership.membership_status else None
            # Count logic
            if status_val == "active":
                active_count += 1
            elif status_val == "inactive":
                inactive_count += 1
            if end_date and end_date < today:
                expired_count += 1

        member_list.append({
            "id": str(member.id),
            "full_name": member.full_name,
            "email": member.email,
            "mobile": member.mobile,
            "start_date": start_date,
            "end_date": end_date,
            "status": status_val,
            "payment_status": payment_status_val,
        })

    # Summary counts (for all allowed centers)
    # Re-run count queries for all members in allowed centers
    all_members_result = await db.execute(
        select(Member).where(Member.home_center_id.in_(allowed_center_ids))
    )
    all_members = all_members_result.scalars().all()
    total_count = len(all_members)
    active_count = 0
    inactive_count = 0
    expired_count = 0
    for member in all_members:
        if member.member_memberships:
            membership = member.member_memberships[-1]
            status_val = membership.membership_status.value if membership.membership_status else None
            end_date = membership.end_date
            if status_val == "active":
                active_count += 1
            elif status_val == "inactive":
                inactive_count += 1
            if end_date and end_date < today:
                expired_count += 1

    return {
        "members": member_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total_count
        },
        "counts": {
            "total_members": total_count,
            "active_members": active_count,
            "inactive_members": inactive_count,
            "expired_members": expired_count
        }
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
@router.get("/center/guests", response_model=list[dict])
async def list_guests_in_center(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # Get the center admin and their center_id
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Query for guest members assigned to this center
    result = await session.execute(
        select(Member)
        .where(
            Member.home_center_id == center_id,
            Member.member_status == MemberStatusEnum.guest
        )
    )
    guests = result.scalars().all()

    # Return guest info
    return [
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



