"""Add field updated_at in ticket msg models

Revision ID: 3ebf9135c93a
Revises: aaa9fb5a7919
Create Date: 2026-02-11 05:01:44.287597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

SCHEMA = 'support'

# revision identifiers, used by Alembic.
revision: str = '3ebf9135c93a'
down_revision: Union[str, Sequence[str], None] = 'aaa9fb5a7919'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        'ticket_messages',
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
        schema=SCHEMA
    )

def downgrade():
    op.drop_column('ticket_messages', 'updated_at', schema=SCHEMA)
