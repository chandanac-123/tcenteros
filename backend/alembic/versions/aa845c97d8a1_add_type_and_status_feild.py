"""Add type and status feilds

Revision ID: aa845c97d8a1
Revises: 5202a8ddee9e
Create Date: 2026-02-24 07:04:28.126947

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'aa845c97d8a1'
down_revision = '5202a8ddee9e'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'wallet_transactions',
        sa.Column('type', sa.String(), nullable=False, server_default='debit'),
        schema='center'
    )
    op.add_column(
        'wallet_transactions',
        sa.Column('status', sa.String(), nullable=False, server_default='completed'),
        schema='center'
    )

def downgrade():
    op.drop_column('wallet_transactions', 'type', schema='center')
    op.drop_column('wallet_transactions', 'status', schema='center')


    