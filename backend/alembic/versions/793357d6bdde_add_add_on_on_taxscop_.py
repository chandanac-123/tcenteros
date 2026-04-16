"""Add add_on on taxscop

Revision ID: 793357d6bdde
Revises: cea26885733a
Create Date: 2026-02-27 10:39:38.753034

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '793357d6bdde'
down_revision = 'cea26885733a'
branch_labels = None
depends_on = None

def upgrade():
    # Add new value to the enum type
    op.execute("ALTER TYPE taxscope ADD VALUE IF NOT EXISTS 'add_on'")

def downgrade():
    # Downgrade is not supported for removing enum values in PostgreSQL
    pass