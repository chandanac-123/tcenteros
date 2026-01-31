"""Add audit fields to memberships

Revision ID: 2b8f10e4502d
Revises: 1cbd6dd5ef0a
Create Date: 2026-01-31 04:28:58.571176

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2b8f10e4502d'
down_revision: Union[str, Sequence[str], None] = '1cbd6dd5ef0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('memberships', sa.Column('created_at', sa.DateTime(), nullable=True), schema='membership')
    op.add_column('memberships', sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='membership')
    op.add_column('memberships', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='membership')
    op.add_column('memberships', sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='membership')

def downgrade():
    op.drop_column('memberships', 'created_at', schema='membership')
    op.drop_column('memberships', 'created_by', schema='membership')
    op.drop_column('memberships', 'updated_at', schema='membership')
    op.drop_column('memberships', 'updated_by', schema='membership')