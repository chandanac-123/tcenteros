"""Add payrole cycle

Revision ID: 14bdc97a9ff6
Revises: ffb8f474d99e
Create Date: 2026-02-27 04:18:07.603295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '14bdc97a9ff6'
down_revision = 'ffb8f474d99e'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'center_operational_settings',
        sa.Column('payroll_cycle_day', sa.Integer(), nullable=False, server_default='1'),
        schema='settings'
    )

def downgrade():
    op.drop_column('center_operational_settings', 'payroll_cycle_day', schema='settings')