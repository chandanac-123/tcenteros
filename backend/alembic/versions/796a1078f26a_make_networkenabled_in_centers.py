"""make networkenabled in center

Revision ID: 796a1078f26a
Revises: 345a7287b996
Create Date: 2026-02-05 04:30:11.146008

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '796a1078f26a'
down_revision: Union[str, Sequence[str], None] = '345a7287b996'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column(
        'centers',
        'network_enabled',
        schema='center',
        server_default=sa.text('true'),
        existing_type=sa.Boolean(),
    )

def downgrade():
    op.alter_column(
        'centers',
        'network_enabled',
        schema='center',
        server_default=sa.text('false'),
        existing_type=sa.Boolean(),
    )
