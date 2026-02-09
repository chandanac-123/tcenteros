
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.s3.service import upload_file, get_file_url, delete_file
import urllib.parse
from app.core.database import get_async_session
from app.auth.schema.schema import CenterAdminLoginRequest, CenterAdminLoginResponse, MemberProfileUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth.models.models import User
from app.core.security import verify_password
from app.core.security import create_access_token, create_refresh_token
from app.auth.schema.schema import OTPRequest, OTPVerify, MemberLoginResponse, EmployeeCreate, EmployeeOut, EmployeeUpdate
from app.core.dependencies import superadmin_required
from app.auth.models.models import Member, Employee
from datetime import datetime
from uuid import uuid4
from app.auth.models.models import MemberStatusEnum
from app.core.models.models import StatusEnum
from app.core.dependencies import member_required, get_current_user
from passlib.context import CryptContext
from app.settings.models.models import Designation
import uuid


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

otp_store = {}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


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

    # Fetch CenterAdmin to get center_id
    from app.auth.models.models import CenterAdmin
    admin_result = await db.execute(select(CenterAdmin).where(CenterAdmin.id == user.id))
    center_admin = admin_result.scalar_one_or_none()
    center_id = str(center_admin.center_id) if center_admin and center_admin.center_id else None

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "center_id": center_id,
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

#member logout endpoint (client should delete token on their side)
@router.post("/member/logout")
async def logout_member():
    """
    Instructs the client to delete the JWT token.
    """
    return {"detail": "Logout successful. Please delete your token on the client side."}


#------------------------------
#member profile update endpoint
#-------------------------------

# S3 Upload Endpoint for Member Profile Photo
@router.post("/member/profile/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_member=Depends(member_required)
):
    # Generate a unique S3 key
    ext = file.filename.split('.')[-1]
    key = f"uploads/profile_photos/{current_member['user_id']}_{uuid.uuid4()}.{ext}"
    file_bytes = await file.read()
    upload_file(file_bytes, key, content_type=file.content_type)
    url = get_file_url(key)
    return {"profile_photo_url": url}


#1. Member Profile Update (Self)
@router.put("/member/profile")
async def update_member_profile(
    payload: MemberProfileUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    member = await session.get(Member, current_member["user_id"])
    if not member:
        raise HTTPException(404, "Member not found")
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            # Convert date_of_birth string to date object if needed
            if field == "date_of_birth" and isinstance(value, str):
                value = datetime.strptime(value, "%Y-%m-%d").date()
            setattr(member, field, value)
    member.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(member)
    return {
        "id": str(member.id),
        "email": member.email,
        "username": member.username,
        "mobile": member.mobile,
        "profile_photo": member.profile_photo,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "blocked_reason": member.blocked_reason,
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "member_status": member.member_status.value
    }

#-------------------------------
#employee management endpoints
#-------------------------------

#2. Get Profile by Member ID (Member or CenterAdmin)
@router.get("/member/profile/{member_id}")
async def get_member_profile(
    member_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    member = await session.get(Member, member_id)
    if not member:
        raise HTTPException(404, "Member not found")
    # Only allow access if current user is the member or a centeradmin
    if current_user["role"] not in ["member", "centeradmin"]:
        raise HTTPException(403, "Not authorized")
    if current_user["role"] == "member" and current_user["user_id"] != member_id:
        raise HTTPException(403, "Members can only access their own profile")
    return {
        "id": str(member.id),
        "email": member.email,
        "username": member.username,
        "mobile": member.mobile,
        "profile_photo": member.profile_photo,
        "date_of_birth": member.date_of_birth,
        "blood_group": member.blood_group,
        "blocked_reason": member.blocked_reason,
        "time_slot_id": str(member.time_slot_id) if member.time_slot_id else None,
        "member_status": member.member_status.value,
        "home_center_id": str(member.home_center_id) if member.home_center_id else None,
        "network_center_id": str(member.network_center_id) if member.network_center_id else None,
        "network_eligible": member.network_eligible
    }

#-----------------------------
#employee management endpoints (CRUD)
#-----------------------------

@router.post("/employee", response_model=EmployeeOut)
async def create_employee(data: EmployeeCreate, session: AsyncSession = Depends(get_async_session)):
    # Check for duplicate email/mobile
    result = await session.execute(select(Employee).where(Employee.email == data.email))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Email already exists")
    result = await session.execute(select(Employee).where(Employee.mobile == data.mobile))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Mobile already exists")
    # Check designation exists
    designation = await session.get(Designation, data.designation_id)
    if not designation:
        raise HTTPException(status_code=400, detail="Invalid designation_id")

    employee = Employee(
        full_name=data.full_name,
        email=data.email,
        mobile=data.mobile,
        qualification=data.qualification,
        experience_years=data.experience,
        country=data.country,
        state=data.state,
        city=data.city,
        pin=data.pin,
        address_line_1=data.address,
        password_hash=hash_password(data.password),
        designation_id=data.designation_id
    )
    session.add(employee)
    await session.commit()
    await session.refresh(employee)
    return {
        **employee.__dict__,
        "designation_id": str(employee.designation_id),
        "designation_name": designation.name
    }

# Get Employee by ID
@router.get("/employee/{employee_id}", response_model=EmployeeOut)
async def get_employee(employee_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    employee = await session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    designation = await session.get(Designation, employee.designation_id) if employee.designation_id else None
    return {
        **employee.__dict__,
        "designation_id": str(employee.designation_id) if employee.designation_id else None,
        "designation_name": designation.name if designation else None
    }

# Update Employee
@router.put("/employee/{employee_id}", response_model=EmployeeOut)
async def update_employee(employee_id: uuid.UUID, data: EmployeeUpdate, session: AsyncSession = Depends(get_async_session)):
    employee = await session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in data.dict(exclude_unset=True).items():
        if key == "password" and value:
            setattr(employee, "password_hash", hash_password(value))
        elif key == "experience":
            setattr(employee, "experience_years", value)
        elif key == "address":
            setattr(employee, "address_line_1", value)
        elif key == "designation_id":
            # Check designation exists
            designation = await session.get(Designation, value)
            if not designation:
                raise HTTPException(status_code=400, detail="Invalid designation_id")
            setattr(employee, key, value)
        else:
            setattr(employee, key, value)
    await session.commit()
    await session.refresh(employee)
    designation = await session.get(Designation, employee.designation_id) if employee.designation_id else None
    return {
        **employee.__dict__,
        "designation_id": str(employee.designation_id) if employee.designation_id else None,
        "designation_name": designation.name if designation else None
    }

# Delete Employee
@router.delete("/employee/{employee_id}")
async def delete_employee(employee_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    employee = await session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    await session.delete(employee)
    await session.commit()
    return {"detail": "Employee deleted"}

# List Employees
@router.get("/employee", response_model=list[EmployeeOut])
async def list_employees(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Employee))
    employees = result.scalars().all()
    # Fetch all designations in one go for efficiency
    designation_map = {}
    designation_ids = {e.designation_id for e in employees if e.designation_id}
    if designation_ids:
        designation_result = await session.execute(select(Designation).where(Designation.id.in_(designation_ids)))
        for d in designation_result.scalars().all():
            designation_map[d.id] = d.name
    return [
        {
            **employee.__dict__,
            "designation_id": str(employee.designation_id) if employee.designation_id else None,
            "designation_name": designation_map.get(employee.designation_id)
        }
        for employee in employees
    ]