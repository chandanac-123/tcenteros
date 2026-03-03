"""Update the feild status in membership plans

Revision ID: f220bf662095
Revises: 793357d6bdde
Create Date: 2026-03-03 09:23:16.231201

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f220bf662095'
down_revision = '793357d6bdde'
branch_labels = None
depends_on = None

# Replace with your actual enum values
status_enum_values = ('active', 'inactive')

def upgrade():
    # op.execute("CREATE TYPE status_enum AS ENUM ('active', 'inactive')")  # Remove or comment this line
    op.execute("""
        ALTER TABLE membership.memberships
        ALTER COLUMN status TYPE status_enum
        USING status::text::status_enum
    """)

def downgrade():
    # Revert column to text (or previous enum type if needed)
    op.execute("""
        ALTER TABLE membership.memberships
        ALTER COLUMN status TYPE text
        USING status::text
    """)
    op.execute("DROP TYPE status_enum")