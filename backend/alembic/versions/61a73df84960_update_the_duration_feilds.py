"""Update the duration feilds in membershiplan

Revision ID: 61a73df84960
Revises: e64810533e32
Create Date: 2026-02-16 12:06:31.850432

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import enum

# revision identifiers, used by Alembic.
revision: str = '61a73df84960'
down_revision: Union[str, Sequence[str], None] = 'e64810533e32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define the new Enum for duration_unit
class DurationUnitEnum(str, enum.Enum):
    month = "month"
    year = "year"

def upgrade():
    # Create the ENUM type first
    duration_unit_enum = sa.Enum('month', 'year', name='durationunitenum', schema='membership')
    duration_unit_enum.create(op.get_bind(), checkfirst=True)

    # Add new columns as nullable
    op.add_column('memberships', sa.Column('duration_count', sa.Integer(), nullable=True), schema='membership')
    op.add_column('memberships', sa.Column('duration_unit', duration_unit_enum, nullable=True), schema='membership')

    # Data migration: parse old 'duration' and fill new columns
    # Cast the string to ENUM type
    op.execute("""
        UPDATE membership.memberships
        SET duration_count = CAST(split_part(duration, '-', 1) AS INTEGER),
            duration_unit = CASE
                WHEN lower(duration) LIKE '%month%' THEN 'month'::membership.durationunitenum
                WHEN lower(duration) LIKE '%year%' THEN 'year'::membership.durationunitenum
                ELSE NULL
            END
    """)

    # Make new columns non-nullable
    op.alter_column('memberships', 'duration_count', nullable=False, schema='membership')
    op.alter_column('memberships', 'duration_unit', nullable=False, schema='membership')

    # Drop old column
    op.drop_column('memberships', 'duration', schema='membership')

def downgrade():
    # Add old column back
    op.add_column('memberships', sa.Column('duration', sa.String(), nullable=False), schema='membership')
    # Remove new columns
    op.drop_column('memberships', 'duration_count', schema='membership')
    op.drop_column('memberships', 'duration_unit', schema='membership')
    # Drop Enum type
    duration_unit_enum = sa.Enum('month', 'year', name='durationunitenum', schema='membership')
    duration_unit_enum.drop(op.get_bind(), checkfirst=True)