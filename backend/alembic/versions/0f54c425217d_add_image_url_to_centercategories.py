"""Add image_url to center_categories

Revision ID: 0f54c425217d
Revises: e2a4faf5ea85
Create Date: 2026-01-28 06:45:04.763008

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f54c425217d'
down_revision: Union[str, Sequence[str], None] = 'e2a4faf5ea85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        'center_categories',
        sa.Column('image_url', sa.String(), nullable=True),
        schema='settings'
    )

def downgrade():
    op.drop_column('center_categories', 'image_url', schema='settings')