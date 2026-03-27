"""add general_income to transaction_source enum

Revision ID: 73c4efe908b3
Revises: fbdf7b6d29df
Create Date: 2026-03-27 07:01:11.506129

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73c4efe908b3'
down_revision = 'fbdf7b6d29df'
branch_labels = None
depends_on = None

enum_name = 'transaction_source'
schema = 'accounts'
new_value = 'general_income'

def upgrade():
    # Add new value to the enum type
    op.execute(f"ALTER TYPE {schema}.{enum_name} ADD VALUE IF NOT EXISTS '{new_value}';")

def downgrade():
    # Downgrade is not supported for removing enum values in PostgreSQL
    pass