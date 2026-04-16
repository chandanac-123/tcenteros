"""correct the status enum

Revision ID: 87a62b2c7696
Revises: d0a900477d0d
Create Date: 2026-02-21 11:48:29.445110

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '87a62b2c7696'
down_revision = 'd0a900477d0d'
branch_labels = None
depends_on = None

def upgrade():
    # Remove default before altering type
    op.execute("ALTER TABLE membership.memberships ALTER COLUMN status DROP DEFAULT")
    # Change the column type to use the existing public.status_enum
    op.execute("""
        ALTER TABLE membership.memberships
        ALTER COLUMN status TYPE public.status_enum
        USING status::public.status_enum
    """)
    # Set the default again (if needed)
    op.execute("ALTER TABLE membership.memberships ALTER COLUMN status SET DEFAULT 'active'")

def downgrade():
    # Remove default before reverting type
    op.execute("ALTER TABLE membership.memberships ALTER COLUMN status DROP DEFAULT")
    # Revert the column type back to varchar
    op.execute("""
        ALTER TABLE membership.memberships
        ALTER COLUMN status TYPE character varying(9)
        USING status::text
    """)
    # Set the default again (if needed)
    op.execute("ALTER TABLE membership.memberships ALTER COLUMN status SET DEFAULT 'active'")