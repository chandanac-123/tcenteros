"""create member_status updation

Revision ID: d13cff322550
Revises: ca83fd25dfe2
Create Date: 2026-02-07 09:54:02.693687

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd13cff322550'
down_revision: Union[str, Sequence[str], None] = 'ca83fd25dfe2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # Ensure enum type exists and includes all values
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status_enum') THEN
                CREATE TYPE member_status_enum AS ENUM ('member', 'guest', 'lead', 'visitor', 'network_member');
            END IF;
        END$$;
    """)
    # Drop default before altering type
    op.execute("ALTER TABLE auth.members ALTER COLUMN member_status DROP DEFAULT;")
    op.execute("ALTER TABLE auth.user_center_memberships ALTER COLUMN member_status DROP DEFAULT;")
    # Alter member_status column in auth.members to use the named enum
    op.execute("""
        ALTER TABLE auth.members
        ALTER COLUMN member_status TYPE member_status_enum
        USING member_status::text::member_status_enum
    """)
    # Alter member_status column in auth.user_center_memberships to use the named enum
    op.execute("""
        ALTER TABLE auth.user_center_memberships
        ALTER COLUMN member_status TYPE member_status_enum
        USING member_status::text::member_status_enum
    """)
    # Re-add default after type change
    op.execute("ALTER TABLE auth.members ALTER COLUMN member_status SET DEFAULT 'member';")
    op.execute("ALTER TABLE auth.user_center_memberships ALTER COLUMN member_status SET DEFAULT 'member';")

def downgrade():
    # Drop default before reverting type
    op.execute("ALTER TABLE auth.members ALTER COLUMN member_status DROP DEFAULT;")
    op.execute("ALTER TABLE auth.user_center_memberships ALTER COLUMN member_status DROP DEFAULT;")
    op.execute("""
        ALTER TABLE auth.members
        ALTER COLUMN member_status TYPE text
        USING member_status::text
    """)
    op.execute("""
        ALTER TABLE auth.user_center_memberships
        ALTER COLUMN member_status TYPE text
        USING member_status::text
    """)
    # Optionally re-add default as text
    op.execute("ALTER TABLE auth.members ALTER COLUMN member_status SET DEFAULT 'member';")
    op.execute("ALTER TABLE auth.user_center_memberships ALTER COLUMN member_status SET DEFAULT 'member';")