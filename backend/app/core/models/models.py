from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, JSON, Text, DateTime,Enum
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
from app.core.models.base import Base
import uuid
import enum
from decimal import Decimal
from datetime import datetime
from app.core.models.base import AuditMixin





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

    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)
    gender = Column(Enum(GenderEnum, name="gender_enum"), nullable=True)

    password_hash = Column(String, nullable=False)

    role = Column(
        Enum(UserRole, name="user_role_enum"),
        nullable=False,
        index=True
    )

    status = Column(
        Enum(StatusEnum, name="status_enum"),
        nullable=False,
        default=StatusEnum.active,
        index=True
    )

    __mapper_args__ = {
        "polymorphic_on": role,
        "polymorphic_identity": UserRole.member,
    }

    # Relationships
    payment_orders = relationship(
        "PaymentOrder",
        back_populates="payer",
        cascade="all, delete-orphan"
    )




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

    category = relationship("SKUCategory", back_populates="skus")