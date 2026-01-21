from sqlalchemy import Column, String, Numeric, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from app.core.models import AuditMixin
from app.core.models import StatusEnum
from sqlalchemy.orm import relationship 
import enum
import uuid


Base = declarative_base()

class PricingType(enum.Enum):
    monthly = "monthly"
    yearly = "yearly"
    one_time = "one_time"



class PlatformFeature(Base, AuditMixin):
    __tablename__ = "platform_features"
    __table_args__ = {"schema": "platform"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_code = Column(String, unique=True, nullable=False)
    feature_name = Column(String, nullable=False)
    base_price = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.active, nullable=False)



class CenterFeatureSubscription(Base, AuditMixin):
    __tablename__ = "center_feature_subscriptions"
    __table_args__ = {"schema": "center"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False
    )

    feature_id = Column(
        UUID(as_uuid=True),
        ForeignKey("platform.platform_features.id"),
        nullable=False
    )

    #ADD THIS FIELD
    payment_order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("billing.payment_orders.payment_order_id"),
        nullable=False
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
        nullable=False
    )

    # Relationships
    center = relationship("Center", backref="feature_subscriptions")
    feature = relationship("PlatformFeature")
    payment_order = relationship("PaymentOrder")
    tax_category = relationship("TaxCategory")



