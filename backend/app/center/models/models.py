from sqlalchemy import Column, String, Boolean, ARRAY, Numeric, Text, Enum, DateTime, ForeignKey, JSON, Integer, Date
from app.core.models.base import AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import  relationship
import sqlalchemy as sa
import uuid
import enum




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

class TimeSlotChangeType(enum.Enum):
    permanent = "permanent"
    temporary = "temporary"

class TimeSlotChangeStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

# ------------------------
# Center Model
# ------------------------
class Center(Base, AuditMixin):
    __tablename__ = "centers"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_name = Column(String, nullable=False, index=True)
    
    about = Column(Text, nullable=True)
    facilities = Column(ARRAY(Text), nullable=True)

    # Foreign keys to settings schema
    center_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.center_categories.id"), nullable=True)
    address_id = Column(UUID(as_uuid=True), ForeignKey("settings.address.id"), nullable=True)
    
    website_url = Column(String)
    capacity = Column(Numeric)
    
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.pending, nullable=True, index=True)
    center_status = Column(Enum(CenterStatus), default=CenterStatus.active, nullable=False, index=True)
    
    network_enabled = Column(Boolean, default=True, server_default=sa.text('true'))
    network_joined_date = Column(DateTime, nullable=True)
    white_label_enabled = Column(Boolean, default=True)

    networking_amount = Column(Numeric(10, 2), nullable=True)

    # ------------------------
    # Other onboarding Fields
    # ------------------------
    kind_of_center = Column(JSON)  # list stored as JSON
    members_count = Column(Integer, default=0)
    trainer_count = Column(Integer, default=0)

    currently_using_digital_tool = Column(JSON, nullable=True)
    marketing_platform = Column(JSON)

    contact_person = Column(String)
    center_email = Column(String)
    center_phone = Column(String)
    gst_number = Column(String, nullable=True)
    live_class_enable = Column(Boolean, default=False)



    # Relationships (optional, for easy ORM access)
    category = relationship("CenterCategory", back_populates="centers", foreign_keys=[center_category_id])
    address = relationship("Address", back_populates="centers", foreign_keys=[address_id])
    admins = relationship(
    "CenterAdmin",
    back_populates="center",
    foreign_keys="CenterAdmin.center_id")
    payment_orders = relationship("PaymentOrder", back_populates="center")
    time_slots = relationship("CenterTimeSlot", back_populates="center")
    operational_settings = relationship("CenterOperationalSetting", back_populates="center", uselist=False)
    holidays = relationship("CenterHoliday", back_populates="center")
    member_memberships = relationship("MemberMembership", back_populates="center")
    wallet = relationship("CenterWallet", back_populates="center", uselist=False)
    gallery_images = relationship("CenterGalleryImage", back_populates="center", cascade="all, delete-orphan")


class CenterOnboardingTemp(Base, AuditMixin):
    __tablename__ = "center_onboarding_temp"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    center_email = Column(String, nullable=False)
    center_phone = Column(String, nullable=False)
    city = Column(String, nullable=False)
    center_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.center_categories.id"), nullable=False)
    kind_of_center = Column(JSON, nullable=True)
    members_count = Column(Integer, default=0)
    trainer_count = Column(Integer, default=0)
    currently_using_digital_tool = Column(JSON, nullable=True)
    marketing_platform = Column(JSON, nullable=True)
    platform_feature_ids = Column(JSON, nullable=False)  # list of feature UUIDs
    is_terms_and_conditions = Column(Boolean, default=False)
    calculated_amount = Column(Numeric(10, 2), nullable=False)




class CenterTimeSlot(Base, AuditMixin):
    __tablename__ = "center_time_slots"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id"), nullable=False)
    start_time = Column(String, nullable=False)   # e.g., "09:00"
    end_time = Column(String, nullable=False)     # e.g., "17:00"
    slot_capacity = Column(Integer, nullable=False)

    # Relationships
    center = relationship("Center", back_populates="time_slots", foreign_keys=[center_id])



class TimeSlotChangeRequest(Base, AuditMixin):
    __tablename__ = "time_slot_change_requests"
    __table_args__ = {"schema": "membership"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("auth.members.id"), nullable=False)
    old_time_slot_id = Column(UUID(as_uuid=True), ForeignKey("center.center_time_slots.id"), nullable=True)
    new_time_slot_id = Column(UUID(as_uuid=True), ForeignKey("center.center_time_slots.id"), nullable=True)
    change_type = Column(Enum(TimeSlotChangeType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    reason = Column(String, nullable=True)
    status = Column(Enum(TimeSlotChangeStatus), default=TimeSlotChangeStatus.pending, nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("auth.center_admins.id"), nullable=True)

    member = relationship("Member", foreign_keys=[member_id])
    old_time_slot = relationship("CenterTimeSlot", foreign_keys=[old_time_slot_id])
    new_time_slot = relationship("CenterTimeSlot", foreign_keys=[new_time_slot_id])



class CenterWallet(Base, AuditMixin):
    __tablename__ = "center_wallets"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id", ondelete="CASCADE"), nullable=False, unique=True)
    balance = Column(Numeric(12, 2), nullable=False, default=0)
    deposit = Column(Numeric(12, 2), nullable=False, default=0)
    min_balance = Column(Numeric(12, 2), nullable=False, default=10000)
    min_deposit = Column(Numeric(12, 2), nullable=False, default=2000)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    center = relationship("Center", back_populates="wallet")


class WalletTransaction(Base, AuditMixin):
    __tablename__ = "wallet_transactions"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_wallet_id = Column(UUID(as_uuid=True), ForeignKey("center.center_wallets.id"), nullable=True)
    to_wallet_id = Column(UUID(as_uuid=True), ForeignKey("center.center_wallets.id"), nullable=True)
    platform_wallet_id = Column(UUID(as_uuid=True), ForeignKey("platform.platform_wallet.id"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    transaction_type = Column(String, nullable=False)  # e.g., "deposit", "transfer", "platform_income"
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    from_wallet = relationship("CenterWallet", foreign_keys=[from_wallet_id])
    to_wallet = relationship("CenterWallet", foreign_keys=[to_wallet_id])
    platform_wallet = relationship("PlatformWallet", foreign_keys=[platform_wallet_id])




class CenterGalleryImage(Base, AuditMixin):
    __tablename__ = "center_gallery_images"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=False)

    center = relationship("Center", back_populates="gallery_images")