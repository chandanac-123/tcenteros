"""Add inventory profit to operational settings

Revision ID: ffb8f474d99e
Revises: c43a438fd31c
Create Date: 2026-02-26 12:14:26.239910

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ffb8f474d99e'
down_revision = 'c43a438fd31c'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'center_operational_settings',
        sa.Column('inventory_profit', sa.Numeric(10, 2), nullable=False, server_default='0.0'),
        schema='settings'
    )

def downgrade():
    op.drop_column('center_operational_settings', 'inventory_profit', schema='settings')