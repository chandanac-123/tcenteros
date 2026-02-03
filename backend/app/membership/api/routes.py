from app.core.models.models import StatusEnum, User
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.membership.models.models import Membership, MembershipFeature
from app.membership.schema.schema import MembershipCreate, MemberCreate
from app.auth.models.models import Member, MemberStatusEnum
from app.core.security import get_password_hash
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
from app.center.models.models import CenterTimeSlot, TimeSlotChangeRequest, TimeSlotChangeStatus, TimeSlotChangeType
router = APIRouter()

#create membership plan
@router.post("/memberships-plans", response_model=MembershipOut, status_code=201)
async def create_membership_plan(
    payload: MembershipCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # 1. Get user from User table
    user = await db.get(User, current_user["user_id"])
    if not user or user.role != "centeradmin":
        raise HTTPException(status_code=403, detail="Not a center admin")

    # 2. Get center_id directly from CenterAdmin table
    result = await db.execute(
        select(CenterAdmin.center_id).where(CenterAdmin.id == user.id)
    )
    center_id = result.scalar_one_or_none()
    if not center_id:
        raise HTTPException(status_code=403, detail="CenterAdmin record not found or no center assigned")

    # 3. Create the membership
    membership = Membership(
        membership_id=uuid4(),
        center_id=center_id,
        membership_name=payload.membership_name,
        membership_code=payload.membership_code,
        description=payload.description,
        duration=payload.duration,
        default_price=payload.default_price,
        status=StatusEnum.active,
        created_by=user.id,
        updated_by=user.id,
    )
    db.add(membership)
    await db.flush()  # So membership.membership_id is available

    # 4. Add membership features
    features = []
    for feature in payload.membership_features:
        feat = MembershipFeature(
            membership_id=membership.membership_id,
            feature_name=feature.feature_name,
            feature_description=feature.feature_description,
            created_by=user.id,
            updated_by=user.id,
        )
        db.add(feat)
        features.append(feat)

    await db.commit()
    await db.refresh(membership)

    # 5. Return membership data with features
    return MembershipOut(
        membership_id=membership.membership_id,
        center_id=membership.center_id,
        membership_name=membership.membership_name,
        membership_code=membership.membership_code,
        description=membership.description,
        duration=membership.duration,
        default_price=float(membership.default_price),
        status=membership.status.value,
        membership_features=[
            MembershipFeatureOut(
                id=feat.id,
                feature_name=feat.feature_name,
                feature_description=feat.feature_description,
            ) for feat in features
        ]
    )

# #List Membership Plans (superadmin, centeradmin, member)
@router.get("/memberships-plans", response_model=List[MembershipOut])
async def list_membership_plans(
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Membership).options(selectinload(Membership.membership_features)))
    memberships = result.scalars().all()
    return [
        MembershipOut(
            membership_id=m.membership_id,
            center_id=m.center_id,
            membership_name=m.membership_name,
            membership_code=m.membership_code,
            description=m.description,
            duration=m.duration,
            default_price=float(m.default_price),
            status=m.status.value,
            membership_features=[
                MembershipFeatureOut(
                    id=f.id,
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
        membership_id=membership.membership_id,
        center_id=membership.center_id,
        membership_name=membership.membership_name,
        membership_code=membership.membership_code,
        description=membership.description,
        duration=membership.duration,
        default_price=float(membership.default_price),
        status=membership.status.value,
        membership_features=[
            MembershipFeatureOut(
                id=f.id,
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

    # Update features: remove old, add new
    # Remove all existing features
    for f in list(membership.membership_features):
        await db.delete(f)
    await db.flush()
    # Add new features
    features = []
    for feature in payload.membership_features:
        feat = MembershipFeature(
            membership_id=membership.membership_id,
            feature_name=feature.feature_name,
            feature_description=feature.feature_description,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
        )
        db.add(feat)
        features.append(feat)

    await db.commit()
    await db.refresh(membership)
    return MembershipOut(
        membership_id=membership.membership_id,
        center_id=membership.center_id,
        membership_name=membership.membership_name,
        membership_code=membership.membership_code,
        description=membership.description,
        duration=membership.duration,
        default_price=float(membership.default_price),
        status=membership.status.value,
        membership_features=[
            MembershipFeatureOut(
                id=f.id,
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







@router.post("/center/members", status_code=201)
async def create_member(
    payload: MemberCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # 1. Get CenterAdmin and center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # 2. Create Address
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

    # 3. Create Member (User + Member fields)
    member = Member(
        id=uuid4(),
        email=payload.email,
        username=payload.username,
        password_hash=get_password_hash(payload.password),
        role="member",
        status=StatusEnum.active,
        gender=GenderEnum(payload.gender) if payload.gender else None,
        mobile=payload.mobile,
        profile_photo=payload.profile_photo,
        home_center_id=center_id,
        date_of_birth=payload.date_of_birth,
        blood_group=payload.blood_group,
        time_slot_id=payload.time_slot_id,
        member_status=MemberStatusEnum(payload.member_status) if payload.member_status else None,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(member)
    await db.flush()

    # 4. Fetch Membership to get duration
    membership = await db.get(Membership, payload.membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")

    start_date = date.today()
    # Parse duration and calculate end_date
    duration = membership.duration.lower()
    if "month" in duration:
        months = int(duration.split("-")[0])
        end_date = start_date + relativedelta(months=months)
    elif "year" in duration:
        years = int(duration.split("-")[0])
        end_date = start_date + relativedelta(years=years)
    else:
        end_date = None  # or handle as needed


    # 5. Create MemberMembership
    member_membership = MemberMembership(
        id=uuid4(),
        member_id=member.id,
        membership_id=payload.membership_id,
        center_id=center_id,
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
        "username": member.username,
        "home_center_id": str(member.home_center_id),
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "membership_id": str(payload.membership_id),
        "address_id": str(address.id),
        "member_status": member.member_status.value,  # <-- NEW FIELD IN RESPONSE
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
    # Determine center_id based on role
    role = current_user["role"]

    if role == "superadmin":
        if not center_id:
            raise HTTPException(status_code=400, detail="center_id is required for superadmin")
    elif role == "centeradmin":
        result = await session.execute(
            select(CenterAdmin).where(CenterAdmin.id == current_user["user_id"])
        )
        center_admin = result.scalar_one_or_none()
        if not center_admin:
            raise HTTPException(status_code=404, detail="CenterAdmin not found")
        center_id = str(center_admin.center_id)
    elif role == "member":
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


