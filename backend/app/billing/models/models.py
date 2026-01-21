from sqlalchemy import (
    Column, Enum, Numeric, ForeignKey, String
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from app.core.models import AuditMixin
import uuid
import enum

class PayerType(enum.Enum):
    user = "user"
    center_admin = "center_admin"
    system = "system"


class PayeeType(enum.Enum):
    platform = "platform"
    center = "center"
    trainer = "trainer"


class OrderType(enum.Enum):
    center_subscription = "center_subscription"
    feature_purchase = "feature_purchase"
    renewal = "renewal"
    upgrade = "upgrade"
    add_on = "add_on"
    refund = "refund"


class ReferenceSchema(enum.Enum):
    center = "center"
    center_feature = "center_feature"
    wallet = "wallet"
    invoice = "invoice"


class Currency(enum.Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"


class PaymentOrderStatus(enum.Enum):
    pending = "pending"
    created = "created"
    processing = "processing"
    paid = "paid"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"
    expired = "expired"


Base = declarative_base()

class PaymentOrder(Base, AuditMixin):
    __tablename__ = "payment_orders"
    __table_args__ = {"schema": "billing"}

    payment_order_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    payer_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("shared.users.id"),
        nullable=False
    )

    payer_type = Column(
        Enum(PayerType),
        nullable=False
    )

    payee_type = Column(
        Enum(PayeeType),
        nullable=False
    )

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=True
    )

    order_type = Column(
        Enum(OrderType),
        nullable=False
    )

    reference_schema = Column(
        Enum(ReferenceSchema),
        nullable=False
    )

    reference_id = Column(
        UUID(as_uuid=True),
        nullable=True
    )

    subtotal_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    tax_amount = Column(
        Numeric(10, 2),
        default=0.00
    )

    total_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    currency = Column(
        Enum(Currency),
        default=Currency.INR,
        nullable=False
    )

    status = Column(
        Enum(PaymentOrderStatus),
        default=PaymentOrderStatus.pending,
        nullable=False
    )

    # ------------------------
    # Relationships
    # ------------------------
    payer = relationship("User")
    center = relationship("Center", backref="payment_orders")
