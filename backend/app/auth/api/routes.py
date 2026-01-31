
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.s3.service import upload_file, get_file_url, delete_file
import urllib.parse
from app.core.database import get_async_session
from app.auth.schema.schema import CenterAdminLoginRequest, CenterAdminLoginResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth.models.models import User
from app.core.security import verify_password
from app.core.security import create_access_token, create_refresh_token
from app.auth.schema.schema import OTPRequest, OTPVerify, MemberLoginResponse
from app.auth.models.models import Member
from datetime import datetime
from uuid import uuid4
from app.auth.models.models import MemberStatusEnum
from app.core.models.models import StatusEnum

router = APIRouter()

otp_store = {}

# @router.post("/login")
# async def login():
#     return {"message": "login ok"}



# @router.post("/upload")
# async def upload(file: UploadFile = File(...)):
#     key = upload_file(file)
#     # key = "uploads/uuid_filename with spaces.png"

#     # remove "uploads/" prefix
#     filename = key.replace("uploads/", "", 1)

#     # URL-encode ONLY the filename
#     encoded_filename = urllib.parse.quote(filename)

#     return {
#         "message": "Uploaded",
#         "key": encoded_filename
#     }

# @router.get("/{key:path}")
# def get_file(key: str):
#     url = get_file_url(key)
#     return {"url": url}


# @router.delete("/{key}")
# def delete(key: str):
#     delete_file(key)
#     return {"message": "Deleted"}


@router.post("/centeradmin/login", response_model=CenterAdminLoginResponse)
async def centeradmin_login(
    payload: CenterAdminLoginRequest,
    db: AsyncSession = Depends(get_async_session)
):
    stmt = select(User).where(User.email == payload.email, User.role == "centeradmin")
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/member/login/request-otp")
async def request_otp(data: OTPRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Member).where(Member.mobile == data.phone))
    member = result.scalar_one_or_none()
    if not member:
        phone_str = str(data.phone)
        new_member = Member(
            id=uuid4(),
            email=f"lead_{phone_str}@autogen.local",
            username=f"lead_{phone_str}",
            password_hash="otp_lead",  # <-- Provide a dummy non-null value
            role="member",
            status=StatusEnum.active,
            mobile=phone_str,
            member_status=MemberStatusEnum.lead,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(new_member)
        await session.commit()
        await session.refresh(new_member)
    otp_store[data.phone] = "0000"
    return {"detail": "OTP sent to phone (always 0000 in dev mode)"}

@router.post("/member/login/verify-otp", response_model=MemberLoginResponse)
async def verify_otp(data: OTPVerify, session: AsyncSession = Depends(get_async_session)):
    phone = next((p for p, o in otp_store.items() if o == data.otp), None)
    if not phone:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    result = await session.execute(select(Member).where(Member.mobile == phone))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    otp_store.pop(phone, None)

    # Generate JWT tokens
    access_token = create_access_token(data={"sub": str(member.id), "role": "member"})
    refresh_token = create_refresh_token(data={"sub": str(member.id), "role": "member"})

    return {
        "id": str(member.id),
        "email": member.email,
        "phone": member.mobile,
        "home_center_id": str(member.home_center_id) if member.home_center_id else None,
        "member_status": member.member_status.value,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

