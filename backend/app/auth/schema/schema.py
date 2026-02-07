from typing import Optional
from pydantic import BaseModel, EmailStr, UUID4
from pydantic import BaseModel, EmailStr
from app.auth.models import MemberStatusEnum


#center admin login request and response schemas
class CenterAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CenterAdminLoginResponse(BaseModel):
    id: str
    email: EmailStr
    center_id: str | None
    role: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


#member login and otp verification request and response schemas
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    otp: str

class MemberLoginResponse(BaseModel):
    id: str
    email: str
    phone: str
    home_center_id: str | None
    member_status: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"



class MemberProfileUpdate(BaseModel):
    username: str = None
    mobile: str = None
    profile_photo: str = None
    date_of_birth: str = None  # "YYYY-MM-DD"
    blood_group: str = None
    blocked_reason: str = None
    time_slot_id: str = None
    member_status: MemberStatusEnum = None


#-------------------------------
#employee management schemas
#-------------------------------
class EmployeeCreate(BaseModel):
    fullname: str
    email: EmailStr
    mobile: str
    qualification: Optional[str] = None
    experience: Optional[int] = 0
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    pin: Optional[str] = None
    address: Optional[str] = None
    password: str

class EmployeeUpdate(BaseModel):
    fullname: Optional[str]
    email: Optional[EmailStr]
    mobile: Optional[str]
    qualification: Optional[str]
    experience: Optional[int]
    country: Optional[str]
    state: Optional[str]
    city: Optional[str]
    pin: Optional[str]
    address: Optional[str]
    password: Optional[str]

class EmployeeOut(BaseModel):
    id: UUID4
    fullname: str
    email: EmailStr
    mobile: str
    qualification: Optional[str]
    experience: Optional[int]
    country: Optional[str]
    state: Optional[str]
    city: Optional[str]
    pin: Optional[str]
    address: Optional[str]

    class Config:
        orm_mode = True
