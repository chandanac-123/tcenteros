"""Add duration enum

Revision ID: 067357d5e808
Revises: 61a73df84960
Create Date: 2026-02-17 04:22:32.869009

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '067357d5e808'
down_revision: Union[str, Sequence[str], None] = '61a73df84960'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create the enum type in PostgreSQL
    op.execute("CREATE TYPE durationunitenum AS ENUM ('day', 'month', 'year');")
    # Alter the column to use the new enum type
    op.alter_column(
        'memberships',
        'duration_unit',
        schema='membership',
        type_=sa.Enum('day', 'month', 'year', name='durationunitenum'),
        postgresql_using="duration_unit::text::durationunitenum"
    )

def downgrade():
    # Revert the column to VARCHAR or TEXT (or previous type)
    op.alter_column(
        'memberships',
        'duration_unit',
        schema='membership',
        type_=sa.String(),
        postgresql_using="duration_unit::text"
    )
    # Drop the enum type
    op.execute("DROP TYPE durationunitenum;")
