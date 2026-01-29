"""add created_by and updated_by to center_onboarding_temp

Revision ID: c8eed60850a3
Revises: 6f3da20e22f1
Create Date: 2026-01-29 06:17:35.514633

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8eed60850a3'
down_revision: Union[str, Sequence[str], None] = '6f3da20e22f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    from sqlalchemy.dialects import postgresql
    op.add_column('center_onboarding_temp',
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )
    op.add_column('center_onboarding_temp',
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )

def downgrade():
    op.drop_column('center_onboarding_temp', 'created_by', schema='center')
    op.drop_column('center_onboarding_temp', 'updated_by', schema='center')