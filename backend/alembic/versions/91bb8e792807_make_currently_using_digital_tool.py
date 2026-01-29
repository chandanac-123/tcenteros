"""Make currently_using_digital_tool JSON

Revision ID: 91bb8e792807
Revises: 7fd90cc490e2
Create Date: 2026-01-29 11:47:27.266206

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '91bb8e792807'
down_revision: Union[str, Sequence[str], None] = '7fd90cc490e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Convert plain text to valid JSON strings in centers
    op.execute("""
        UPDATE center.centers
        SET currently_using_digital_tool = '"' || currently_using_digital_tool || '"'
        WHERE currently_using_digital_tool IS NOT NULL
          AND left(currently_using_digital_tool, 1) != '['
          AND left(currently_using_digital_tool, 1) != '{'
          AND left(currently_using_digital_tool, 1) != '"';
    """)
    # Convert plain text to valid JSON strings in center_onboarding_temp
    op.execute("""
        UPDATE center.center_onboarding_temp
        SET currently_using_digital_tool = '"' || currently_using_digital_tool || '"'
        WHERE currently_using_digital_tool IS NOT NULL
          AND left(currently_using_digital_tool, 1) != '['
          AND left(currently_using_digital_tool, 1) != '{'
          AND left(currently_using_digital_tool, 1) != '"';
    """)
    # Now alter the column type to JSON
    op.execute("""
        ALTER TABLE center.centers
        ALTER COLUMN currently_using_digital_tool
        TYPE JSON
        USING currently_using_digital_tool::json
    """)
    op.execute("""
        ALTER TABLE center.center_onboarding_temp
        ALTER COLUMN currently_using_digital_tool
        TYPE JSON
        USING currently_using_digital_tool::json
    """)

def downgrade():
    # Convert JSON back to text
    op.execute("""
        ALTER TABLE center.centers
        ALTER COLUMN currently_using_digital_tool
        TYPE VARCHAR
        USING currently_using_digital_tool::text
    """)
    op.execute("""
        ALTER TABLE center.center_onboarding_temp
        ALTER COLUMN currently_using_digital_tool
        TYPE VARCHAR
        USING currently_using_digital_tool::text
    """)