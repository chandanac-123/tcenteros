from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


# Define Pydantic-compatible enums (DO NOT import from models)
class TransactionTypeEnum(str, Enum):
    membership = "membership"
    product = "product"
    network = "network"
    service = "service"


class TransactionSourceEnum(str, Enum):
    local = "local"
    pos = "pos"
    visit = "visit"
    online = "online"


class TransactionStatusEnum(str, Enum):
    paid = "paid"
    pending = "pending"
    unpaid = "unpaid"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"


class PaymentMethodEnum(str, Enum):
    cash = "cash"
    card = "card"
    upi = "upi"
    bank_transfer = "bank_transfer"
    other = "other"


class OrderTypeEnum(str, Enum):
    center_subscription = "center_subscription"
    feature_purchase = "feature_purchase"
    renewal = "renewal"
    upgrade = "upgrade"
    add_on = "add_on"
    refund = "refund"
    stock_purchase = "stock_purchase"


# Response schemas
class CustomerResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionItemResponse(BaseModel):
    description: str
    quantity: int
    unit_price: str
    tax: str
    total: str

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    invoice_number: Optional[str] = None
    transaction_id: str
    customer_name: Optional[str] = None
    customer_id: Optional[str] = None
    type: str
    source: str
    date: datetime
    subtotal: str
    tax: str
    total_amount: str
    payment_method: Optional[str] = None
    status: str
    reference_id: Optional[str] = None
    reference_schema: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentDetailsResponse(BaseModel):
    transaction_ref: Optional[str] = None
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TransactionDetailResponse(BaseModel):
    invoice_number: Optional[str] = None
    transaction_id: str
    customer: Optional[CustomerResponse] = None
    type: str
    source: str
    date: datetime
    items: List[TransactionItemResponse]
    subtotal: str
    tax_amount: str
    total_amount: str
    payment_method: Optional[str] = None
    payment_details: Optional[PaymentDetailsResponse] = None
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionListPaginatedResponse(BaseModel):
    page: int
    page_size: int
    total: int
    transactions: List[TransactionListResponse]

    class Config:
        from_attributes = True


# Request schemas
class TransactionItemCreate(BaseModel):
    reference_id: str
    description: str
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class PaymentCreate(BaseModel):
    method: PaymentMethodEnum  # Changed from PaymentMethod
    amount: Decimal = Field(gt=0)
    transaction_ref: Optional[str] = None


class TransactionCreate(BaseModel):
    customer_id: str
    type: TransactionTypeEnum  # Changed from OrderType
    source: Optional[TransactionSourceEnum] = TransactionSourceEnum.local
    items: List[TransactionItemCreate]
    tax_category_id: Optional[str] = None
    payment: Optional[PaymentCreate] = None
    notes: Optional[str] = None


class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatusEnum] = None  # Changed from PaymentOrderStatus
    payment_method: Optional[PaymentMethodEnum] = None  # Changed from PaymentMethod
    notes: Optional[str] = None


class DailySalesSummaryResponse(BaseModel):
    date: date
    total_transactions: int
    total_revenue: str
    by_type: dict
    by_payment_method: dict
    paid: str
    pending: str

    class Config:
        from_attributes = True




#------------billing membership schema----------------
class MembershipRenewalRequest(BaseModel):
    member_membership_id: str
    discount_amount: Optional[Decimal] = Decimal("0.00")
    payment_method: str  # cash, card, upi, bank_transfer, other
    tax_category_id: Optional[str] = None


class MembershipBillingResponse(BaseModel):
    member_id: str
    member_name: str
    member_mobile: Optional[str]
    plan_name: str
    membership_id: str
    member_membership_id: str
    start_date: str
    end_date: Optional[str]
    expiry_date: Optional[str]
    days_until_expiry: Optional[int]
    renewal_status: str  # active, due, expired
    total_amount: str
    membership_status: str