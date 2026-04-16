"""Add audit fields to stock

Revision ID: ea759f16d79c
Revises: d4d50401dd2a
Create Date: 2026-03-06 05:31:55.847935

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql



# revision identifiers, used by Alembic.
revision = 'ea759f16d79c'
down_revision = 'd4d50401dd2a'
branch_labels = None
depends_on = None


def upgrade():
    # Add audit columns (nullable) to avoid breaking existing rows
    op.add_column(
        "stocks",
        sa.Column("created_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "stocks",
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "stocks",
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        schema="inventory",
    )
    op.add_column(
        "stocks",
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        schema="inventory",
    )

    # Create foreign key constraints linking to shared.users.id (optional)
    op.create_foreign_key(
        "fk_inventory_stocks_created_by_users",
        source_schema="inventory",
        source_table="stocks",
        referent_schema="shared",
        referent_table="users",
        local_cols=["created_by"],
        remote_cols=["id"],
    )
    op.create_foreign_key(
        "fk_inventory_stocks_updated_by_users",
        source_schema="inventory",
        source_table="stocks",
        referent_schema="shared",
        referent_table="users",
        local_cols=["updated_by"],
        remote_cols=["id"],
    )

    # Backfill created_at for existing rows to now() so older rows have timestamps
    op.execute("UPDATE inventory.stocks SET created_at = now() WHERE created_at IS NULL")


def downgrade():
    # Drop foreign keys first, then columns
    op.drop_constraint(
        "fk_inventory_stocks_created_by_users",
        "stocks",
        schema="inventory",
        type_="foreignkey",
    )
    op.drop_constraint(
        "fk_inventory_stocks_updated_by_users",
        "stocks",
        schema="inventory",
        type_="foreignkey",
    )

    op.drop_column("stocks", "updated_by", schema="inventory")
    op.drop_column("stocks", "updated_at", schema="inventory")
    op.drop_column("stocks", "created_by", schema="inventory")
    op.drop_column("stocks", "created_at", schema="inventory")