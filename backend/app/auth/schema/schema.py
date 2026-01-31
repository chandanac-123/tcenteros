

from pydantic import BaseModel, EmailStr


#center admin login request and response schemas
class CenterAdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CenterAdminLoginResponse(BaseModel):
    id: str
    email: EmailStr
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