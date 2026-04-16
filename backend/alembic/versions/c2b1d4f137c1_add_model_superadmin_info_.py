"""Add model superadmin_info

Revision ID: c2b1d4f137c1
Revises: 8c06919c40e0
Create Date: 2026-02-19 08:52:57.969942

"""
from alembic import op
import sqlalchemy as sa
import uuid


# revision identifiers, used by Alembic.
revision = 'c2b1d4f137c1'
down_revision = '8c06919c40e0'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'superadmin_info',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('searched_location', sa.String(), nullable=False),
        sa.Column('searched_by', sa.String(), nullable=True),
        sa.Column('searched_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        schema='shared'
    )

def downgrade():
    op.drop_table('superadmin_info', schema='shared')