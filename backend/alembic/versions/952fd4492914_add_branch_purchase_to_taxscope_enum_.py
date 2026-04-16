"""add branch_purchase to taxscope enum

Revision ID: 952fd4492914
Revises: 73c4efe908b3
Create Date: 2026-03-28 04:34:20.515345

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '952fd4492914'
down_revision = '73c4efe908b3'
branch_labels = None
depends_on = None

def upgrade():
    # Add value to the enum type in the public schema
    op.execute("ALTER TYPE taxscope ADD VALUE IF NOT EXISTS 'branch_purchase';")

def downgrade():
    # Downgrade is not supported for removing enum values in PostgreSQL
    pass