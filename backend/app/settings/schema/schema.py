from pydantic import BaseModel, UUID4, conint, validator, HttpUrl, condecimal
from datetime import time, date
from typing import Optional, List
import uuid
from datetime import datetime
from uuid import UUID


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



#center operations settings
class CenterOperationalSettingCreate(BaseModel):
    opening_time: time
    closing_time: time
    week_off_days: List[str]
    payroll_cycle_day: int = 1
    inventory_profit: condecimal(max_digits=10, decimal_places=2) = 0.0

    @validator("opening_time", "closing_time", pre=True)
    def parse_time(cls, v):
        if isinstance(v, time):
            return v
        try:
            return time.fromisoformat(v) if len(v.split(":")) == 3 else time.fromisoformat(v + ":00")
        except Exception:
            raise ValueError("Time must be in HH:MM or HH:MM:SS format")

class CenterOperationalSettingUpdate(BaseModel):
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    week_off_days: Optional[List[str]] = None
    payroll_cycle_day: Optional[int] = None
    inventory_profit: Optional[condecimal(max_digits=10, decimal_places=2)] = None

class CenterOperationalSettingOut(BaseModel):
    id: UUID4
    center_id: UUID4
    opening_time: time
    closing_time: time
    week_off_days: List[str]
    payroll_cycle_day: int
    inventory_profit: float

    class Config:
        orm_mode = True


#-----------------------------------------
#Designation crud schemas
#-----------------------------------------
class DesignationCreate(BaseModel):
    name: str
    # code: str
    description: Optional[str] = None
    hierarchy_level: Optional[int] = 0
    is_managerial: Optional[bool] = False
    status: Optional[str] = "active"
    image_url: Optional[HttpUrl] = None  # S3 URL

class DesignationUpdate(BaseModel):
    name: Optional[str]
    code: Optional[str]
    description: Optional[str]
    hierarchy_level: Optional[int]
    is_managerial: Optional[bool]
    status: Optional[str]
    image_url: Optional[HttpUrl]

class DesignationOut(BaseModel):
    id: UUID4
    name: str
    code: str
    description: Optional[str]
    hierarchy_level: int
    is_managerial: bool
    status: str
    image_url: Optional[HttpUrl]

    class Config:
        orm_mode = True


class TermsPrivacyOut(BaseModel):
    id: UUID
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



class FAQCreate(BaseModel):
    question: str
    answer: str

class FAQOut(BaseModel):
    id: UUID
    question: str
    answer: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



#------------------------
#Holiday schema
#------------------------
class CenterHolidayCreate(BaseModel):
    holiday_name: str
    start_date: date
    end_date: date

class CenterHolidayOut(BaseModel):
    id: UUID4
    holiday_name: str
    start_date: date
    end_date: date
    day: List[str]  # List of weekday names

    class Config:
        orm_mode = True


#------------------------
#sku category schema
#------------------------
class SKUCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SKUCategoryOut(BaseModel):
    id: UUID4
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True