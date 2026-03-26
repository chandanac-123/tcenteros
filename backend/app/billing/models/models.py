from sqlalchemy import (
    Column, Enum, Numeric, ForeignKey, String, ARRAY, Text, Date
)
from sqlalchemy.dialects import postgresql
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
    MEMBERSHIP = "membership"                      # New membership purchase
    MEMBERSHIP_RENEWAL = "membership_renewal"      # Membership renewal
    MEMBERSHIP_UPGRADE = "membership_upgrade"      # Membership plan upgrade/change
    INVENTORY_SALE = "inventory_sale"              # Sale of inventory/products
    INVENTORY_PURCHASE = "inventory_purchase"      # Purchase of inventory
    PAYROLL = "payroll"                            # Salary/payroll
    NETWORK_IN = "network_in"                      # Networking in (receiving member from other center)
    NETWORK_OUT = "network_out"                    # Networking out (sending member to other center)
    NETWORK_SETTLEMENT = "network_settlement"      # Settlement between centers/platform for networking
    BRANCH_PURCHASE = "branch_purchase"            # Purchase of branch from platform
    CENTER_SUBSCRIPTION = "center_subscription"    # Center subscription to platform
    FEATURE_PURCHASE = "feature_purchase"          # Purchase of platform features
    ADD_ON = "add_on"                              # Add-on purchases
    REFUND = "refund"                              # Refunds
    OTHER_CHARGES = "other_charges" 

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






class MiscellaneousTransaction(Base, AuditMixin):
    """
    Track miscellaneous income/expenses like rent, electricity, maintenance, etc.
    Each transaction is linked to a PaymentOrder for unified tracking.
    """
    __tablename__ = "miscellaneous_transactions"
    __table_args__ = {"schema": "billing"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False,
        index=True
    )
    
    # Transaction classification - now as String instead of Enum
    transaction_type = Column(
        String(50),
        nullable=False,
        index=True
    )
    
    # Category as string for flexibility
    category = Column(
        String(100),
        nullable=False,
        index=True
    )
    
    # Transaction details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Amount details
    amount = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0.00)
    total_amount = Column(Numeric(10, 2), nullable=False)

    tax_category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("settings.tax_categories.id"),
        nullable=True,
        index=True
    )
    
    # Payment info
    payment_order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("billing.payment_orders.payment_order_id"),
        nullable=True,
        unique=True,
        index=True
    )
    
    payment_method = Column(
        postgresql.ENUM('cash', 'bank_transfer', 'upi', 'card', 'other', name='payroll_payment_method', schema='public', create_type=False),
        nullable=True
    )
    
    payment_status = Column(
        Enum(PaymentOrderStatus),
        default=PaymentOrderStatus.pending,
        nullable=False,
        index=True
    )
    
    # Transaction date
    transaction_date = Column(Date, nullable=False, index=True)
    
    # Vendor/Party details
    party_name = Column(String(255), nullable=True)
    party_contact = Column(String(50), nullable=True)
    
    # Document tracking
    invoice_number = Column(String(100), nullable=True)
    receipt_number = Column(String(100), nullable=True)
    
    # Attachments (URLs to S3 or file storage)
    attachment_urls = Column(ARRAY(String), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    center = relationship("Center", foreign_keys=[center_id], backref="miscellaneous_transactions")
    payment_order = relationship("PaymentOrder", foreign_keys=[payment_order_id], backref="miscellaneous_transaction")
    tax_category = relationship("TaxCategory", foreign_keys=[tax_category_id], backref="miscellaneous_transactions")