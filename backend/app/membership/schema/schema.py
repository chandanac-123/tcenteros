from pydantic import BaseModel, UUID4, constr, condecimal, Field, EmailStr
from datetime import date
import uuid
from app.auth.models.models import MemberStatusEnum
from app.center.models.models import TimeSlotChangeType
from uuid import UUID
from typing import List, Optional

class MembershipFeatureIn(BaseModel):
    feature_name: str
    feature_description: Optional[str] = None

class MembershipCreate(BaseModel):
    membership_name: str
    description: Optional[str] = None
    duration_count: int
    duration_unit: str  # likely an Enum: "day", "month", "year", etc.
    default_price: float
    membership_features: List[str]  # List of feature names
    network_enabled: Optional[bool] = False


class MembershipFeatureOut(BaseModel):
    id: UUID
    feature_name: str
    feature_description: Optional[str] = None

class MembershipOut(BaseModel):
    membership_id: str
    center_id: str
    membership_name: str
    membership_code: str
    description: Optional[str]
    duration_count: int
    duration_unit: str
    default_price: float
    status: str
    network_enabled: bool
    membership_features: List[MembershipFeatureOut]

class MembershipOutMini(BaseModel):
    membership_id: str
    membership_name: str
    default_price: float
    


class MemberCreate(BaseModel):
    center_id: str
    full_name: str
    email: EmailStr
    mobile: str
    gender: Optional[str]
    date_of_birth: Optional[date]
    blood_group: Optional[str]
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: str
    membership_id: Optional[str] = None
    time_slot_id: Optional[str] = None
    member_status: str  # member, guest, visitor, lead
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None  # paid, unpaid
    password: Optional[str] = None  # Only for paid member



class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    blood_group: Optional[str] = None
    address_line_1: str = None
    address_line_2: Optional[str] = None
    city: str = None
    state: str = None
    country: str = None
    postal_code: str = None
    membership_id: Optional[str] = None
    home_center_id: Optional[str] = None
    time_slot_id: Optional[str] = None
    member_status: Optional[str] = None  # member, guest, visitor, etc.
    status: Optional[str] = None    


#time slot change request schema
class TimeSlotChangeRequestIn(BaseModel):
    new_time_slot_id: str
    change_type: TimeSlotChangeType  # "permanent" or "temporary"
    start_date: date
    end_date: date | None = None
    reason: str | None = None


class GuestRegisterIn(BaseModel):
    full_name: str