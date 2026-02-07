"""create audit feilds in usercentermemberships

Revision ID: ca83fd25dfe2
Revises: c9691360604e
Create Date: 2026-02-07 09:37:41.696650

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ca83fd25dfe2'
down_revision: Union[str, Sequence[str], None] = 'c9691360604e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('user_center_memberships', sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='auth')
    op.add_column('user_center_memberships', sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='auth')
    op.add_column('user_center_memberships', sa.Column('created_at', sa.DateTime(), nullable=True), schema='auth')
    op.add_column('user_center_memberships', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='auth')

def downgrade():
    op.drop_column('user_center_memberships', 'created_by', schema='auth')
    op.drop_column('user_center_memberships', 'updated_by', schema='auth')
    op.drop_column('user_center_memberships', 'created_at', schema='auth')
    op.drop_column('user_center_memberships', 'updated_at', schema='auth')
