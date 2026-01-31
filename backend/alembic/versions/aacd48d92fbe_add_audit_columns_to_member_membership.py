"""Add audit columns to member_memberships

Revision ID: aacd48d92fbe
Revises: 2ea75e74ecd1
Create Date: 2026-01-31 06:08:58.807126

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aacd48d92fbe'
down_revision: Union[str, Sequence[str], None] = '2ea75e74ecd1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('member_memberships', sa.Column('created_at', sa.DateTime(), nullable=True), schema='membership')
    op.add_column('member_memberships', sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='membership')
    op.add_column('member_memberships', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='membership')
    op.add_column('member_memberships', sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='membership')

def downgrade():
    op.drop_column('member_memberships', 'created_at', schema='membership')
    op.drop_column('member_memberships', 'created_by', schema='membership')
    op.drop_column('member_memberships', 'updated_at', schema='membership')
    op.drop_column('member_memberships', 'updated_by', schema='membership')
