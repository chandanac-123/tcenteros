from sqlalchemy import (
    Column, Enum, Numeric, ForeignKey, String
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.base import AuditMixin, Base
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

class TransactionSourceEnum(str, Enum):
    local = "local"
    pos = "pos"
    visit = "visit"
    online = "online"


class OrderType(enum.Enum):
    center_subscription = "center_subscription"
    feature_purchase = "feature_purchase"
    renewal = "renewal"
    upgrade = "upgrade"
    add_on = "add_on"
    refund = "refund"
    stock_purchase = "stock_purchase"
    membership = "membership"
    networking_access = "networking_access"


class ReferenceSchema(enum.Enum):
    center = "center"
    center_feature = "center_feature"
    wallet = "wallet"
    invoice = "invoice"
    networking_access_request = "networking_access_request"


class Currency(enum.Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"


class PaymentOrderStatus(enum.Enum):
    pending = "pending"
    created = "created"
    processing = "processing"
    paid = "paid"
    unpaid = "unpaid"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"
    expired = "expired"

class PaymentMethod(enum.Enum):
    cash = "cash"
    card = "card"
    upi = "upi"
    bank_transfer = "bank_transfer"
    other = "other"



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
        nullable=False, index=True
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
        nullable=True, index=True
    )

    order_type = Column(
        Enum(OrderType),
        nullable=False, index=True
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
        nullable=False, index=True
    )

    payment_method = Column(
        Enum(PaymentMethod),
        nullable=True
    )

    

    # ------------------------
    # Relationships
    # ------------------------
    payer = relationship("User", back_populates="payment_orders", foreign_keys=[payer_user_id])
    center = relationship("Center", back_populates="payment_orders", foreign_keys=[center_id])
    feature_subscriptions = relationship("CenterFeatureSubscription", back_populates="payment_order")


