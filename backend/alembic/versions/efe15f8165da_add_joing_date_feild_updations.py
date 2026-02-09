"""Add joing date feild updation

Revision ID: efe15f8165da
Revises: 36b2dfb0baf7
Create Date: 2026-02-09 08:55:35.273049

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'efe15f8165da'
down_revision: Union[str, Sequence[str], None] = '36b2dfb0baf7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column(
        'employees',
        'joining_date',
        type_=sa.Date(),
        existing_type=sa.DateTime(),
        schema='auth'
    )

def downgrade():
    op.alter_column(
        'employees',
        'joining_date',
        type_=sa.DateTime(),
        existing_type=sa.Date(),
        schema='auth'
    )
