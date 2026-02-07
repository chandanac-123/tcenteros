from sqlalchemy import Column, String, Text, ForeignKey, Enum, Boolean, Integer, Numeric, Time, ARRAY, Date
from app.core.models.base import AuditMixin, Base
from app.core.models.models import StatusEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import uuid
import enum


class WeekDayEnum(enum.Enum):
    monday = "Monday"
    tuesday = "Tuesday"
    wednesday = "Wednesday"
    thursday = "Thursday"
    friday = "Friday"
    saturday = "Saturday"
    sunday = "Sunday"

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

class TaxScope(enum.Enum):
    center_subscription = "center_subscription"
    membership = "membership"
    networking = "networking"
    product = "product"
    service = "service"
    platform_fee = "platform_fee"

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
    center_admins = relationship(
    "CenterAdmin",
    back_populates="address",
    foreign_keys="CenterAdmin.address_id"
)

# ------------------------
# Tax Categories
# ------------------------
class TaxCategory(Base, AuditMixin):
    __tablename__ = "tax_categories"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    tax_type = Column(Enum(TaxType), default=TaxType.none, nullable=False)
    tax_percentage = Column(Numeric(5, 2), default=0.0)
    tax_scope = Column(
        Enum(TaxScope),
        nullable=False,
        index=True,
        comment="Where this tax applies: subscription, membership, networking"
    )
    is_active = Column(Boolean, default=True)

    #relationship
    subscriptions = relationship(
        "CenterFeatureSubscription",
        back_populates="tax_category"
    )


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
    image_url = Column(String, nullable=True)  # S3 image URL


# ------------------------
# Center Categories
# ------------------------
class CenterCategory(Base, AuditMixin):
    __tablename__ = "center_categories"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    image_url = Column(String, nullable=True)  
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




class CenterOperationalSetting(Base, AuditMixin):
    __tablename__ = "center_operational_settings"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id", ondelete="CASCADE"),
        nullable=False,
      
    )

    opening_time = Column(Time, nullable=False)
    closing_time = Column(Time, nullable=False)

    # ✅ Multiple weekly off days (Sat, Sun, etc.)
    week_off_days = Column(
        ARRAY(Enum(WeekDayEnum, name="week_day_enum")),
        nullable=False,
        default=[]
    )

    attendance_allowed_radius_meters = Column(Integer, default=5, nullable=True)

                                                                                         
    center = relationship(
        "Center",
        back_populates="operational_settings"
    )


class CenterHoliday(Base, AuditMixin):
    __tablename__ = "center_holidays"
    __table_args__ = {"schema": "settings"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id", ondelete="CASCADE"),
        nullable=False
    )

    holiday_name = Column(String(100), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # ✅ Auto-calculated in backend
    total_days = Column(Integer, nullable=False)

    # ✅ Stores all weekdays in the date range
    week_days = Column(
        ARRAY(Enum(WeekDayEnum, name="holiday_week_day_enum")),
        nullable=False
    )

    center = relationship(
        "Center",
        back_populates="holidays"
    )


