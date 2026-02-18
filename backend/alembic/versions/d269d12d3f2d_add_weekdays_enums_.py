"""Add weekdays enums

Revision ID: d269d12d3f2d
Revises: f3bce491a42f
Create Date: 2026-02-18 05:29:47.374804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd269d12d3f2d'
down_revision: Union[str, Sequence[str], None] = 'f3bce491a42f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'holiday_week_day_enum') THEN
                CREATE TYPE holiday_week_day_enum AS ENUM (
                    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                );
            END IF;
        END$$;
    """)

def downgrade():
    op.execute("DROP TYPE IF EXISTS holiday_week_day_enum;")