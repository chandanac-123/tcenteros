"""Add about and facilities in center

Revision ID: 41c048f47ab2
Revises: efe15f8165da
Create Date: 2026-02-09 09:59:54.080169

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '41c048f47ab2'
down_revision: Union[str, Sequence[str], None] = 'efe15f8165da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('centers', sa.Column('about', sa.Text(), nullable=True), schema='center')
    op.add_column('centers', sa.Column('facilities', postgresql.ARRAY(sa.Text()), nullable=True), schema='center')

def downgrade():
    op.drop_column('centers', 'facilities', schema='center')
    op.drop_column('centers', 'about', schema='center')