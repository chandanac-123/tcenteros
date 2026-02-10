from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class TicketMessageOut(BaseModel):
    id: UUID
    sender_id: UUID
    sender_role: str
    message: Optional[str]
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TicketOut(BaseModel):
    id: UUID
    member_id: UUID
    center_id: Optional[UUID]
    assigned_admin_id: Optional[UUID]
    status: str
    subject: str
    description: str
    image_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    messages: List[TicketMessageOut]

    class Config:
        from_attributes = True