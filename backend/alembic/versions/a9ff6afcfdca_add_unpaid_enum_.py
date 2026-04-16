"""Add unpaid enum

Revision ID: a9ff6afcfdca
Revises: 1533544153df
Create Date: 2026-03-05 04:04:37.255879

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a9ff6afcfdca'
down_revision = '1533544153df'
branch_labels = None
depends_on = None

def upgrade():
    # Add 'unpaid' value to the enum type
    op.execute("ALTER TYPE paymentorderstatus ADD VALUE IF NOT EXISTS 'unpaid';")

def downgrade():
    # Downgrade is not supported for removing enum values in PostgreSQL
    pass