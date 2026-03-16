# app/center/schema/onboarding.py

from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import List, Optional, Any, Union, Dict
from datetime import time
from uuid import UUID

class CenterOnboardingTempCreate(BaseModel):
    center_name: str
    contact_person: str
    center_email: EmailStr
    center_phone: str
    city: str
    center_category_id: UUID4
    kind_of_center: Optional[Any] = None  # JSON field, can be list/dict
    members_count: int = 0
    trainer_count: int = 0
    currently_using_digital_tool: Optional[Union[dict, list]] = None  # <-- JSON
    marketing_platform: Optional[Union[dict, list]] = None  # <-- JSON
    platform_feature_ids: List[UUID4]
    is_terms_and_conditions: bool = False
    subscription_duration: str = "yearly"  # "monthly" or "yearly"


class CenterOnboardingTempOut(CenterOnboardingTempCreate):
    id: UUID4
    calculated_amount: float

    class Config:
        orm_mode = True


class PlatformFeatureInfo(BaseModel):
    id: UUID4
    feature_name: str
    description: Optional[str] = None

class CenterCategoryInfo(BaseModel):
    id: UUID4
    name: str

class CenterOnboardingTempDetailedOut(BaseModel):
    id: UUID4
    center_name: str
    contact_person: str
    center_email: EmailStr
    center_phone: str
    city: str
    center_category: CenterCategoryInfo
    kind_of_center: Optional[Any] = None
    members_count: int
    trainer_count: int
    currently_using_digital_tool: Optional[Union[dict, list]] = None
    marketing_platform: Optional[Union[dict, list]] = None
    platform_features: List[PlatformFeatureInfo]
    is_terms_and_conditions: bool
    calculated_amount: float

class GSTCalculationRequest(BaseModel):
    selected_features: List[UUID4]

class TaxInfo(BaseModel):
    id: str
    name: str
    tax_type: str
    tax_percentage: float
    tax_scope: str

class GSTCalculationResponse(BaseModel):
    center_name: str
    center_phone: str
    city: str
    total_base_price: float
    total_tax: float
    total_amount: float
    tax: Optional[TaxInfo] = None

class PaymentOrderCreate(BaseModel):
    onboarding_id: UUID4
    amount: float

class PaymentOrderOut(BaseModel):
    payment_order_id: UUID4
    status: str
    amount: float

class FinalizeOnboardingRequest(BaseModel):
    address_line_1: str
    address_line_2: Optional[str] = None
    gst_number: Optional[str] = None


class GSTCalculationRequest(BaseModel):
    selected_features: List[UUID4]
    onboarding_id: Optional[UUID4] = None     


class CenterAdminInfo(BaseModel):
    id: UUID4
    center_id: UUID4

    class Config:
        from_attributes = True

class CenterInfo(BaseModel):
    id: UUID4
    center_name: str
    center_category_id: UUID4
    address_id: UUID4
    approval_status: str
    center_status: str

    class Config:
        from_attributes = True

class PaymentOrderInfo(BaseModel):
    payment_order_id: UUID4
    total_amount: float
    status: str

    class Config:
        from_attributes = True

class FeatureSubscriptionInfo(BaseModel):
    id: UUID4
    center_id: UUID4
    feature_id: UUID4
    payment_order_id: UUID4
    pricing_type: str
    unit_price: float
    tax_category_id: Optional[UUID4]
    start_date: Any
    status: str

    class Config:
        from_attributes = True

class OnboardingFinalizeResponse(BaseModel):
    message: str
    center: CenterInfo
    center_admin: CenterAdminInfo
    payment: PaymentOrderInfo
    feature_subscriptions: List[FeatureSubscriptionInfo]
    accounts_initialized: bool = True

    class Config:
        from_attributes = True


# 9. Center Time Slot Schemas
class CenterTimeSlotCreate(BaseModel):
    start_time: str
    end_time: str
    slot_capacity: int

class CenterTimeSlotUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    slot_capacity: Optional[int] = None

class CenterTimeSlotOut(BaseModel):
    id: UUID4
    center_id: UUID4
    start_time: str
    end_time: str
    slot_capacity: int

    class Config:
        orm_mode = True


class CenterLocationCreate(BaseModel):
    center_id: UUID4
    latitude: float
    longitude: float

class CenterLocationOut(BaseModel):
    center_id: UUID4
    latitude: float
    longitude: float

    class Config:
        orm_mode = True



#--------------------------------
#central profile update schema  
#--------------------------------
class AddressUpdate(BaseModel):
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class CenterProfileUpdate(BaseModel):
    center_name: Optional[str] = None
    about: Optional[str] = None
    facilities: Optional[List[str]] = None
    website_url: Optional[str] = None
    capacity: Optional[int] = None
    approval_status: Optional[str] = None
    center_status: Optional[str] = None
    network_enabled: Optional[bool] = None
    networking_amount: Optional[float] = None
    white_label_enabled: Optional[bool] = None
    kind_of_center: Optional[str] = None # <-- Make sure this is str or Enum, not dict
    members_count: Optional[int] = None
    trainer_count: Optional[int] = None
    currently_using_digital_tool: Optional[List[str]] = None
    marketing_platform: Optional[List[str]] = None
    contact_person: Optional[str] = None
    center_email: Optional[str] = None
    center_phone: Optional[str] = None
    gst_number: Optional[str] = None
    live_class_enable: Optional[bool] = None
    address: Optional[AddressUpdate] = None
    whatsapp_number: str

#image gallary schema
class CenterGalleryImageOut(BaseModel):
    id: UUID
    center_id: UUID
    center_name: str
    image_url: str

    class Config:
        orm_mode = True

class CenterGalleryImageCreate(BaseModel):
    image_url: str  # This will be set after S3 upload

class CenterGalleryImageUpdate(BaseModel):
    image_url: str


#schema for center profile  for member
class TrainerOut(BaseModel):
    name: str
    profile_photo: Optional[str] = None

class AddressOut(BaseModel):
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    district: Optional[str]
    postal_code: Optional[str]
    address_line_1: Optional[str]
    address_line_2: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

class MembershipPlanOut(BaseModel):
    membership_id: str
    membership_name: str
    membership_code: str
    duration_count: int
    duration_unit: str
    description: str
    default_price: float
    status: str

    class Config:
        orm_mode = True


class CenterOperationalInfoOut(BaseModel):
    center_id: str
    center_name: str
    about: Optional[str]
    facilities: Optional[List[str]]
    address: AddressOut
    opening_time: str
    closing_time: str
    current_day: str
    trainers: List[TrainerOut]
    gallery: List[CenterGalleryImageOut]  
    membership_plans: List[MembershipPlanOut] 

    class Config:
        orm_mode = True



