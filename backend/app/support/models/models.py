from sqlalchemy import Column, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.base import Base, AuditMixin
import uuid
import enum
from datetime import datetime

class TicketStatus(enum.Enum):
    pending = "pending"
    open = "open"
    assigned = "assigned"
    closed = "closed"

class Ticket(Base, AuditMixin):
    __tablename__ = "tickets"
    __table_args__ = {"schema": "support"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("auth.members.id"), nullable=False)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id"), nullable=True)
    assigned_admin_id = Column(UUID(as_uuid=True), nullable=True)  
    assigned_admin_role = Column(String, nullable=True)  # "superadmin" or "centeradmin"
    status = Column(Enum(TicketStatus), default=TicketStatus.pending, nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member = relationship("Member", foreign_keys=[member_id])
    center = relationship("Center", foreign_keys=[center_id])
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")



class TicketMessage(Base, AuditMixin):
    __tablename__ = "ticket_messages"
    __table_args__ = {"schema": "support"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("support.tickets.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), nullable=False)  # Can be member, superadmin, or centeradmin
    sender_role = Column(String, nullable=False)  # "member", "superadmin", "centeradmin"
    message = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="messages")