"""update the feilds in stock

Revision ID: c35d696e3154
Revises: 5bc30933ba80
Create Date: 2026-03-06 09:13:35.129378

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c35d696e3154'
down_revision = '5bc30933ba80'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add last_cost to inventory.stocks (nullable)
    op.add_column(
        "stocks",
        sa.Column("last_cost", sa.Numeric(10, 2), nullable=True),
        schema="inventory",
    )

    # Add unit_cost and subtotal to inventory.stock_transactions with a safe server default for existing rows
    op.add_column(
        "stock_transactions",
        sa.Column("unit_cost", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        schema="inventory",
    )
    op.add_column(
        "stock_transactions",
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        schema="inventory",
    )

    # Remove the server defaults so new inserts use application values (optional but recommended)
    op.alter_column(
        "stock_transactions",
        "unit_cost",
        server_default=None,
        schema="inventory",
    )
    op.alter_column(
        "stock_transactions",
        "subtotal",
        server_default=None,
        schema="inventory",
    )


def downgrade() -> None:
    # Drop columns in reverse order
    op.drop_column("stock_transactions", "subtotal", schema="inventory")
    op.drop_column("stock_transactions", "unit_cost", schema="inventory")
    op.drop_column("stocks", "last_cost", schema="inventory")