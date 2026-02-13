"""Add audit fields in branding models

Revision ID: eb10f02c2c6b
Revises: 38940321f084
Create Date: 2026-02-13 09:17:07.515542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eb10f02c2c6b'
down_revision: Union[str, Sequence[str], None] = '38940321f084'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('white_label_configs', sa.Column('created_at', sa.TIMESTAMP(), nullable=True), schema='branding')
    op.add_column('white_label_configs', sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='branding')
    op.add_column('white_label_configs', sa.Column('updated_at', sa.TIMESTAMP(), nullable=True), schema='branding')
    op.add_column('white_label_configs', sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='branding')

def downgrade():
    op.drop_column('white_label_configs', 'created_at', schema='branding')
    op.drop_column('white_label_configs', 'created_by', schema='branding')
    op.drop_column('white_label_configs', 'updated_at', schema='branding')
    op.drop_column('white_label_configs', 'updated_by', schema='branding')
