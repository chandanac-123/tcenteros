"""Change user role

Revision ID: fece6b92db42
Revises: 0eaaa3c06e03
Create Date: 2026-01-28 05:41:39.314789

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fece6b92db42'
down_revision: Union[str, Sequence[str], None] = '0eaaa3c06e03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Change 'role' column to VARCHAR (String)
    op.execute("""
        ALTER TABLE shared.users
        ALTER COLUMN role TYPE VARCHAR
        USING role::VARCHAR
    """)

def downgrade():
    # If you want to revert, recreate the enum and cast back (edit as needed)
    op.execute("""
        CREATE TYPE user_role_enum AS ENUM ('superadmin', 'centeradmin', 'member', 'employee');
    """)
    op.execute("""
        ALTER TABLE shared.users
        ALTER COLUMN role TYPE user_role_enum
        USING role::user_role_enum
    """)