# app/platforms/schema/platform_feature.py

from pydantic import BaseModel, UUID4, condecimal
from typing import Optional

class PlatformFeatureBase(BaseModel):
    feature_name: str
    description: Optional[str] = None
    base_price: condecimal(max_digits=10, decimal_places=2)

class PlatformFeatureCreate(PlatformFeatureBase):
    pass

class PlatformFeatureUpdate(BaseModel):
    feature_name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[condecimal(max_digits=10, decimal_places=2)] = None

class PlatformFeatureOut(PlatformFeatureBase):
    id: UUID4

    class Config:
        orm_mode = True