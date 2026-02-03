"""Add enums for weekdays

Revision ID: bc6a8c0f75d6
Revises: b0673a19b877
Create Date: 2026-02-03 12:52:25.092782

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc6a8c0f75d6'
down_revision: Union[str, Sequence[str], None] = 'b0673a19b877'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute(
        "CREATE TYPE week_day_enum AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')"
    )

def downgrade():
    op.execute("DROP TYPE week_day_enum")