"""Add audit fields in center holiday

Revision ID: 345a7287b996
Revises: bc6a8c0f75d6
Create Date: 2026-02-04 09:29:18.216662

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '345a7287b996'
down_revision: Union[str, Sequence[str], None] = 'bc6a8c0f75d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('center_holidays', sa.Column('created_at', sa.DateTime(), nullable=True), schema='settings')
    op.add_column('center_holidays', sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True), schema='settings')
    op.add_column('center_holidays', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='settings')
    op.add_column('center_holidays', sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True), schema='settings')

def downgrade():
    op.drop_column('center_holidays', 'created_at', schema='settings')
    op.drop_column('center_holidays', 'created_by', schema='settings')
    op.drop_column('center_holidays', 'updated_at', schema='settings')
    op.drop_column('center_holidays', 'updated_by', schema='settings')
