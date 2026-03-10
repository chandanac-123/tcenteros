"""Add transactionsource enum

Revision ID: 981d548adad0
Revises: 5d227e3cbbc2
Create Date: 2026-03-10 09:53:53.484386

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '981d548adad0'
down_revision = '5d227e3cbbc2'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create the enum type in public schema
    transaction_source_enum = postgresql.ENUM(
        'local',
        'pos',
        'visit',
        'online',
        name='transactionsourceenum',
        schema='public',
        create_type=True
    )
    transaction_source_enum.create(op.get_bind(), checkfirst=True)


def downgrade() -> None:
    # Drop the enum type
    transaction_source_enum = postgresql.ENUM(
        'local',
        'pos',
        'visit',
        'online',
        name='transactionsourceenum',
        schema='public'
    )
    transaction_source_enum.drop(op.get_bind(), checkfirst=True)