"""create TransactionSource enum in accounts schema

Revision ID: fcbcaeba10aa
Revises: a67165d9ba8b
Create Date: 2026-03-26 05:34:17.291906

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fcbcaeba10aa'
down_revision = 'a67165d9ba8b'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TYPE accounts.transaction_source AS ENUM (
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
            'other_charges',
            'general_expense',
            'manual'
        );
    """)

def downgrade():
    op.execute("DROP TYPE IF EXISTS accounts.transaction_source CASCADE;")