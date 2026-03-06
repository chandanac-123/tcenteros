"""make skucode nullable

Revision ID: d4d50401dd2a
Revises: c52b353b5702
Create Date: 2026-03-06 05:11:50.003046

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4d50401dd2a'
down_revision = 'c52b353b5702'
branch_labels = None
depends_on = None

def upgrade():
    # Alter sku_code to nullable
    op.alter_column(
        table_name="sku",
        column_name="sku_code",
        schema="shared",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )

def downgrade():
    # Downgrade: make non-nullable again (this will fail if NULL rows exist)
    op.alter_column(
        table_name="sku",
        column_name="sku_code",
        schema="shared",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )