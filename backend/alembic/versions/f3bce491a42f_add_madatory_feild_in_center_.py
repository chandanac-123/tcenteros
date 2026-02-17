"""Add madatory feild in center

Revision ID: f3bce491a42f
Revises: d5f7ed80773e
Create Date: 2026-02-17 07:45:15.007204

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3bce491a42f'
down_revision: Union[str, Sequence[str], None] = 'd5f7ed80773e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        'platform_features',
        sa.Column('mandatory', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        schema='platform'
    )

def downgrade():
    op.drop_column('platform_features', 'mandatory', schema='platform')
