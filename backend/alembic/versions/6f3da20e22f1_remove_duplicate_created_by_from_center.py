"""remove duplicate created_by from center_onboarding_temp

Revision ID: 6f3da20e22f1
Revises: cd15ab61b380
Create Date: 2026-01-29 05:57:36.561954

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f3da20e22f1'
down_revision: Union[str, Sequence[str], None] = 'cd15ab61b380'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_column('center_onboarding_temp', 'created_by', schema='center')

def downgrade():
    from sqlalchemy.dialects import postgresql
    op.add_column('center_onboarding_temp',
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )