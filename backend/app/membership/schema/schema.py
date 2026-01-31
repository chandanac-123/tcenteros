from pydantic import BaseModel, UUID4, constr, condecimal, Field, EmailStr
from datetime import date
import uuid
from uuid import UUID

class MembershipCreate(BaseModel):
    membership_name: str
    membership_code: str
    description: str = ""
    duration: str
    default_price: float


class MembershipOut(BaseModel):
    membership_id: UUID
    center_id: UUID
    membership_name: str
    membership_code: str
    description: str
    duration: str
    default_price: float
    status: str


class MemberCreate(BaseModel):
    username: constr(min_length=1)
    email: EmailStr
    password: constr(min_length=6)
    gender: str = None
    mobile: str = None
    profile_photo: str = None
    blood_group: str = None
    date_of_birth: date = None
    address_line_1: str
    address_line_2: str = ""
    city: str
    state: str
    country: str
    postal_code: str
    membership_id: UUID4
    time_slot_id: UUID4 = None