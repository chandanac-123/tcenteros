"""drop TransactionSource and OrderTypeenum

Revision ID: 8fb933115a28
Revises: 584ade48400c
Create Date: 2026-03-26 05:27:45.175782

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8fb933115a28'
down_revision = '584ade48400c'
branch_labels = None
depends_on = None

def upgrade():
    # Drop TransactionSource enum in accounts schema
    op.execute("DROP TYPE IF EXISTS accounts.transaction_source CASCADE;")
    # Drop OrderType enum in public schema
    op.execute("DROP TYPE IF EXISTS ordertype CASCADE;")

def downgrade():
    # Recreate TransactionSource enum in accounts schema
    op.execute("""
        CREATE TYPE accounts.transaction_source AS ENUM (
            'membership',
            'inventory_sale',
            'inventory_purchase',
            'payroll',
            'network_settlement',
            'general_expense',
            'manual'
        );
    """)
    # Recreate OrderType enum in public schema
    op.execute("""
        CREATE TYPE ordertype AS ENUM (
            'center_subscription',
            'feature_purchase',
            'renewal',
            'upgrade',
            'add_on',
            'refund',
            'stock_purchase',
            'membership',
            'networking_access'
        );
    """)