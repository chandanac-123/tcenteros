"""Add taxid and balance

Revision ID: 5202a8ddee9e
Revises: ac82dbb8b4e1
Create Date: 2026-02-24 06:20:25.077928

"""
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = '5202a8ddee9e'
down_revision = 'ac82dbb8b4e1'
branch_labels = None
depends_on = None

def upgrade():
    # Add txn_id column as nullable first
    op.add_column(
        'wallet_transactions',
        sa.Column('txn_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )
    # Add balance column
    op.add_column(
        'wallet_transactions',
        sa.Column('balance', sa.Numeric(12, 2), nullable=False, server_default='0'),
        schema='center'
    )

    # Generate a unique UUID for each row
    conn = op.get_bind()
    result = conn.execute(sa.text('SELECT id FROM center.wallet_transactions WHERE txn_id IS NULL'))
    rows = result.fetchall()
    for row in rows:
        conn.execute(
            sa.text('UPDATE center.wallet_transactions SET txn_id = :uuid WHERE id = :id'),
            {'uuid': str(uuid.uuid4()), 'id': row[0]}
        )

    # Now alter column to set NOT NULL
    op.alter_column('wallet_transactions', 'txn_id', nullable=False, schema='center')
    # Add unique constraint
    op.create_unique_constraint(
        'wallet_transactions_txn_id_key',
        'wallet_transactions',
        ['txn_id'],
        schema='center'
    )

def downgrade():
    op.drop_constraint('wallet_transactions_txn_id_key', 'wallet_transactions', schema='center')
    op.drop_column('wallet_transactions', 'txn_id', schema='center')
    op.drop_column('wallet_transactions', 'balance', schema='center')