"""Add sales and sales_items model

Revision ID: 8ff5c22f0d37
Revises: 346076585f78
Create Date: 2026-03-07 06:39:33.562379

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '8ff5c22f0d37'
down_revision = '346076585f78'
branch_labels = None
depends_on = None


def upgrade():
    # Create `sales` table in inventory schema
    op.create_table(
        "sales",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("center_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("center.centers.id"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("shared.users.id"), nullable=True),
        sa.Column("subtotal_amount", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        sa.Column("tax_amount", sa.Numeric(10, 2), nullable=True, server_default=sa.text("0.00")),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        sa.Column("tax_category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("settings.tax_categories.id"), nullable=True),
        sa.Column("tax_percentage", sa.Numeric(5, 2), nullable=True, server_default=sa.text("0.00")),
        sa.Column("currency", sa.String(), nullable=True, server_default=sa.text("'INR'")),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        schema="inventory",
    )

    # Indexes for sales
    op.create_index("ix_sales_center_id", "sales", ["center_id"], schema="inventory")
    op.create_index("ix_sales_customer_id", "sales", ["customer_id"], schema="inventory")
    op.create_index("ix_sales_tax_category_id", "sales", ["tax_category_id"], schema="inventory")

    # Create `sale_items` table in inventory schema
    op.create_table(
        "sale_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("sale_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("inventory.sales.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("inventory.products.id"), nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        sa.Column("line_subtotal", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        sa.Column("product_name", sa.String(), nullable=True),
        sa.Column("sku_code", sa.String(), nullable=True),
        schema="inventory",
    )

    op.create_index("ix_sale_items_sale_id", "sale_items", ["sale_id"], schema="inventory")
    op.create_index("ix_sale_items_product_id", "sale_items", ["product_id"], schema="inventory")


def downgrade():
    # Drop sale_items first
    op.drop_index("ix_sale_items_product_id", table_name="sale_items", schema="inventory")
    op.drop_index("ix_sale_items_sale_id", table_name="sale_items", schema="inventory")
    op.drop_table("sale_items", schema="inventory")

    # Drop sales
    op.drop_index("ix_sales_tax_category_id", table_name="sales", schema="inventory")
    op.drop_index("ix_sales_customer_id", table_name="sales", schema="inventory")
    op.drop_index("ix_sales_center_id", table_name="sales", schema="inventory")
    op.drop_table("sales", schema="inventory")