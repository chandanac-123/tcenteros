from pydantic import BaseModel
from typing import  Optional
from decimal import Decimal
from uuid import UUID
from datetime import date

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