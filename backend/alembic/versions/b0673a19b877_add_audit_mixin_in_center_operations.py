"""Add audit_mixin in center operation

Revision ID: b0673a19b877
Revises: 5756b837a9c6
Create Date: 2026-02-03 12:41:17.015202

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0673a19b877'
down_revision: Union[str, Sequence[str], None] = '5756b837a9c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('center_operational_settings', sa.Column('created_at', sa.DateTime(), nullable=True), schema='settings')
    op.add_column('center_operational_settings', sa.Column('created_by', sa.UUID(as_uuid=True), nullable=True), schema='settings')
    op.add_column('center_operational_settings', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='settings')
    op.add_column('center_operational_settings', sa.Column('updated_by', sa.UUID(as_uuid=True), nullable=True), schema='settings')

def downgrade():
    op.drop_column('center_operational_settings', 'created_at', schema='settings')
    op.drop_column('center_operational_settings', 'created_by', schema='settings')
    op.drop_column('center_operational_settings', 'updated_at', schema='settings')
    op.drop_column('center_operational_settings', 'updated_by', schema='settings')
