"""Change user_role_enum to VARCHAR

Revision ID: 0eaaa3c06e03
Revises: 107312f76b72
Create Date: 2026-01-28 05:26:21.681321

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0eaaa3c06e03'
down_revision: Union[str, Sequence[str], None] = '107312f76b72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Change 'role' column in shared.users from enum to VARCHAR
    op.execute("""
        ALTER TABLE shared.users
        ALTER COLUMN role TYPE VARCHAR
        USING role::VARCHAR
    """)
    # Optionally, drop the old enum type if not used elsewhere:
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                DROP TYPE user_role_enum;
            END IF;
        END$$;
    """)

def downgrade():
    # Downgrade: recreate enum and change column back (if needed)
    op.execute("""
        CREATE TYPE user_role_enum AS ENUM ('superadmin', 'centeradmin', 'member', 'employee');
    """)
    op.execute("""
        ALTER TABLE shared.users
        ALTER COLUMN role TYPE user_role_enum
        USING role::user_role_enum
    """)