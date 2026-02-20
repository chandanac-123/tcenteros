
from fastapi import APIRouter, Query , Request, UploadFile, File, HTTPException, Depends, Form, status
from app.s3.service import upload_file, get_file_url, delete_file
import urllib.parse
from app.core.database import get_async_session
from app.auth.schema.schema import CenterAdminLoginRequest, CenterAdminLoginResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth.models.models import User
from app.core.security import verify_password
from app.core.security import create_access_token, create_refresh_token
from app.auth.schema.schema import OTPRequest, OTPVerify, MemberLoginResponse, EmployeeCreate, EmployeeOut, EmployeeUpdate, MemberProfileOut, EmployeeOut, TimeSlotOut, AddressOut, CenterAdminChangePasswordIn, CenterAdminForgotPasswordRequest, CenterAdminVerifyOtpIn,  CenterAdminSetPasswordIn
from app.core.dependencies import superadmin_required
from app.auth.models.models import Member, Employee
from app.center.models.models import Center, CenterTimeSlot
from datetime import datetime
from uuid import uuid4
from app.auth.models.models import MemberStatusEnum
from app.settings.models.models import Address, AddressType
from app.core.models.models import StatusEnum, SuperadminInfo
from app.core.dependencies import member_required, get_current_user, centeradmin_required
from passlib.context import CryptContext
from app.settings.models.models import Designation
import uuid
from fastapi.concurrency import run_in_threadpool
from datetime import datetime, date
from typing import Optional, List
from pydantic import EmailStr
from sqlalchemy import  and_
import logging


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
            email=f"guest_{phone_str}@autogen.local",
            username=f"guest_{phone_str}",
            password_hash="otp_guest",  # <-- Provide a dummy non-null value
            role="member",
            status=StatusEnum.active,
            mobile=phone_str,
            member_status=MemberStatusEnum.guest,  # <-- Set as guest
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
async def logout_member(request: Request, current_member=Depends(member_required)):
    """
    Logs out an authenticated member.
    Requires a valid JWT token in the Authorization header.
    """
    # Debug: Print headers and member info
    print("Logout request headers:", dict(request.headers))
    print("Authenticated member info:", current_member)

    # You can't invalidate JWT on the server side (unless you use a blacklist).
    # The client should delete the token.
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
@router.post("/member/profile", response_model=MemberProfileOut)
async def update_member_profile(
    full_name: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required),
    request: Request = None, 
):  
    if request:
        form = await request.form()
        logger = logging.getLogger("uvicorn")
        logger.info("Incoming form data: %s", dict(form))
        logger.info("Headers: %s", dict(request.headers))

    member = await session.get(Member, current_member["user_id"])
    if not member:
        raise HTTPException(404, "Member not found")

    updated = False

    if full_name is not None:
        member.full_name = full_name
        updated = True
    if email is not None:
        member.email = email
        updated = True
    if profile_photo:
        file_bytes = await profile_photo.read()
        ext = profile_photo.filename.split('.')[-1]
        key = f"uploads/profile_photos/{member.id}_{uuid.uuid4()}.{ext}"
        upload_file(file_bytes, key, content_type=profile_photo.content_type)
        member.profile_photo = get_file_url(key)
        updated = True

    if updated:
        member.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(member)

    # Get center city from center's address
    center_city = None
    if member.home_center_id:
        center = await session.get(Center, member.home_center_id)
        if center and center.address_id:
            center_address = await session.get(Address, center.address_id)
            if center_address:
                center_city = center_address.city

    # Get time slot details
    time_slot_dict = None
    if member.time_slot_id:
        time_slot = await session.get(CenterTimeSlot, member.time_slot_id)
        if time_slot:
            time_slot_dict = TimeSlotOut(
                id=str(time_slot.id),
                start_time=time_slot.start_time,
                end_time=time_slot.end_time,
                slot_capacity=time_slot.slot_capacity
            )

    # Member's address (optional, for completeness)
    address_dict = None
    if member.address_id:
        address = await session.get(Address, member.address_id)
        if address:
            address_dict = AddressOut(
                address=address.address_line_1,
                city=address.city,
                state=address.state,
                country=address.country,
                pin=address.postal_code,
            )

    return MemberProfileOut(
        id=str(member.id),
        email=member.email,
        full_name=member.full_name,
        mobile=member.mobile,
        profile_photo=member.profile_photo,
        address=address_dict,
        member_status=member.member_status.value,
        city=center_city,  # This is the center's city
        time_slot_id=str(member.time_slot_id) if member.time_slot_id else None,
        time_slot=time_slot_dict,
    )



#2. Get Profile 
@router.get("/member/profile", response_model=MemberProfileOut)
async def get_own_member_profile(
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    member = await session.get(Member, current_member["user_id"])
    if not member:
        raise HTTPException(404, "Member not found")

    member_status = member.member_status.value if hasattr(member.member_status, "value") else str(member.member_status)

    # If guest and profile not updated (no full_name and no email), return only mobile
    if (
        member_status == "guest"
        and not member.full_name
        and not member.email
    ):
        return MemberProfileOut(
            id=str(member.id),
            email="",
            full_name="",
            mobile=member.mobile,
            profile_photo="",
            address=None,
            member_status=member_status,
            city="",
            time_slot_id=None,
            time_slot=None,
        )

    # Otherwise, return full profile (even if guest, but profile is updated)
    center_city = None
    if member.home_center_id:
        center = await session.get(Center, member.home_center_id)
        if center and center.address_id:
            center_address = await session.get(Address, center.address_id)
            if center_address:
                center_city = center_address.city

    time_slot_dict = None
    if member.time_slot_id:
        time_slot = await session.get(CenterTimeSlot, member.time_slot_id)
        if time_slot:
            time_slot_dict = TimeSlotOut(
                id=str(time_slot.id),
                start_time=time_slot.start_time,
                end_time=time_slot.end_time,
                slot_capacity=time_slot.slot_capacity
            )

    address_dict = None
    if member.address_id:
        address = await session.get(Address, member.address_id)
        if address:
            address_dict = AddressOut(
                address=address.address_line_1,
                city=address.city,
                state=address.state,
                country=address.country,
                pin=address.postal_code,
            )

    return MemberProfileOut(
        id=str(member.id),
        email=member.email or "",
        full_name=member.full_name or "",
        mobile=member.mobile,
        profile_photo=member.profile_photo or "",
        address=address_dict,
        member_status=member_status,
        city=center_city or "",
        time_slot_id=str(member.time_slot_id) if member.time_slot_id else None,
        time_slot=time_slot_dict,
    )

#-----------------------------
#employee management endpoints (CRUD)
#-----------------------------

@router.post("/employee", response_model=EmployeeOut)
async def create_employee(
    full_name: str = Form(...),
    email: EmailStr = Form(...),
    mobile: str = Form(...),
    qualification: Optional[str] = Form(None),
    experience: Optional[int] = Form(0),
    country: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    pin: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    password: str = Form(...),
    designation_id: str = Form(...),
    center_id: str = Form(...),
    joining_date: Optional[date] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    # Handle S3 image upload
    profile_photo_url = None
    if profile_photo:
        file_bytes = await profile_photo.read()
        file_ext = profile_photo.filename.split('.')[-1]
        key = f"employee_photos/{uuid4()}.{file_ext}"
        await run_in_threadpool(upload_file, file_bytes, key, profile_photo.content_type)
        profile_photo_url = await run_in_threadpool(get_file_url, key)

    # Create Employee (inherits from User)
    employee = Employee(
        id=uuid4(),
        full_name=full_name,
        email=email,
        mobile=mobile,
        qualification=qualification,
        experience_years=experience,
        password_hash=password,  # Hash if needed
        designation_id=designation_id,
        center_id=center_id,
        joining_date=joining_date,
        profile_photo=profile_photo_url,
        # Add other fields as needed
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(employee)
    await session.commit()
    await session.refresh(employee)

    # Prepare address dict if needed (not shown here)
    address_dict = None

    return EmployeeOut(
        id=employee.id,
        full_name=employee.full_name,
        email=employee.email,
        mobile=employee.mobile,
        qualification=employee.qualification,
        experience=employee.experience_years,
        designation_id=employee.designation_id,
        designation_name=None,  # Fill if you join Designation
        address_id=employee.address_id,
        address=address_dict,
        center_id=employee.center_id,
        joining_date=employee.joining_date,
    )


@router.get("/employee/{employee_id}", response_model=EmployeeOut)
async def get_employee(
    employee_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    emp = await session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    designation_name = None
    if emp.designation_id:
        desig = await session.get(Designation, emp.designation_id)
        designation_name = desig.name if desig else None
    center_name = None
    if emp.center_id:
        center = await session.get(Center, emp.center_id)
        center_name = center.center_name if center else None
    address_dict = None
    if emp.address_id:
        address = await session.get(Address, emp.address_id)
        if address:
            address_dict = {
                "address": address.address_line_1,
                "city": address.city,
                "state": address.state,
                "country": address.country,
                "pin": address.postal_code,
            }
    return EmployeeOut(
        id=emp.id,
        full_name=emp.full_name,
        email=emp.email,
        mobile=emp.mobile,
        qualification=emp.qualification,
        experience=emp.experience_years,
        designation_id=emp.designation_id,
        designation_name=designation_name,
        address_id=emp.address_id,
        address=address_dict,
        center_id=emp.center_id,
        center_name=center_name,
        joining_date=emp.joining_date,
        status=emp.status.value if hasattr(emp, "status") else None,
        profile_photo=emp.profile_photo,
    )

@router.put("/employee/{employee_id}", response_model=EmployeeOut)
async def update_employee(
    employee_id: str,
    # Employee fields
    full_name: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    mobile: Optional[str] = Form(None),
    qualification: Optional[str] = Form(None),
    experience: Optional[int] = Form(None),
    country: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    pin: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    designation_id: Optional[str] = Form(None),
    center_id: Optional[str] = Form(None),
    joining_date: Optional[date] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
    # Address fields
    address_line_1: Optional[str] = Form(None),
    address_line_2: Optional[str] = Form(None),
    address_city: Optional[str] = Form(None),
    address_state: Optional[str] = Form(None),
    address_country: Optional[str] = Form(None),
    address_pin: Optional[str] = Form(None),
    session: AsyncSession = Depends(get_async_session)
):
    emp = await session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(404, "Employee not found")

    updated = False

    # Update Employee fields
    if full_name is not None:
        emp.full_name = full_name
        updated = True
    if email is not None:
        emp.email = email
        updated = True
    if mobile is not None:
        emp.mobile = mobile
        updated = True
    if qualification is not None:
        emp.qualification = qualification
        updated = True
    if experience is not None:
        emp.experience_years = experience
        updated = True
    if country is not None:
        emp.country = country
        updated = True
    if state is not None:
        emp.state = state
        updated = True
    if city is not None:
        emp.city = city
        updated = True
    if pin is not None:
        emp.pin = pin
        updated = True
    if address is not None:
        emp.address = address
        updated = True
    if password is not None:
        emp.password_hash = password  # Hash if needed
        updated = True
    if designation_id is not None:
        emp.designation_id = designation_id
        updated = True
    if center_id is not None:
        emp.center_id = center_id
        updated = True
    if joining_date is not None:
        emp.joining_date = joining_date
        updated = True

    # Handle profile photo update
    if profile_photo:
        file_bytes = await profile_photo.read()
        file_ext = profile_photo.filename.split('.')[-1]
        key = f"employee_photos/{uuid4()}.{file_ext}"
        await run_in_threadpool(upload_file, file_bytes, key, profile_photo.content_type)
        emp.profile_photo = await run_in_threadpool(get_file_url, key)
        updated = True

    # Update or create Address if any address field is provided
    if any([address_line_1, address_line_2, address_city, address_state, address_country, address_pin]):
        if not emp.address_id:
            # Create a new Address if none exists
            new_addr = Address(
                id=uuid4(),
                address_line_1=address_line_1,
                address_line_2=address_line_2,
                city=address_city,
                state=address_state,
                country=address_country,
                postal_code=address_pin,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(new_addr)
            await session.flush()
            emp.address_id = new_addr.id
            addr = new_addr
        else:
            addr = await session.get(Address, emp.address_id)
            if not addr:
                raise HTTPException(404, "Address not found")
            if address_line_1 is not None:
                addr.address_line_1 = address_line_1
            if address_line_2 is not None:
                addr.address_line_2 = address_line_2
            if address_city is not None:
                addr.city = address_city
            if address_state is not None:
                addr.state = address_state
            if address_country is not None:
                addr.country = address_country
            if address_pin is not None:
                addr.postal_code = address_pin
        updated = True
    else:
        addr = None

    if updated:
        await session.commit()
        await session.refresh(emp)

    # Fetch related fields for response
    designation_name = None
    if emp.designation_id:
        desig = await session.get(Designation, emp.designation_id)
        designation_name = desig.name if desig else None

    center_name = None
    if emp.center_id:
        center = await session.get(Center, emp.center_id)
        center_name = center.center_name if center else None

    address_dict = None
    if emp.address_id:
        addr = await session.get(Address, emp.address_id)
        if addr:
            address_dict = {
                "address": addr.address_line_1,
                "city": addr.city,
                "state": addr.state,
                "country": addr.country,
                "pin": addr.postal_code,
            }

    return EmployeeOut(
        id=emp.id,
        full_name=emp.full_name,
        email=emp.email,
        mobile=emp.mobile,
        qualification=emp.qualification,
        experience=emp.experience_years,
        designation_id=emp.designation_id,
        designation_name=designation_name,
        address_id=emp.address_id,
        address=address_dict,
        center_id=emp.center_id,
        center_name=center_name,
        joining_date=emp.joining_date,
        status=emp.status.value if hasattr(emp, "status") and emp.status else None,
        profile_photo=emp.profile_photo,
    )


@router.delete("/employee/{employee_id}")
async def delete_employee(
    employee_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    emp = await session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    await session.delete(emp)
    await session.commit()
    return {"detail": "Employee deleted"}


@router.get("/employee", response_model=List[EmployeeOut])
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    full_name: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    mobile: Optional[str] = Query(None),
    designation_name: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_async_session)
):
    filters = []
    if full_name:
        filters.append(Employee.full_name.ilike(f"%{full_name}%"))
    if email:
        filters.append(Employee.email.ilike(f"%{email}%"))
    if mobile:
        filters.append(Employee.mobile.ilike(f"%{mobile}%"))

    # If designation_name filter is used, join Designation table
    query = select(Employee)
    if designation_name:
        from sqlalchemy.orm import aliased, joinedload
        DesignationAlias = aliased(Designation)
        query = query.join(DesignationAlias, Employee.designation_id == DesignationAlias.id)
        filters.append(DesignationAlias.name.ilike(f"%{designation_name}%"))

    if filters:
        query = query.where(and_(*filters))

    # Pagination
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await session.execute(query)
    employees = result.scalars().all()
    employee_list = []
    for emp in employees:
        # Fetch designation name if needed
        designation_name_val = None
        if emp.designation_id:
            desig = await session.get(Designation, emp.designation_id)
            designation_name_val = desig.name if desig else None
        # Fetch center name if needed
        center_name = None
        if emp.center_id:
            center = await session.get(Center, emp.center_id)
            center_name = center.center_name if center else None
        # Fetch address details if needed
        address_dict = None
        if emp.address_id:
            address = await session.get(Address, emp.address_id)
            if address:
                address_dict = {
                    "address": address.address_line_1,
                    "city": address.city,
                    "state": address.state,
                    "country": address.country,
                    "pin": address.postal_code,
                }
        employee_list.append(EmployeeOut(
            id=emp.id,
            full_name=emp.full_name,
            email=emp.email,
            mobile=emp.mobile,
            qualification=emp.qualification,
            experience=emp.experience_years,
            designation_id=emp.designation_id,
            designation_name=designation_name_val,
            address_id=emp.address_id,
            address=address_dict,
            center_id=emp.center_id,
            center_name=center_name,
            joining_date=emp.joining_date,
            status=emp.status.value if hasattr(emp, "status") else None,
            profile_photo=emp.profile_photo,
        ))
    return 


@router.get("/superadmin-info")
async def list_superadmin_info(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    result = await session.execute(select(SuperadminInfo).order_by(SuperadminInfo.searched_at.desc()))
    infos = result.scalars().all()
    data = [
        {
            "id": str(info.id),
            "searched_location": info.searched_location,
            "searched_by": info.searched_by,
            "searched_at": info.searched_at.isoformat() if info.searched_at else None
        }
        for info in infos
    ]
    return {"superadmin_info": data}


# List Employees of the Logged-in Centeradmin's Center
@router.get("/centeradmin/employees")
async def list_center_employees(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.auth.models.models import Employee
    from app.settings.models.models import Designation

    center_id = current_admin["center_id"]
    # Join Employee and Designation to get designation name
    result = await session.execute(
        select(
            Employee.id,
            Employee.full_name,
            Designation.name.label("designation_name")
        )
        .outerjoin(Designation, Employee.designation_id == Designation.id)
        .where(Employee.center_id == center_id)
    )
    employees = [
        {
            "id": str(eid),
            "full_name": fname,
            "designation": dname
        }
        for eid, fname, dname in result.all()
    ]
    return {"employees": employees}




@router.post("/centeradmin/change-password")
async def centeradmin_change_password(
    payload: CenterAdminChangePasswordIn,
    session: AsyncSession = Depends(get_async_session)
):
    from app.auth.models.models import CenterAdmin
    from app.core.security import get_password_hash

    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = await session.execute(
        select(CenterAdmin).where(CenterAdmin.email == payload.email)
    )
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=404, detail="Center admin not found")

    admin.password_hash = get_password_hash(payload.password)
    admin.updated_at = datetime.utcnow()
    await session.commit()
    return {"detail": "Password updated successfully"}


#--------------------------------
# centeradmin forgot password flow with OTP
#`-------------------------------------------`

#Request OTP (send to email)
# Store OTPs in memory for demo (use Redis or DB in production)
centeradmin_otp_store = {}

@router.post("/centeradmin/forgot-password/request-otp")
async def centeradmin_forgot_password_request_otp(
    payload: CenterAdminForgotPasswordRequest,
    session: AsyncSession = Depends(get_async_session)
):
    from app.auth.models.models import CenterAdmin

    result = await session.execute(
        select(CenterAdmin).where(CenterAdmin.email == payload.email)
    )
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=404, detail="Center admin not found")

    # In production, send OTP to email here
    centeradmin_otp_store[payload.email] = "000000"
    return {"detail": "OTP sent to email (always 000000 in dev mode)"}


#. Verify OTP
@router.post("/centeradmin/forgot-password/verify-otp")
async def centeradmin_forgot_password_verify_otp(
    payload: CenterAdminVerifyOtpIn
):
    otp = centeradmin_otp_store.get(payload.email)
    if not otp or payload.otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    # Mark as verified (could set a flag or just allow next step)
    return {"detail": "OTP verified. You can now set a new password."}


@router.post("/centeradmin/forgot-password/set-password")
async def centeradmin_forgot_password_set_password(
    payload: CenterAdminSetPasswordIn,
    session: AsyncSession = Depends(get_async_session)
):
    from app.auth.models.models import CenterAdmin
    from app.core.security import get_password_hash

    otp = centeradmin_otp_store.get(payload.email)
    if not otp or payload.otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = await session.execute(
        select(CenterAdmin).where(CenterAdmin.email == payload.email)
    )
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=404, detail="Center admin not found")

    admin.password_hash = get_password_hash(payload.password)
    admin.updated_at = datetime.utcnow()
    await session.commit()
    # Optionally, remove OTP after use
    centeradmin_otp_store.pop(payload.email, None)
    return {"detail": "Password has been reset successfully."}