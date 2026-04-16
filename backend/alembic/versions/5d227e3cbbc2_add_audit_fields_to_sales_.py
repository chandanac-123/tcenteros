"""Add audit fields to sales

Revision ID: 5d227e3cbbc2
Revises: 8ff5c22f0d37
Create Date: 2026-03-07 09:42:41.362760

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5d227e3cbbc2'
down_revision = '8ff5c22f0d37'
branch_labels = None
depends_on = None

def upgrade():
    # inventory.sales
    op.add_column(
        "sales",
        sa.Column("created_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "sales",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "sales",
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "sales",
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )

    # inventory.sale_items
    op.add_column(
        "sale_items",
        sa.Column("created_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "sale_items",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "sale_items",
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "sale_items",
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )


def downgrade():
    op.drop_column("sale_items", "updated_by", schema="inventory")
    op.drop_column("sale_items", "updated_at", schema="inventory")
    op.drop_column("sale_items", "created_by", schema="inventory")
    op.drop_column("sale_items", "created_at", schema="inventory")

    op.drop_column("sales", "updated_by", schema="inventory")
    op.drop_column("sales", "updated_at", schema="inventory")
    op.drop_column("sales", "created_by", schema="inventory")
    op.drop_column("sales", "created_at", schema="inventory")