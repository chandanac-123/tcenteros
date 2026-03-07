from pydantic import BaseModel, Field
from typing import  Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import date, datetime

class ProductCreateRequest(BaseModel):
    name: str
    unit_of_measure: Optional[str] = None
    base_price: float
    selling_price: float
    reorder_level: Optional[int] = 0
    sku_category_id: Optional[UUID] = None
    description: Optional[str] = None


class ProductUpdateRequest(BaseModel):
    # SKU/base fields
    name: Optional[str] = None
    sku_code: Optional[str] = None
    sku_category_id: Optional[UUID] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    unit_of_measure: Optional[str] = None
    status: Optional[str] = None  # "active" / "inactive" expected

    # Product-specific fields
    selling_price: Optional[float] = None
    reorder_level: Optional[int] = None
    track_inventory: Optional[bool] = None

    # Stock update
    quantity_available: Optional[int] = None

    class Config:
        orm_mode = True


class StockAdjustRequest(BaseModel):
    product_id: UUID
    quantity: int  # positive integer
    transaction_type: Optional[str] = "IN"  # "IN" or "OUT"
    supplier_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    reference: Optional[str] = None

class StockOut(BaseModel):
    product_id: UUID
    quantity_available: int

    class Config:
        orm_mode = True



class StockAdjustIn(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)
    supplier_name: str | None = None
    invoice_number: str | None = None
    invoice_date: date | None = None
    cost_price: Decimal


class StockHistoryRow(BaseModel):
    product_id: UUID
    product_name: Optional[str]
    sku_code: Optional[str]
    current_quantity: int
    transaction_id: UUID
    created_at: Optional[datetime] = None
    invoice_date: Optional[date] = None
    transaction_type: Optional[str] = None
    quantity: int
    unit_cost: Decimal
    subtotal: Decimal
    balance_after: Optional[int] = None
    supplier_name: Optional[str] = None
    invoice_number: Optional[str] = None

class AllStockHistoryResponse(BaseModel):
    page: int
    page_size: int
    total: int
    rows: List[StockHistoryRow]



class CheckoutItemIn(BaseModel):
    product_id: UUID
    quantity: int

class CheckoutPaymentIn(BaseModel):
    method: Optional[str] = None
    amount: Optional[Decimal] = None
    details: Optional[dict] = None

class CheckoutIn(BaseModel):
    items: List[CheckoutItemIn]
    payment: Optional[CheckoutPaymentIn] = None
    tax_category_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    client_reference: Optional[str] = None

    class Config:
        orm_mode = True