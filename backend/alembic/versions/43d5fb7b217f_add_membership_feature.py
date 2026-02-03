"""Add membership_features

Revision ID: 43d5fb7b217f
Revises: 75b0902e7ccc
Create Date: 2026-02-03 04:32:41.200349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid


# revision identifiers, used by Alembic.
revision: str = '43d5fb7b217f'
down_revision: Union[str, Sequence[str], None] = '75b0902e7ccc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'membership_features',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('membership_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('membership.memberships.membership_id'), nullable=False),
        sa.Column('feature_name', sa.String(), nullable=False),
        sa.Column('feature_description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='membership'
    )

def downgrade():
    op.drop_table('membership_features', schema='membership')
