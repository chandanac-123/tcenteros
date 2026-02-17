from sqlalchemy import Column, String, Boolean, Numeric, Enum, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.models.base import AuditMixin, Base
from app.core.models.models import StatusEnum
import enum


class DurationUnitEnum(enum.Enum):
    day = "day"
    month = "month"
    year = "year"

class MembershipFeature(Base, AuditMixin):
    __tablename__ = "membership_features"
    __table_args__ = {"schema": "membership"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("membership.memberships.membership_id"), nullable=False)
    feature_name = Column(String, nullable=False)
    feature_description = Column(String, nullable=True)

    # Relationship back to Membership
    membership = relationship("Membership", back_populates="membership_features")


# 9.1 memberships
class Membership(Base, AuditMixin):
    __tablename__ = "memberships"
    __table_args__ = {"schema": "membership"}

    membership_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id"), nullable=False)
    membership_name = Column(String, nullable=False)
    membership_code = Column(String, nullable=False, unique=True)
    description = Column(String)
    duration_count = Column(Integer, nullable=False)  
    duration_unit = Column(Enum(DurationUnitEnum), nullable=False)
    default_price = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.active)

    # Relationships (optional)
    member_memberships = relationship(
    "MemberMembership",
    back_populates="membership",
    cascade="all, delete-orphan",
    passive_deletes=True
)
    membership_features = relationship("MembershipFeature", back_populates="membership", cascade="all, delete-orphan")


# 9.2 member_memberships
class MemberMembership(Base, AuditMixin):
    __tablename__ = "member_memberships"
    __table_args__ = {"schema": "membership"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("auth.members.id"), nullable=False)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("membership.memberships.membership_id", ondelete="CASCADE"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    tax_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.tax_categories.id"), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    auto_renewal_enabled = Column(Boolean, default=False)
    membership_status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.active)

    # Relationships (optional)
    center = relationship("Center", back_populates="member_memberships")
    membership = relationship("Membership", back_populates="member_memberships")