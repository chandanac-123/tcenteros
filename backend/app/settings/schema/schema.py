from pydantic import BaseModel
from typing import Optional
import uuid

#center category
class CenterCategoryCreate(BaseModel):
    name: str
    code: str

class CenterCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    image_url: Optional[str] = None

    class Config:
        orm_mode = True


    
#tax category
class TaxCategoryBase(BaseModel):
    name: str
    tax_type: str
    tax_percentage: float = 0.0
    tax_scope: str
    is_active: Optional[bool] = True

class TaxCategoryCreate(TaxCategoryBase):
    pass

class TaxCategoryUpdate(TaxCategoryBase):
    pass

class TaxCategoryOut(TaxCategoryBase):
    id: uuid.UUID

    class Config:
        orm_mode = True