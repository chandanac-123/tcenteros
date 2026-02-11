"""Add FAQs model

Revision ID: 38940321f084
Revises: 57f68aa480db
Create Date: 2026-02-11 09:44:04.549215

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid


# revision identifiers, used by Alembic.
revision: str = '38940321f084'
down_revision: Union[str, Sequence[str], None] = '57f68aa480db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'faqs',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('question', sa.String, nullable=False),
        sa.Column('answer', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        schema='settings'
    )

def downgrade():
    op.drop_table('faqs', schema='settings')
