"""Add platform_branch_settings

Revision ID: f4bc5acdc72c
Revises: be92a18820c0
Create Date: 2026-02-25 10:47:23.140776

"""
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = 'f4bc5acdc72c'
down_revision = 'be92a18820c0'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'platform_branch_settings',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('key', sa.String(), unique=True, nullable=False),
        sa.Column('value', sa.String(), nullable=False),
        schema='platform'
    )

def downgrade():
    op.drop_table('platform_branch_settings', schema='platform')