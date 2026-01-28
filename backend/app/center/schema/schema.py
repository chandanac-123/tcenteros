# app/center/schema/onboarding.py

from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import List, Optional

class CenterOnboardingTempCreate(BaseModel):
    center_name: str
    admin_email: EmailStr
    admin_name: str
    center_category_id: UUID4
    selected_features: List[UUID4]
    city: str

class CenterOnboardingTempOut(CenterOnboardingTempCreate):
    id: UUID4

class GSTCalculationRequest(BaseModel):
    selected_features: List[UUID4]

class GSTCalculationResponse(BaseModel):
    total_base_price: float
    total_tax: float
    total_amount: float

class PaymentOrderCreate(BaseModel):
    onboarding_id: UUID4
    amount: float

class PaymentOrderOut(BaseModel):
    payment_order_id: UUID4
    status: str
    amount: float

class FinalizeOnboardingRequest(BaseModel):
    onboarding_id: UUID4
    payment_order_id: UUID4


class GSTCalculationRequest(BaseModel):
    selected_features: List[UUID4]
    onboarding_id: Optional[UUID4] = None     