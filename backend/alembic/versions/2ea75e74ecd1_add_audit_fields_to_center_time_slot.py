"""Add audit fields to center_time_slots

Revision ID: 2ea75e74ecd1
Revises: 2b8f10e4502d
Create Date: 2026-01-31 05:49:26.510398

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ea75e74ecd1'
down_revision: Union[str, Sequence[str], None] = '2b8f10e4502d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('center_time_slots', sa.Column('created_at', sa.DateTime(), nullable=True), schema='center')
    op.add_column('center_time_slots', sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='center')
    op.add_column('center_time_slots', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='center')
    op.add_column('center_time_slots', sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='center')

def downgrade():
    op.drop_column('center_time_slots', 'created_at', schema='center')
    op.drop_column('center_time_slots', 'created_by', schema='center')
    op.drop_column('center_time_slots', 'updated_at', schema='center')
    op.drop_column('center_time_slots', 'updated_by', schema='center')
