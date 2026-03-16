"""add monthly duration in onboarding

Revision ID: ff66bfb378d7
Revises: 9d13d999711d
Create Date: 2026-03-16 12:05:50.877332

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ff66bfb378d7'
down_revision = '9d13d999711d'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'center_onboarding_temp',
        sa.Column('subscription_duration', sa.String(), nullable=False, server_default='yearly'),
        schema='center'
    )

def downgrade():
    op.drop_column('center_onboarding_temp', 'subscription_duration', schema='center')