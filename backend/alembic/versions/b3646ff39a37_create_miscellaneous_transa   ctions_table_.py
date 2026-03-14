"""create miscellaneous transactions table

Revision ID: b3646ff39a37
Revises: 969b9d9f3413
Create Date: 2026-03-14 06:19:52.653568

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b3646ff39a37'
down_revision = '969b9d9f3413'
branch_labels = None
depends_on = None


def upgrade():
    # Create miscellaneous_transactions table
    op.create_table(
        'miscellaneous_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(precision=10, scale=2), server_default='0.00', nullable=True),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tax_category_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payment_order_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payment_method', postgresql.ENUM('cash', 'bank_transfer', 'upi', 'card', 'other', name='payroll_payment_method', schema='public', create_type=False), nullable=True),
        sa.Column('payment_status', postgresql.ENUM('pending', 'created', 'processing', 'paid', 'unpaid', 'failed', 'cancelled', 'refunded', 'expired', name='paymentorderstatus', schema='public', create_type=False), server_default='pending', nullable=False),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('party_name', sa.String(length=255), nullable=True),
        sa.Column('party_contact', sa.String(length=50), nullable=True),
        sa.Column('invoice_number', sa.String(length=100), nullable=True),
        sa.Column('receipt_number', sa.String(length=100), nullable=True),
        sa.Column('attachment_urls', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ),
        sa.ForeignKeyConstraint(['payment_order_id'], ['billing.payment_orders.payment_order_id'], ),
        sa.ForeignKeyConstraint(['tax_category_id'], ['settings.tax_categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('payment_order_id'),
        schema='billing'
    )
    
    # Create indexes
    op.create_index('ix_billing_miscellaneous_transactions_center_id', 'miscellaneous_transactions', ['center_id'], schema='billing')
    op.create_index('ix_billing_miscellaneous_transactions_transaction_type', 'miscellaneous_transactions', ['transaction_type'], schema='billing')
    op.create_index('ix_billing_miscellaneous_transactions_category', 'miscellaneous_transactions', ['category'], schema='billing')
    op.create_index('ix_billing_miscellaneous_transactions_tax_category_id', 'miscellaneous_transactions', ['tax_category_id'], schema='billing')
    op.create_index('ix_billing_miscellaneous_transactions_payment_order_id', 'miscellaneous_transactions', ['payment_order_id'], schema='billing')
    op.create_index('ix_billing_miscellaneous_transactions_payment_status', 'miscellaneous_transactions', ['payment_status'], schema='billing')
    op.create_index('ix_billing_miscellaneous_transactions_transaction_date', 'miscellaneous_transactions', ['transaction_date'], schema='billing')


def downgrade():
    # Drop indexes
    op.drop_index('ix_billing_miscellaneous_transactions_transaction_date', table_name='miscellaneous_transactions', schema='billing')
    op.drop_index('ix_billing_miscellaneous_transactions_payment_status', table_name='miscellaneous_transactions', schema='billing')
    op.drop_index('ix_billing_miscellaneous_transactions_payment_order_id', table_name='miscellaneous_transactions', schema='billing')
    op.drop_index('ix_billing_miscellaneous_transactions_tax_category_id', table_name='miscellaneous_transactions', schema='billing')
    op.drop_index('ix_billing_miscellaneous_transactions_category', table_name='miscellaneous_transactions', schema='billing')
    op.drop_index('ix_billing_miscellaneous_transactions_transaction_type', table_name='miscellaneous_transactions', schema='billing')
    op.drop_index('ix_billing_miscellaneous_transactions_center_id', table_name='miscellaneous_transactions', schema='billing')
    
    # Drop table
    op.drop_table('miscellaneous_transactions', schema='billing')