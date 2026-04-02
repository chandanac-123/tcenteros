"""add wallet to ordertype enum

Revision ID: 64d323140c39
Revises: 2419ac91d32b
Create Date: 2026-04-02 09:41:02.949284

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '64d323140c39'
down_revision = '2419ac91d32b'
branch_labels = None
depends_on = None

"""add wallet to ordertype enum

Revision ID: 64d323140c39
Revises: 2419ac91d32b
Create Date: 2026-04-02 09:41:02.949284

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '64d323140c39'
down_revision = '2419ac91d32b'
branch_labels = None
depends_on = None



def upgrade():
    # Add new enum value
    op.execute("ALTER TYPE public.ordertype ADD VALUE IF NOT EXISTS 'wallet';")


def downgrade():
    # ⚠️ PostgreSQL does NOT support removing enum values easily
    # So we usually leave downgrade empty or raise warning
    pass