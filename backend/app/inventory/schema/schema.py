from pydantic import BaseModel
from typing import  Optional
from decimal import Decimal
from uuid import UUID

class ProductCreateRequest(BaseModel):
    name: str
    unit_of_measure: str
    base_price: Decimal
    selling_price: Decimal
    reorder_level: int
    sku_category_id: UUID
    description: Optional[str] = None