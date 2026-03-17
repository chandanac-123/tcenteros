"""update the source in account

Revision ID: 2a6a98a0bb5f
Revises: a3c01760fc07
Create Date: 2026-03-17 09:21:40.529563

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2a6a98a0bb5f'
down_revision = 'a3c01760fc07'
branch_labels = None
depends_on = None

def upgrade():
    # JournalEntry
    op.alter_column(
        'journal_entries', 'source',
        type_=sa.String(50),
        schema='accounts',
        existing_type=sa.Enum(
            'membership', 'inventory_sale', 'inventory_purchase', 'payroll',
            'network_settlement', 'general_expense', 'manual',
            name='transaction_source', schema='accounts'
        ),
        nullable=False
    )
    # GeneralLedger
    op.alter_column(
        'general_ledger', 'source',
        type_=sa.String(50),
        schema='accounts',
        existing_type=sa.Enum(
            'membership', 'inventory_sale', 'inventory_purchase', 'payroll',
            'network_settlement', 'general_expense', 'manual',
            name='transaction_source', schema='accounts'
        ),
        nullable=False
    )
    # TaxLedger
    op.alter_column(
        'tax_ledger', 'source',
        type_=sa.String(50),
        schema='accounts',
        existing_type=sa.Enum(
            'membership', 'inventory_sale', 'inventory_purchase', 'payroll',
            'network_settlement', 'general_expense', 'manual',
            name='transaction_source', schema='accounts'
        ),
        nullable=False
    )

def downgrade():
    transaction_source_enum = sa.Enum(
        'membership', 'inventory_sale', 'inventory_purchase', 'payroll',
        'network_settlement', 'general_expense', 'manual',
        name='transaction_source', schema='accounts'
    )
    # JournalEntry
    op.alter_column(
        'journal_entries', 'source',
        type_=transaction_source_enum,
        schema='accounts',
        existing_type=sa.String(50),
        nullable=False
    )
    # GeneralLedger
    op.alter_column(
        'general_ledger', 'source',
        type_=transaction_source_enum,
        schema='accounts',
        existing_type=sa.String(50),
        nullable=False
    )
    # TaxLedger
    op.alter_column(
        'tax_ledger', 'source',
        type_=transaction_source_enum,
        schema='accounts',
        existing_type=sa.String(50),
        nullable=False
    )