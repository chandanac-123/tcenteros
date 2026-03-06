from app.core.models.models import SKU
from sqlalchemy import Column, Integer, Numeric, Boolean, ForeignKey, String, Enum, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.base import Base, AuditMixin
import uuid
import enum




class Product(SKU):
    __tablename__ = "products"
    __table_args__ = {"schema": "inventory"}

    id = Column(UUID(as_uuid=True),
                ForeignKey("shared.sku.id"),
                primary_key=True)

    selling_price = Column(Numeric(10,2))

    reorder_level = Column(Integer, default=0)

    track_inventory = Column(Boolean, default=True)

    stock = relationship("Stock", back_populates="product", uselist=False)
    sku = relationship("SKU", back_populates="product", uselist=False)


class Stock(Base, AuditMixin):
    __tablename__ = "stocks"
    __table_args__ = {"schema": "inventory"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    product_id = Column(UUID(as_uuid=True),
                        ForeignKey("inventory.products.id"),
                        nullable=False,
                        unique=True)

    quantity_available = Column(Integer, default=0)
    last_cost = Column(Numeric(10, 2), nullable=True)

    product = relationship("Product", back_populates="stock")


class StockTransaction(Base, AuditMixin):
    __tablename__ = "stock_transactions"
    __table_args__ = {"schema": "inventory"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    product_id = Column(UUID(as_uuid=True),
                        ForeignKey("inventory.products.id"),
                        nullable=False)

    transaction_type = Column(String)


    quantity = Column(Integer, nullable=False)

    unit_cost = Column(Numeric(10, 2), nullable=False, default=0.00)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)

    balance_after = Column(Integer)

    supplier_name = Column(String)

    invoice_number = Column(String)

    invoice_date = Column(Date)

    reference = Column(String)

    product = relationship("Product")


