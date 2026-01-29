"""add gst_number to center

Revision ID: 7fd90cc490e2
Revises: c8eed60850a3
Create Date: 2026-01-29 08:22:59.911846

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7fd90cc490e2'
down_revision: Union[str, Sequence[str], None] = 'c8eed60850a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('centers',
        sa.Column('gst_number', sa.String(), nullable=True),
        schema='center'
    )

def downgrade():
    op.drop_column('centers', 'gst_number', schema='center')