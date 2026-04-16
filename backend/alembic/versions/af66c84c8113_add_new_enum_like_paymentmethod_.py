"""Add new enum like paymentmethod

Revision ID: af66c84c8113
Revises: f220bf662095
Create Date: 2026-03-04 05:13:33.272117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'af66c84c8113'
down_revision = 'f220bf662095'
branch_labels = None
depends_on = None

# Enum values
payment_method_enum = ('cash', 'card', 'upi', 'bank_transfer', 'other')

def upgrade():
    # Create the enum type in public schema
    op.execute("CREATE TYPE paymentmethod AS ENUM ('cash', 'card', 'upi', 'bank_transfer', 'other');")
    # Add the column to billing.payment_orders
    op.add_column(
        'payment_orders',
        sa.Column('payment_method', sa.Enum(*payment_method_enum, name='paymentmethod', schema='public'), nullable=True),
        schema='billing'
    )

def downgrade():
    # Remove the column
    op.drop_column('payment_orders', 'payment_method', schema='billing')
    # Drop the enum type
    op.execute("DROP TYPE paymentmethod;")