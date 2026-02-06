from sqlalchemy import Column, String, Numeric, Enum, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.models.base import AuditMixin, Base
from app.core.models.models import StatusEnum
from datetime import datetime
from sqlalchemy.orm import relationship 
import enum
import uuid




class PricingType(enum.Enum):
    monthly = "monthly"
    yearly = "yearly"
    one_time = "one_time"



class PlatformFeature(Base, AuditMixin):
    __tablename__ = "platform_features"
    __table_args__ = {"schema": "platform"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_name = Column(String, nullable=False)
    description = Column(Text)
    base_price = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.active, nullable=False)



class CenterFeatureSubscription(Base, AuditMixin):
    __tablename__ = "center_feature_subscriptions"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False, index=True
    )

    feature_id = Column(
        UUID(as_uuid=True),
        ForeignKey("platform.platform_features.id"),
        nullable=False, index=True
    )

    #ADD THIS FIELD
    payment_order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("billing.payment_orders.payment_order_id"),
        nullable=False, index=True
    )

    pricing_type = Column(
        Enum(PricingType),
        default=PricingType.yearly,
        nullable=False
    )
    
    unit_price = Column(Numeric(10, 2), nullable=False)

    tax_category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("settings.tax_categories.id"),
        nullable=True
    )

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)

    status = Column(
        Enum(StatusEnum),
        default=StatusEnum.active,
        nullable=False, index=True
    )

    # Relationships
    center = relationship("Center", backref="feature_subscriptions")
    feature = relationship("PlatformFeature")
    tax_category = relationship(
    "TaxCategory",
    back_populates="subscriptions"
    )
    payment_order = relationship("PaymentOrder", back_populates="feature_subscriptions")




class PlatformWallet(Base, AuditMixin):
    __tablename__ = "platform_wallet"
    __table_args__ = {"schema": "platform"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    balance = Column(Numeric(12, 2), nullable=False, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)