"""Add audit fields to stocktransactionmodels

Revision ID: 5bc30933ba80
Revises: ea759f16d79c
Create Date: 2026-03-06 07:08:07.720777

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5bc30933ba80'
down_revision = 'ea759f16d79c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "stock_transactions",
        sa.Column("created_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "stock_transactions",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "stock_transactions",
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "stock_transactions",
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )

    # Optional: add foreign keys to shared.users (safe if shared.users exists)
    op.create_foreign_key(
        "fk_inventory_stocktx_created_by_users",
        source_schema="inventory",
        source_table="stock_transactions",
        referent_schema="shared",
        referent_table="users",
        local_cols=["created_by"],
        remote_cols=["id"],
    )
    op.create_foreign_key(
        "fk_inventory_stocktx_updated_by_users",
        source_schema="inventory",
        source_table="stock_transactions",
        referent_schema="shared",
        referent_table="users",
        local_cols=["updated_by"],
        remote_cols=["id"],
    )

    # Backfill created_at to now() for existing rows
    op.execute("UPDATE inventory.stock_transactions SET created_at = now() WHERE created_at IS NULL")


def downgrade():
    op.drop_constraint(
        "fk_inventory_stocktx_created_by_users",
        "stock_transactions",
        schema="inventory",
        type_="foreignkey",
    )
    op.drop_constraint(
        "fk_inventory_stocktx_updated_by_users",
        "stock_transactions",
        schema="inventory",
        type_="foreignkey",
    )

    op.drop_column("stock_transactions", "updated_by", schema="inventory")
    op.drop_column("stock_transactions", "updated_at", schema="inventory")
    op.drop_column("stock_transactions", "created_by", schema="inventory")
    op.drop_column("stock_transactions", "created_at", schema="inventory")