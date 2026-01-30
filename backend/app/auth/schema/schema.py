

from pydantic import BaseModel, EmailStr



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
