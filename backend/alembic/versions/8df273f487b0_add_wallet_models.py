"""Add wallet model

Revision ID: 8df273f487b0
Revises: 30793b8790c7
Create Date: 2026-02-06 10:49:46.509570

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8df273f487b0'
down_revision: Union[str, Sequence[str], None] = '30793b8790c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Create platform_wallet table
    op.create_table(
        'platform_wallet',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('balance', sa.Numeric(12, 2), nullable=False, default=0),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        schema='platform'
    )

    # 2. Create center_wallets table
    op.create_table(
        'center_wallets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('balance', sa.Numeric(12, 2), nullable=False, default=0),
        sa.Column('deposit', sa.Numeric(12, 2), nullable=False, default=0),
        sa.Column('min_balance', sa.Numeric(12, 2), nullable=False, default=10000),
        sa.Column('min_deposit', sa.Numeric(12, 2), nullable=False, default=2000),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )

    # 3. Create wallet_transactions table
    op.create_table(
        'wallet_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('from_wallet_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('center.center_wallets.id'), nullable=True),
        sa.Column('to_wallet_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('center.center_wallets.id'), nullable=True),
        sa.Column('platform_wallet_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('platform.platform_wallet.id'), nullable=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('transaction_type', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )

def downgrade():
    op.drop_table('wallet_transactions', schema='center')
    op.drop_table('center_wallets', schema='center')
    op.drop_table('platform_wallet', schema='platform')
