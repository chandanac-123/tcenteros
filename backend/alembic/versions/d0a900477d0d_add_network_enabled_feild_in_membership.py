"""Add network_enabled feild in membership plan

Revision ID: d0a900477d0d
Revises: fc09baaf7159
Create Date: 2026-02-21 09:06:18.223807

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd0a900477d0d'
down_revision = 'fc09baaf7159'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'memberships',
        sa.Column('network_enabled', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        schema='membership'
    )

def downgrade():
    op.drop_column('memberships', 'network_enabled', schema='membership')    