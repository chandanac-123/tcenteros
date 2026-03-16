# backend/app/payrole/models/models.py

from sqlalchemy import Column, String, ForeignKey, Enum, Integer, Numeric, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.base import AuditMixin, Base
import uuid
import enum
from datetime import datetime


class PayrollStatus(enum.Enum):
    pending = "pending"
    processing = "processing"
    paid = "paid"
    failed = "failed"
    cancelled = "cancelled"


class PayrollPaymentMethod(enum.Enum):
    cash = "cash"
    bank_transfer = "bank_transfer"
    upi = "upi"
    card = "card"
    other = "other"



class PayrollRecord(Base, AuditMixin):
    __tablename__ = "payroll_records"
    __table_args__ = {"schema": "payrole"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    employee_id = Column(
        UUID(as_uuid=True),
        ForeignKey("shared.users.id"),  # Assuming Employee inherits from User
        nullable=False,
        index=True
    )
    
    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False,
        index=True
    )
    
    # Payroll period
    payroll_month = Column(Integer, nullable=False)  # 1-12
    payroll_year = Column(Integer, nullable=False)   # 2024, 2025, etc.
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Salary breakdown
    gross_salary = Column(Numeric(10, 2), nullable=False)
    tds_amount = Column(Numeric(10, 2), default=0.00)
    other_deductions = Column(Numeric(10, 2), default=0.00)
    total_deductions = Column(Numeric(10, 2), default=0.00)
    net_salary = Column(Numeric(10, 2), nullable=False)
    
    # Payment details
    payment_method = Column(
        Enum(PayrollPaymentMethod, name="payroll_payment_method"),  # Specify the existing enum name
        nullable=True
    )
    
    status = Column(
        Enum(PayrollStatus),
        default=PayrollStatus.pending,
        nullable=False,
        index=True
    )
    
    paid_date = Column(Date, nullable=True)
    
    # Relationships
    employee = relationship("User", foreign_keys=[employee_id], backref="payroll_records")
    center = relationship("Center", foreign_keys=[center_id], backref="payroll_records")