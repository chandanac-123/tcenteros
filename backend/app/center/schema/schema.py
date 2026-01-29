# app/center/schema/onboarding.py

from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import List, Optional, Any

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
    currently_using_digital_tool: Optional[str] = None
    marketing_platform: Optional[Any] = None  # JSON field, can be list/dict
    platform_feature_ids: List[UUID4]
    is_terms_and_conditions: bool = False


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
    currently_using_digital_tool: Optional[str] = None
    marketing_platform: Optional[Any] = None
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
    center: CenterInfo
    center_admin: CenterAdminInfo
    payment: PaymentOrderInfo
    feature_subscriptions: List[FeatureSubscriptionInfo]

    class Config:
        from_attributes = True