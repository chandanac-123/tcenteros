from app.core.models.models import StatusEnum, User
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.membership.models.models import Membership
from app.membership.schema.schema import MembershipCreate, MemberCreate
from app.auth.models.models import Member
from app.core.security import get_password_hash
from app.membership.models.models import MemberMembership
from app.settings.models.models import Address
from app.core.models.models import GenderEnum
from datetime import datetime, date
from app.core.database import get_async_session
from app.auth.models.models import CenterAdmin
from app.core.dependencies import centeradmin_required, get_current_user
from app.s3.service import upload_file, get_file_url
from uuid import uuid4
from sqlalchemy import select

router = APIRouter()

#create membership plan
@router.post("/memberships-plans", status_code=201)
async def create_membership_plan(
    membership_name: str = Form(...),
    membership_code: str = Form(...),
    description: str = Form(""),
    duration: str = Form(...),
    default_price: float = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # 1. Get user from User table
    user = await db.get(User, current_user["user_id"])
    if not user or user.role != "centeradmin":
        raise HTTPException(status_code=403, detail="Not a center admin")

    # 2. Get centeradmin record for center_id
    center_admin = await db.get(CenterAdmin, user.id)
    if not center_admin or not center_admin.center_id:
        raise HTTPException(status_code=403, detail="CenterAdmin record not found or no center assigned")
    center_id = center_admin.center_id

    # 3. Upload image to S3
    file_bytes = await image.read()
    file_ext = image.filename.split('.')[-1]
    s3_key = f"memberships/{uuid4()}.{file_ext}"
    upload_file(file_bytes, s3_key, content_type=image.content_type)
    image_url = get_file_url(s3_key)

    # 4. Create the membership (image not stored in DB)
    membership = Membership(
        membership_id=uuid4(),
        center_id=center_id,
        membership_name=membership_name,
        membership_code=membership_code,
        description=description,
        duration=duration,
        default_price=default_price,
        status=StatusEnum.active,
        created_by=user.id,
        updated_by=user.id,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)

    # 5. Return membership data + image URL
    return {
        "membership_id": str(membership.membership_id),
        "center_id": str(center_id),
        "membership_name": membership.membership_name,
        "membership_code": membership.membership_code,
        "description": membership.description,
        "duration": membership.duration,
        "default_price": float(membership.default_price),
        "status": membership.status.value,
        "image_url": image_url
    }

#List Membership Plans (superadmin, centeradmin, member)
@router.get("/memberships-plans")
async def list_membership_plans(
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    # All roles can access
    result = await db.execute(select(Membership))
    memberships = result.scalars().all()
    return [
        {
            "membership_id": str(m.membership_id),
            "center_id": str(m.center_id),
            "membership_name": m.membership_name,
            "membership_code": m.membership_code,
            "description": m.description,
            "duration": m.duration,
            "default_price": float(m.default_price),
            "status": m.status.value,
        }
        for m in memberships
    ]

#Get Membership Plan by ID (superadmin, centeradmin, member)
@router.get("/memberships-plans/{membership_id}")
async def get_membership_plan(
    membership_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    membership = await db.get(Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    return {
        "membership_id": str(membership.membership_id),
        "center_id": str(membership.center_id),
        "membership_name": membership.membership_name,
        "membership_code": membership.membership_code,
        "description": membership.description,
        "duration": membership.duration,
        "default_price": float(membership.default_price),
        "status": membership.status.value,
    }


#Update Membership Plan (centeradmin only)
@router.put("/memberships-plans/{membership_id}")
async def update_membership_plan(
    membership_id: str,
    payload: MembershipCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    membership = await db.get(Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    # Only allow update if centeradmin owns the plan
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if membership.center_id != center_admin.center_id:
        raise HTTPException(status_code=403, detail="Not allowed to update this plan")
    for field, value in payload.dict().items():
        setattr(membership, field, value)
    membership.updated_by = current_user["user_id"]
    membership.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(membership)
    return {"detail": "Membership plan updated"}


#Delete Membership Plan (centeradmin only)
@router.delete("/memberships-plans/{membership_id}")
async def delete_membership_plan(
    membership_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    membership = await db.get(Membership, membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if membership.center_id != center_admin.center_id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this plan")
    await db.delete(membership)
    await db.commit()
    return {"detail": "Membership plan deleted"}


#Activate/Inactivate Membership Plan (centeradmin only)
@router.patch("/memberships-plans/{membership_id}/status")
async def set_membership_plan_status(
    membership_id: str,
    status: str = Query(..., regex="^(active|inactive)$"),
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
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(member)
    await db.flush()

    # 4. Create MemberMembership
    member_membership = MemberMembership(
        id=uuid4(),
        member_id=member.id,
        membership_id=payload.membership_id,
        center_id=center_id,
        start_date=date.today(),
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
    }