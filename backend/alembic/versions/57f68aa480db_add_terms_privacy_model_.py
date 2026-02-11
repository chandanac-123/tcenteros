"""Add terms_privacy model

Revision ID: 57f68aa480db
Revises: 40da07b03709
Create Date: 2026-02-11 09:12:49.132145

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = '57f68aa480db'
down_revision: Union[str, Sequence[str], None] = '40da07b03709'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'terms_privacy',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String, nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        schema='settings'
    )

def downgrade():
    op.drop_table('terms_privacy', schema='settings')
