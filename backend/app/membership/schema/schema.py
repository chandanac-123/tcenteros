from pydantic import BaseModel, UUID4, constr, condecimal, Field, EmailStr
from datetime import date

class MembershipCreate(BaseModel):
    membership_name: constr(min_length=1)
    membership_code: constr(min_length=1)
    description: str = ""
    duration: str
    default_price: condecimal(max_digits=10, decimal_places=2)


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