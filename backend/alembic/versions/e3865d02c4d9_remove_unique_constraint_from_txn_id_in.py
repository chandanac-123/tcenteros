"""remove unique constraint from txn_id in wallet_transactions

Revision ID: e3865d02c4d9
Revises: 64d323140c39
Create Date: 2026-04-06 11:09:18.325625

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e3865d02c4d9'
down_revision = '64d323140c39'
branch_labels = None
depends_on = None

"""remove unique constraint from txn_id in wallet_transactions

Revision ID: remove_txn_id_unique
Revises: <your_previous_revision_id>
Create Date: 2026-04-06
"""


def upgrade():
    # 🔥 Drop UNIQUE constraint
    op.drop_constraint(
        'wallet_transactions_txn_id_key',
        'wallet_transactions',
        schema='center',
        type_='unique'
    )

    # ✅ Add index for performance
    op.create_index(
        'ix_wallet_transactions_txn_id',
        'wallet_transactions',
        ['txn_id'],
        schema='center'
    )


def downgrade():
    # ❌ Remove index
    op.drop_index(
        'ix_wallet_transactions_txn_id',
        table_name='wallet_transactions',
        schema='center'
    )

    # 🔁 Re-add UNIQUE constraint (rollback)
    op.create_unique_constraint(
        'wallet_transactions_txn_id_key',
        'wallet_transactions',
        ['txn_id'],
        schema='center'
    )