from app.core.models.models import SKU
from sqlalchemy import Column, Integer, Numeric, Boolean, ForeignKey, String, Enum, Date, Text
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
    sale_items = relationship("SaleItem", back_populates="product", cascade="all, delete-orphan")



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



class Sale(Base, AuditMixin):
    __tablename__ = "sales"
    __table_args__ = {"schema": "inventory"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # scope
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id"), nullable=False, index=True)

    # persisted amounts (snapshots)
    subtotal_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    tax_amount = Column(Numeric(10, 2), nullable=True, default=0.00)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)

    # global tax category used for this sale (snapshotting the category and percent)
    tax_category_id = Column(UUID(as_uuid=True), ForeignKey("settings.tax_categories.id"), nullable=True, index=True)
    tax_percentage = Column(Numeric(5, 2), nullable=True, default=0.00)

    # currency (reuse your billing Currency enum)
    currency = Column(String, nullable=True)

    status = Column(String, nullable=True)

    # optional reference / note
    note = Column(Text, nullable=True)

    # audit timestamps come from AuditMixin (created_at, created_by, etc.)
    # relationships
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan", lazy="joined")

    # convenience relationship to tax category (string name resolves at mapper configuration time)
    tax_category = relationship("TaxCategory", back_populates="sales", viewonly=True)

    center = relationship("Center", back_populates="sales", foreign_keys=[center_id])


class SaleItem(Base, AuditMixin):
    __tablename__ = "sale_items"
    __table_args__ = {"schema": "inventory"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    sale_id = Column(UUID(as_uuid=True), ForeignKey("inventory.sales.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("inventory.products.id"), nullable=False, index=True)

    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    line_subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)

    # optional snapshot fields
    product_name = Column(String, nullable=True)
    sku_code = Column(String, nullable=True)

    # relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")
