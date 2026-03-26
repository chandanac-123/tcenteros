"""Add order_type column to billing.payment_orders

Revision ID: fbdf7b6d29df
Revises: fcbcaeba10aa
Create Date: 2026-03-26 07:17:12.939156

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fbdf7b6d29df'
down_revision = 'fcbcaeba10aa'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Add the column as nullable
    op.add_column(
        'payment_orders',
        sa.Column(
            'order_type',
            sa.Enum(
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
                'other_charges',
                name='ordertype',
                schema='public'
            ),
            nullable=True
        ),
        schema='billing'
    )

    # 2. Backfill existing rows with a default value
    op.execute(
        "UPDATE billing.payment_orders SET order_type = 'other_charges' WHERE order_type IS NULL"
    )

    # 3. Alter the column to NOT NULL
    op.alter_column(
        'payment_orders',
        'order_type',
        nullable=False,
        schema='billing'
    )

def downgrade():
    op.drop_column('payment_orders', 'order_type', schema='billing')