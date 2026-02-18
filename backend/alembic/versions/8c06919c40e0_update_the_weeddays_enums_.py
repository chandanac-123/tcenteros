"""update the weeddays enums

Revision ID: 8c06919c40e0
Revises: d269d12d3f2d
Create Date: 2026-02-18 05:50:03.109901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c06919c40e0'
down_revision: Union[str, Sequence[str], None] = 'd269d12d3f2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


old_enum = 'public.holiday_week_day_enum'
new_enum = 'public.holiday_week_day_enum_new'
table = 'center_holidays'
schema = 'settings'
column = 'week_days'

old_values = ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
new_values = tuple(v.lower() for v in old_values)

def upgrade():
    # 1. Create the new enum type in public schema
    op.execute(f"CREATE TYPE {new_enum} AS ENUM {new_values};")

    # 2. Add a temporary column with the new enum type
    op.execute(f'ALTER TABLE {schema}.{table} ADD COLUMN week_days_tmp {new_enum}[];')

    # 3. Copy and transform data to the new column
    op.execute(f"""
        UPDATE {schema}.{table}
        SET week_days_tmp = ARRAY(
            SELECT LOWER(day)::text::{new_enum}
            FROM unnest({column}) AS day
        );
    """)

    # 4. Drop the old column
    op.execute(f'ALTER TABLE {schema}.{table} DROP COLUMN {column};')

    # 5. Rename the new column to the original name
    op.execute(f'ALTER TABLE {schema}.{table} RENAME COLUMN week_days_tmp TO {column};')

    # 6. Drop the old enum type and rename the new one
    op.execute(f'DROP TYPE {old_enum};')
    op.execute(f'ALTER TYPE {new_enum} RENAME TO holiday_week_day_enum;')

def downgrade():
    # 1. Recreate the old enum type in public schema
    op.execute(f"CREATE TYPE public.holiday_week_day_enum_old AS ENUM {old_values};")

    # 2. Add a temporary column with the old enum type
    op.execute(f'ALTER TABLE {schema}.{table} ADD COLUMN week_days_tmp public.holiday_week_day_enum_old[];')

    # 3. Copy and transform data back to the old column
    op.execute(f"""
        UPDATE {schema}.{table}
        SET week_days_tmp = ARRAY(
            SELECT INITCAP(day)::text::public.holiday_week_day_enum_old
            FROM unnest({column}) AS day
        );
    """)

    # 4. Drop the current column
    op.execute(f'ALTER TABLE {schema}.{table} DROP COLUMN {column};')

    # 5. Rename the temp column back to the original name
    op.execute(f'ALTER TABLE {schema}.{table} RENAME COLUMN week_days_tmp TO {column};')

    # 6. Drop the new enum type and rename the old one back
    op.execute(f'DROP TYPE public.holiday_week_day_enum;')
    op.execute(f'ALTER TYPE public.holiday_week_day_enum_old RENAME TO holiday_week_day_enum;')