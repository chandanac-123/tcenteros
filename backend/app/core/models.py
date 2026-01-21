from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, JSON, Text, DateTime,Enum
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from decimal import Decimal
from datetime import datetime


Base = declarative_base()

# ----------------------
# Common Mixins
# ----------------------


class AuditMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("shared.users.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("shared.users.id"), nullable=True)



# ======================
# SHARED SCHEMA
# ======================

class UserRole(enum.Enum):
    superadmin = "superadmin"
    centeradmin = "centeradmin"
    member = "member"
    employee = "employee"

class StatusEnum(enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"

class GenderEnum(enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class User(Base, AuditMixin):
    __tablename__ = "users"
    __table_args__ = {"schema": "shared"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    username = Column(String)
    mobile = Column(String)
    profile_photo = Column(String)
    gender = Column(Enum(GenderEnum))
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.member)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)


class SKU(Base, AuditMixin):
    __tablename__ = "sku"
    __table_args__ = {"schema": "shared"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku_code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    sku_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.sku_categories.id"))
    description = Column(Text)
    base_price = Column(Numeric(10, 2))
    unit_of_measure = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)

    # Relationship to SKUCategory
    category = relationship("SKUCategory", back_populates="skus")

