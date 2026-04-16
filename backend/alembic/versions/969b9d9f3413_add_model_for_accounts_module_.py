"""Add model for accounts module

Revision ID: 969b9d9f3413
Revises: e57f56e7da4a
Create Date: 2026-03-12 12:37:08.032798

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '969b9d9f3413'
down_revision = 'e57f56e7da4a'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create accounts schema
    op.execute("CREATE SCHEMA IF NOT EXISTS accounts")
    
    # Create enums in accounts schema
    op.execute("""
        CREATE TYPE accounts.account_type AS ENUM (
            'asset', 'liability', 'equity', 'revenue', 'expense'
        )
    """)
    
    op.execute("""
        CREATE TYPE accounts.entry_status AS ENUM (
            'draft', 'posted', 'reversed'
        )
    """)
    
    op.execute("""
        CREATE TYPE accounts.transaction_source AS ENUM (
            'membership', 'inventory_sale', 'inventory_purchase', 
            'payroll', 'network_settlement', 'general_expense', 'manual'
        )
    """)
    
    # Chart of Accounts
    op.create_table(
        'chart_of_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('code', sa.String(20), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('account_type', postgresql.ENUM('asset', 'liability', 'equity', 'revenue', 'expense', name='account_type', schema='accounts', create_type=False), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_system', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_id'], ['accounts.chart_of_accounts.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        schema='accounts'
    )
    op.create_index('ix_accounts_chart_of_accounts_id', 'chart_of_accounts', ['id'], schema='accounts')
    op.create_index('ix_accounts_chart_of_accounts_center_id', 'chart_of_accounts', ['center_id'], schema='accounts')
    op.create_index('ix_accounts_chart_of_accounts_code', 'chart_of_accounts', ['code'], schema='accounts')
    op.create_index('ix_accounts_chart_of_accounts_account_type', 'chart_of_accounts', ['account_type'], schema='accounts')
    op.create_index('ix_accounts_chart_center_code', 'chart_of_accounts', ['center_id', 'code'], unique=True, schema='accounts')
    
    # Journal Entries
    op.create_table(
        'journal_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entry_number', sa.String(50), nullable=False),
        sa.Column('entry_date', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('source', postgresql.ENUM('membership', 'inventory_sale', 'inventory_purchase', 'payroll', 'network_settlement', 'general_expense', 'manual', name='transaction_source', schema='accounts', create_type=False), nullable=False),
        sa.Column('source_id', sa.String(50), nullable=True),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', postgresql.ENUM('draft', 'posted', 'reversed', name='entry_status', schema='accounts', create_type=False), nullable=True, server_default='draft'),
        sa.Column('posted_at', sa.DateTime(), nullable=True),
        sa.Column('posted_by', sa.Integer(), nullable=True),
        sa.Column('total_debit', sa.Numeric(15, 2), nullable=False),
        sa.Column('total_credit', sa.Numeric(15, 2), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='accounts'
    )
    op.create_index('ix_accounts_journal_entries_id', 'journal_entries', ['id'], schema='accounts')
    op.create_index('ix_accounts_journal_entries_entry_number', 'journal_entries', ['entry_number'], schema='accounts')
    op.create_index('ix_accounts_journal_entries_entry_date', 'journal_entries', ['entry_date'], schema='accounts')
    op.create_index('ix_accounts_journal_entries_source', 'journal_entries', ['source'], schema='accounts')
    op.create_index('ix_accounts_journal_entries_source_id', 'journal_entries', ['source_id'], schema='accounts')
    op.create_index('ix_accounts_journal_entries_center_id', 'journal_entries', ['center_id'], schema='accounts')
    op.create_index('ix_accounts_journal_entries_status', 'journal_entries', ['status'], schema='accounts')
    op.create_index('ix_accounts_journal_center_number', 'journal_entries', ['center_id', 'entry_number'], unique=True, schema='accounts')
    
    # Journal Entry Lines
    op.create_table(
        'journal_entry_lines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('journal_entry_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('entry_date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('debit', sa.Numeric(15, 2), nullable=True, server_default='0'),
        sa.Column('credit', sa.Numeric(15, 2), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['journal_entry_id'], ['accounts.journal_entries.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.chart_of_accounts.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        schema='accounts'
    )
    op.create_index('ix_accounts_journal_entry_lines_id', 'journal_entry_lines', ['id'], schema='accounts')
    op.create_index('ix_accounts_journal_entry_lines_entry_date', 'journal_entry_lines', ['entry_date'], schema='accounts')
    op.create_index('idx_je_line_account_date', 'journal_entry_lines', ['account_id', 'entry_date'], schema='accounts')
    
    # General Ledger
    op.create_table(
        'general_ledger',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('journal_entry_id', sa.Integer(), nullable=False),
        sa.Column('journal_entry_line_id', sa.Integer(), nullable=False),
        sa.Column('transaction_date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('debit', sa.Numeric(15, 2), nullable=True, server_default='0'),
        sa.Column('credit', sa.Numeric(15, 2), nullable=True, server_default='0'),
        sa.Column('balance', sa.Numeric(15, 2), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source', postgresql.ENUM('membership', 'inventory_sale', 'inventory_purchase', 'payroll', 'network_settlement', 'general_expense', 'manual', name='transaction_source', schema='accounts', create_type=False), nullable=False),
        sa.Column('source_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.chart_of_accounts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['journal_entry_id'], ['accounts.journal_entries.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['journal_entry_line_id'], ['accounts.journal_entry_lines.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='accounts'
    )
    op.create_index('ix_accounts_general_ledger_id', 'general_ledger', ['id'], schema='accounts')
    op.create_index('ix_accounts_general_ledger_transaction_date', 'general_ledger', ['transaction_date'], schema='accounts')
    op.create_index('ix_accounts_general_ledger_center_id', 'general_ledger', ['center_id'], schema='accounts')
    op.create_index('idx_gl_account_date', 'general_ledger', ['account_id', 'transaction_date'], schema='accounts')
    op.create_index('idx_gl_center_account', 'general_ledger', ['center_id', 'account_id'], schema='accounts')
    
    # Fiscal Periods
    op.create_table(
        'fiscal_periods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('is_closed', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('closed_at', sa.DateTime(), nullable=True),
        sa.Column('closed_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='accounts'
    )
    op.create_index('ix_accounts_fiscal_periods_id', 'fiscal_periods', ['id'], schema='accounts')
    op.create_index('ix_accounts_fiscal_periods_center_id', 'fiscal_periods', ['center_id'], schema='accounts')
    
    # Tax Ledger
    op.create_table(
        'tax_ledger',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('journal_entry_id', sa.Integer(), nullable=False),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_date', sa.DateTime(), nullable=False),
        sa.Column('tax_type', sa.String(50), nullable=False),
        sa.Column('tax_rate', sa.Numeric(5, 2), nullable=False),
        sa.Column('taxable_amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('source', postgresql.ENUM('membership', 'inventory_sale', 'inventory_purchase', 'payroll', 'network_settlement', 'general_expense', 'manual', name='transaction_source', schema='accounts', create_type=False), nullable=False),
        sa.Column('source_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['journal_entry_id'], ['accounts.journal_entries.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='accounts'
    )
    op.create_index('ix_accounts_tax_ledger_id', 'tax_ledger', ['id'], schema='accounts')
    op.create_index('ix_accounts_tax_ledger_center_id', 'tax_ledger', ['center_id'], schema='accounts')
    op.create_index('idx_tax_ledger_date', 'tax_ledger', ['transaction_date'], schema='accounts')
    op.create_index('idx_tax_ledger_center', 'tax_ledger', ['center_id'], schema='accounts')


def downgrade() -> None:
    # Drop tables in reverse order (respect foreign keys)
    op.drop_table('tax_ledger', schema='accounts')
    op.drop_table('fiscal_periods', schema='accounts')
    op.drop_table('general_ledger', schema='accounts')
    op.drop_table('journal_entry_lines', schema='accounts')
    op.drop_table('journal_entries', schema='accounts')
    op.drop_table('chart_of_accounts', schema='accounts')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS accounts.transaction_source CASCADE")
    op.execute("DROP TYPE IF EXISTS accounts.entry_status CASCADE")
    op.execute("DROP TYPE IF EXISTS accounts.account_type CASCADE")
    
    # Drop schema
    op.execute("DROP SCHEMA IF EXISTS accounts CASCADE")