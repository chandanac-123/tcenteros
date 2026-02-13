from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.core.models.models import StatusEnum

class WhiteLabelConfigCreate(BaseModel):
    app_name: str
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    custom_domain: Optional[str] = None

class WhiteLabelConfigUpdate(BaseModel):
    app_name: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    custom_domain: Optional[str] = None
    status: Optional[StatusEnum] = None

class WhiteLabelConfigOut(BaseModel):
    white_label_id: UUID
    center_id: UUID
    app_name: str
    logo_url: Optional[str]
    primary_color: Optional[str]
    secondary_color: Optional[str]
    custom_domain: Optional[str]
    status: StatusEnum

    class Config:
        orm_mode = True