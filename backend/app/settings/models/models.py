from sqlalchemy import Column, String, Text, ForeignKey, Enum, Boolean, Integer, Numeric
from app.core.models import AuditMixin
from app.core.models import StatusEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import uuid
import enum

Base = declarative_base()

class AddressType(enum.Enum):
    home = "home"
    office = "office"
    other = "other"


class TaxType(enum.Enum):
    gst = "gst"
    cgst_sgst = "cgst_sgst"
    igst = "igst"
    vat = "vat"
    none = "none"

class Address(Base, AuditMixin):
    __tablename__ = "address"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address_type = Column(Enum(AddressType), default=AddressType.other)
    address_line_1 = Column(String)
    address_line_2 = Column(String)
    city = Column(String)
    district = Column(String)
    state = Column(String)
    country = Column(String)
    postal_code = Column(String)
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    is_primary = Column(Boolean, default=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)

    # Relationship to centers (one-to-many)
    centers = relationship("Center", back_populates="address")

# ------------------------
# Tax Categories
# ------------------------
class TaxCategory(Base, AuditMixin):
    __tablename__ = "tax_categories"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    tax_type = Column(Enum(TaxType), default=TaxType.none, nullable=False)
    tax_percentage = Column(Numeric(5, 2), default=0.0)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

# ------------------------
# Designations
# ------------------------
class Designation(Base, AuditMixin):
    __tablename__ = "designations"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    description = Column(Text)
    hierarchy_level = Column(Integer, default=0)
    is_managerial = Column(Boolean, default=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)
    

# ------------------------
# Center Categories
# ------------------------
class CenterCategory(Base, AuditMixin):
    __tablename__ = "center_categories"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    parent_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.center_categories.id"), nullable=True)
    description = Column(Text)
    display_order = Column(Integer, default=0)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)

    # Self-referencing relationship
    parent_category = relationship("CenterCategory", remote_side=[id], backref="sub_categories")
    
    # Relationship to centers
    centers = relationship("Center", back_populates="category")


class SKUCategory(Base, AuditMixin):
    __tablename__ = "sku_categories"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)

    # Relationship: one category has many SKUs
    skus = relationship("SKU", back_populates="category")


