"""update the network status enum

Revision ID: be92a18820c0
Revises: aa845c97d8a1
Create Date: 2026-02-25 06:33:19.952871

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'be92a18820c0'
down_revision = 'aa845c97d8a1'
branch_labels = None
depends_on = None

def upgrade():
    # Drop default
    op.execute("""
        ALTER TABLE auth.user_center_memberships
        ALTER COLUMN network_status DROP DEFAULT;
    """)

    # Rename old enum
    op.execute("ALTER TYPE networking_status_enum RENAME TO networking_status_enum_old;")

    # Create new enum
    op.execute("""
        CREATE TYPE networking_status_enum AS ENUM (
            'pending',
            'approved',
            'paid',
            'completed',
            'pending_settlement'
        );
    """)

    # Alter column to use new enum
    op.execute("""
        ALTER TABLE auth.user_center_memberships
        ALTER COLUMN network_status
        TYPE networking_status_enum
        USING network_status::text::networking_status_enum;
    """)

    # Restore default
    op.execute("""
        ALTER TABLE auth.user_center_memberships
        ALTER COLUMN network_status SET DEFAULT 'pending';
    """)

    # Drop old enum
    op.execute("DROP TYPE networking_status_enum_old;")