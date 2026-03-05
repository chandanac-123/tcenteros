"""Add inventory model

Revision ID: 7b3b45f80bae
Revises: a9ff6afcfdca
Create Date: 2026-03-05 10:14:51.840003
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "7b3b45f80bae"
down_revision = "a9ff6afcfdca"
branch_labels = None
depends_on = None


def upgrade():

    # ---------------------------------------------------
    # Create inventory schema
    # ---------------------------------------------------
    op.execute("CREATE SCHEMA IF NOT EXISTS inventory")

    # ---------------------------------------------------
    # Add center_id to sku_categories
    # ---------------------------------------------------
    op.add_column(
        "sku_categories",
        sa.Column("center_id", sa.UUID(as_uuid=True), nullable=False),
        schema="settings",
    )

    op.create_foreign_key(
        "fk_sku_categories_center_id",
        "sku_categories",
        "centers",
        ["center_id"],
        ["id"],
        source_schema="settings",
        referent_schema="center",
    )

    # ---------------------------------------------------
    # Create products table
    # ---------------------------------------------------
    op.create_table(
        "products",
        sa.Column(
            "id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("shared.sku.id"),
            primary_key=True,
        ),
        sa.Column("selling_price", sa.Numeric(10, 2)),
        sa.Column("reorder_level", sa.Integer, server_default="0"),
        sa.Column("track_inventory", sa.Boolean, server_default=sa.text("true")),
        schema="inventory",
    )

    # ---------------------------------------------------
    # Create stocks table
    # ---------------------------------------------------
    op.create_table(
        "stocks",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "product_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("inventory.products.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("quantity_available", sa.Integer, server_default="0"),
        schema="inventory",
    )

    # ---------------------------------------------------
    # Create stock_transactions table
    # ---------------------------------------------------
    op.create_table(
        "stock_transactions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "product_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("inventory.products.id"),
            nullable=False,
        ),
        sa.Column(
            "transaction_type",
            sa.String(length=10),  # IN / OUT stored as string
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer, nullable=False),
        sa.Column("balance_after", sa.Integer),
        sa.Column("supplier_name", sa.String),
        sa.Column("invoice_number", sa.String),
        sa.Column("invoice_date", sa.Date),
        sa.Column("reference", sa.String),
        schema="inventory",
    )


def downgrade():

    op.drop_table("stock_transactions", schema="inventory")

    op.drop_table("stocks", schema="inventory")

    op.drop_table("products", schema="inventory")

    op.drop_constraint(
        "fk_sku_categories_center_id",
        "sku_categories",
        schema="settings",
        type_="foreignkey",
    )

    op.drop_column("sku_categories", "center_id", schema="settings")

    op.execute("DROP SCHEMA IF EXISTS inventory")