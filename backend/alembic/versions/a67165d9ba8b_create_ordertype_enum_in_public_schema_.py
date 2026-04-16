"""create OrderType enum in public schema

Revision ID: a67165d9ba8b
Revises: 8fb933115a28
Create Date: 2026-03-26 05:33:01.826189

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a67165d9ba8b'
down_revision = '8fb933115a28'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TYPE ordertype AS ENUM (
            'membership',
            'membership_renewal',
            'membership_upgrade',
            'inventory_sale',
            'inventory_purchase',
            'payroll',
            'network_in',
            'network_out',
            'network_settlement',
            'branch_purchase',
            'center_subscription',
            'feature_purchase',
            'add_on',
            'refund',
            'other_charges'
        );
    """)

def downgrade():
    op.execute("DROP TYPE IF EXISTS ordertype CASCADE;")