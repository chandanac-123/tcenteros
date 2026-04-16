"""Corrected the accounts model

Revision ID: a3c01760fc07
Revises: ff66bfb378d7
Create Date: 2026-03-17 08:12:03.127820

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'a3c01760fc07'
down_revision = 'ff66bfb378d7'
branch_labels = None
depends_on = None

def upgrade():
    """
    Convert all accounting table IDs and foreign keys from INTEGER to UUID.
    This migration assumes tables are empty or in development.
    """
    
    # ========================================
    # STEP 1: Drop all foreign key constraints
    # ========================================
    
    # Drop FK constraints from journal_entry_lines
    op.drop_constraint('journal_entry_lines_journal_entry_id_fkey', 'journal_entry_lines', schema='accounts', type_='foreignkey')
    
    # Drop FK constraints from general_ledger
    op.drop_constraint('general_ledger_journal_entry_id_fkey', 'general_ledger', schema='accounts', type_='foreignkey')
    op.drop_constraint('general_ledger_journal_entry_line_id_fkey', 'general_ledger', schema='accounts', type_='foreignkey')
    
    # Drop FK constraints from tax_ledger
    op.drop_constraint('tax_ledger_journal_entry_id_fkey', 'tax_ledger', schema='accounts', type_='foreignkey')
    
    # ========================================
    # STEP 2: Convert journal_entries table (parent table)
    # ========================================
    
    # Convert primary key
    op.execute("""
        ALTER TABLE accounts.journal_entries 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING gen_random_uuid();
    """)
    
    # Convert user reference columns
    op.execute("""
        ALTER TABLE accounts.journal_entries 
        ALTER COLUMN posted_by TYPE UUID USING NULL;
    """)
    
    op.execute("""
        ALTER TABLE accounts.journal_entries 
        ALTER COLUMN created_by DROP NOT NULL,
        ALTER COLUMN created_by TYPE UUID USING NULL,
        ALTER COLUMN created_by SET NOT NULL;
    """)
    
    # ========================================
    # STEP 3: Convert journal_entry_lines table
    # ========================================
    
    # Convert primary key
    op.execute("""
        ALTER TABLE accounts.journal_entry_lines 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING gen_random_uuid();
    """)
    
    # Convert foreign key to journal_entries
    op.execute("""
        ALTER TABLE accounts.journal_entry_lines 
        ALTER COLUMN journal_entry_id TYPE UUID USING NULL;
    """)
    
    # ========================================
    # STEP 4: Convert general_ledger table
    # ========================================
    
    # Convert primary key
    op.execute("""
        ALTER TABLE accounts.general_ledger 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING gen_random_uuid();
    """)
    
    # Convert foreign keys
    op.execute("""
        ALTER TABLE accounts.general_ledger 
        ALTER COLUMN journal_entry_id TYPE UUID USING NULL;
    """)
    
    op.execute("""
        ALTER TABLE accounts.general_ledger 
        ALTER COLUMN journal_entry_line_id TYPE UUID USING NULL;
    """)
    
    # ========================================
    # STEP 5: Convert tax_ledger table
    # ========================================
    
    # Convert primary key
    op.execute("""
        ALTER TABLE accounts.tax_ledger 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING gen_random_uuid();
    """)
    
    # Convert foreign key
    op.execute("""
        ALTER TABLE accounts.tax_ledger 
        ALTER COLUMN journal_entry_id TYPE UUID USING NULL;
    """)
    
    # ========================================
    # STEP 6: Convert fiscal_periods table
    # ========================================
    
    # Convert primary key
    op.execute("""
        ALTER TABLE accounts.fiscal_periods 
        ALTER COLUMN id DROP DEFAULT,
        ALTER COLUMN id TYPE UUID USING gen_random_uuid();
    """)
    
    # Convert user reference column
    op.execute("""
        ALTER TABLE accounts.fiscal_periods 
        ALTER COLUMN closed_by TYPE UUID USING NULL;
    """)
    
    # ========================================
    # STEP 7: Recreate all foreign key constraints
    # ========================================
    
    # FK from journal_entry_lines to journal_entries
    op.create_foreign_key(
        'journal_entry_lines_journal_entry_id_fkey',
        'journal_entry_lines', 'journal_entries',
        ['journal_entry_id'], ['id'],
        source_schema='accounts', referent_schema='accounts',
        ondelete='CASCADE'
    )
    
    # FK from general_ledger to journal_entries
    op.create_foreign_key(
        'general_ledger_journal_entry_id_fkey',
        'general_ledger', 'journal_entries',
        ['journal_entry_id'], ['id'],
        source_schema='accounts', referent_schema='accounts',
        ondelete='CASCADE'
    )
    
    # FK from general_ledger to journal_entry_lines
    op.create_foreign_key(
        'general_ledger_journal_entry_line_id_fkey',
        'general_ledger', 'journal_entry_lines',
        ['journal_entry_line_id'], ['id'],
        source_schema='accounts', referent_schema='accounts',
        ondelete='CASCADE'
    )
    
    # FK from tax_ledger to journal_entries
    op.create_foreign_key(
        'tax_ledger_journal_entry_id_fkey',
        'tax_ledger', 'journal_entries',
        ['journal_entry_id'], ['id'],
        source_schema='accounts', referent_schema='accounts',
        ondelete='CASCADE'
    )


def downgrade():
    """
    Revert UUID columns back to INTEGER.
    WARNING: This will lose all data in these tables.
    """
    
    # Drop FK constraints
    op.drop_constraint('journal_entry_lines_journal_entry_id_fkey', 'journal_entry_lines', schema='accounts', type_='foreignkey')
    op.drop_constraint('general_ledger_journal_entry_id_fkey', 'general_ledger', schema='accounts', type_='foreignkey')
    op.drop_constraint('general_ledger_journal_entry_line_id_fkey', 'general_ledger', schema='accounts', type_='foreignkey')
    op.drop_constraint('tax_ledger_journal_entry_id_fkey', 'tax_ledger', schema='accounts', type_='foreignkey')
    
    # Convert back to INTEGER (will fail if data exists)
    op.execute("ALTER TABLE accounts.journal_entries ALTER COLUMN id TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.journal_entries ALTER COLUMN posted_by TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.journal_entries ALTER COLUMN created_by TYPE INTEGER USING 0;")
    
    op.execute("ALTER TABLE accounts.journal_entry_lines ALTER COLUMN id TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.journal_entry_lines ALTER COLUMN journal_entry_id TYPE INTEGER USING 0;")
    
    op.execute("ALTER TABLE accounts.general_ledger ALTER COLUMN id TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.general_ledger ALTER COLUMN journal_entry_id TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.general_ledger ALTER COLUMN journal_entry_line_id TYPE INTEGER USING 0;")
    
    op.execute("ALTER TABLE accounts.tax_ledger ALTER COLUMN id TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.tax_ledger ALTER COLUMN journal_entry_id TYPE INTEGER USING 0;")
    
    op.execute("ALTER TABLE accounts.fiscal_periods ALTER COLUMN id TYPE INTEGER USING 0;")
    op.execute("ALTER TABLE accounts.fiscal_periods ALTER COLUMN closed_by TYPE INTEGER USING 0;")
    
    # Recreate FK constraints
    op.create_foreign_key(
        'journal_entry_lines_journal_entry_id_fkey',
        'journal_entry_lines', 'journal_entries',
        ['journal_entry_id'], ['id'],
        source_schema='accounts', referent_schema='accounts'
    )
    
    op.create_foreign_key(
        'general_ledger_journal_entry_id_fkey',
        'general_ledger', 'journal_entries',
        ['journal_entry_id'], ['id'],
        source_schema='accounts', referent_schema='accounts'
    )
    
    op.create_foreign_key(
        'general_ledger_journal_entry_line_id_fkey',
        'general_ledger', 'journal_entry_lines',
        ['journal_entry_line_id'], ['id'],
        source_schema='accounts', referent_schema='accounts'
    )
    
    op.create_foreign_key(
        'tax_ledger_journal_entry_id_fkey',
        'tax_ledger', 'journal_entries',
        ['journal_entry_id'], ['id'],
        source_schema='accounts', referent_schema='accounts'
    )