from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Integer, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.models import User
from app.core.models.base import Base
from app.core.models.models import UserRole
import uuid
import enum




class MemberStatusEnum(enum.Enum):
    member = "member"
    guest = "guest"
    lead = "lead"
    visitor = "visitor"

class SuperAdmin(User):
    __tablename__ = "superadmins"
    __table_args__ = {"schema": "auth"}
    id = Column(UUID(as_uuid=True), ForeignKey("shared.users.id", ondelete="CASCADE"), primary_key=True)
    __mapper_args__ = {
        "polymorphic_identity": "superadmin",
    }

class CenterAdmin(User):
    __tablename__ = "center_admins"
    __table_args__ = {"schema": "auth"}

    id = Column(
        UUID(as_uuid=True),
        ForeignKey("shared.users.id", ondelete="CASCADE"),
        primary_key=True
    )

    full_name = Column(String, nullable=False)

    address_id = Column(
        UUID(as_uuid=True),
        ForeignKey("settings.address.id"),
        nullable=True
    )

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False
    )

    network_access_enabled = Column(Boolean, default=False, nullable=False)
    white_label_enabled = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "centeradmin",
    }

    # Relationships
    center = relationship(
    "Center",
    back_populates="admins",
    foreign_keys=[center_id]
)
    address = relationship(
    "Address",
    back_populates="center_admins",
    foreign_keys=[address_id]
)




class Employee(User):
    __tablename__ = "employees"
    __table_args__ = {"schema": "auth"}

    id = Column(
        UUID(as_uuid=True),
        ForeignKey("shared.users.id", ondelete="CASCADE"),
        primary_key=True
    )
    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False
    )
    designation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("settings.designations.id"),
        nullable=True
    )
    specialization = Column(String)
    experience_years = Column(Integer)
    salary = Column(Numeric(10, 2))
    attendance_marking_allowed = Column(Boolean, default=False, nullable=False)

    center = relationship("Center", foreign_keys=[center_id])
    designation = relationship("Designation", foreign_keys=[designation_id])

    __mapper_args__ = {
        "polymorphic_identity": "employee",
    }

class Member(User):
    __tablename__ = "members"
    __table_args__ = {"schema": "auth"}

    id = Column(
        UUID(as_uuid=True),
        ForeignKey("shared.users.id", ondelete="CASCADE"),
        primary_key=True
    )
    home_center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=True
    )
    date_of_birth = Column(Date)
    blood_group = Column(String)
    blocked_reason = Column(String)
    network_eligible = Column(Boolean, default=True, nullable=False)
    last_login_device = Column(String)
    time_slot_id = Column(UUID(as_uuid=True), ForeignKey("center.center_time_slots.id"), nullable=True)
    member_status = Column(Enum(MemberStatusEnum), nullable=False, default=MemberStatusEnum.member)

    home_center = relationship("Center", foreign_keys=[home_center_id])

    __mapper_args__ = {
        "polymorphic_identity": "member",
    }

    