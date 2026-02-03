from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, String, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.base import Base, AuditMixin
import uuid
import enum

class AttendanceStatus(enum.Enum):
    present = "present"
    absent = "absent"
    holiday = "holiday"

class Attendance(Base, AuditMixin):
    __tablename__ = "attendance"
    __table_args__ = {"schema": "attendance"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("shared.users.id", ondelete="CASCADE"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)

    check_in_time = Column(DateTime, nullable=True)
    check_in_latitude = Column(Numeric(9, 6), nullable=True)
    check_in_longitude = Column(Numeric(9, 6), nullable=True)
    check_in_location_valid = Column(Boolean, default=False)  # True if within allowed radius

    check_out_time = Column(DateTime, nullable=True)
    check_out_latitude = Column(Numeric(9, 6), nullable=True)
    check_out_longitude = Column(Numeric(9, 6), nullable=True)
    check_out_location_valid = Column(Boolean, default=False)  # True if within allowed radius

    status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.absent)
    remarks = Column(String, nullable=True)

    user = relationship("User")
    center = relationship("Center")

    # Optionally, add device_id, ip_address, etc. for audit
