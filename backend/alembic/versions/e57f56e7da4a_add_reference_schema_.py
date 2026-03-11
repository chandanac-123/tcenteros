"""Add reference schema

Revision ID: e57f56e7da4a
Revises: 981d548adad0
Create Date: 2026-03-11 05:50:27.942816

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e57f56e7da4a'
down_revision = '981d548adad0'
branch_labels = None
depends_on = None

def upgrade():
    # Add new values to OrderType enum
    op.execute("ALTER TYPE ordertype ADD VALUE IF NOT EXISTS 'membership'")
    op.execute("ALTER TYPE ordertype ADD VALUE IF NOT EXISTS 'networking_access'")
    
    # Add new value to ReferenceSchema enum
    op.execute("ALTER TYPE referenceschema ADD VALUE IF NOT EXISTS 'networking_access_request'")


def downgrade():
    # Note: PostgreSQL does not support removing enum values directly
    # You would need to recreate the enum type if you want to remove values
    # For safety, we'll leave this as a no-op or add a warning
    pass
    
    # If you really need to remove these values, you'd need to:
    # 1. Create new enum types without these values
    # 2. Alter all columns using these enums to the new types
    # 3. Drop the old enum types
    # 4. Rename new enum types to original names
    # This is complex and risky, so typically enum additions are not reversed