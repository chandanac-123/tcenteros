from sqlalchemy import Column, String, Boolean, Numeric, Enum, DateTime, ForeignKey, JSON, Integer
from app.core.models import AuditMixin
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid
import enum



Base = declarative_base()

# ------------------------
# Enums
# ------------------------
class ApprovalStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class CenterStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    closed = "closed"

# ------------------------
# Center Model
# ------------------------
class Center(Base, AuditMixin):
    __tablename__ = "centers"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_name = Column(String, nullable=False)
    center_code = Column(String, unique=True, nullable=True)
    
    # Foreign keys to settings schema
    center_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.center_categories.id"), nullable=True)
    address_id = Column(UUID(as_uuid=True), ForeignKey("settings.address.id"), nullable=True)
    
    website_url = Column(String)
    capacity = Column(Numeric)
    
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.pending, nullable=True)
    center_status = Column(Enum(CenterStatus), default=CenterStatus.active, nullable=False)
    
    network_enabled = Column(Boolean, default=False)
    network_joined_date = Column(DateTime, nullable=True)
    white_label_enabled = Column(Boolean, default=True)

    # ------------------------
    # Other onboarding Fields
    # ------------------------
    kind_of_center = Column(JSON)  # list stored as JSON
    members_count = Column(Integer, default=0)
    trainer_count = Column(Integer, default=0)

    currently_using_digital_tool = Column(String)
    marketing_platform = Column(String)

    contact_person = Column(String)
    center_email = Column(String)
    center_phone = Column(String)

    live_class_enable = Column(Boolean, default=False)



    # Relationships (optional, for easy ORM access)
    category = relationship("CenterCategory", back_populates="centers", foreign_keys=[center_category_id])
    address = relationship("Address", back_populates="centers", foreign_keys=[address_id])