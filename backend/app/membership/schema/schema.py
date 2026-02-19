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
    membership_features: List[MembershipFeatureOut]


class MemberCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
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
    member_status: MemberStatusEnum = MemberStatusEnum.member


#time slot change request schema
class TimeSlotChangeRequestIn(BaseModel):
    new_time_slot_id: str
    change_type: TimeSlotChangeType  # "permanent" or "temporary"
    start_date: date
    end_date: date | None = None
    reason: str | None = None


class GuestRegisterIn(BaseModel):
    full_name: str