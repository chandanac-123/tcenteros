"""Add joing date feild in employee

Revision ID: 36b2dfb0baf7
Revises: 55e2ef258fed
Create Date: 2026-02-09 08:30:09.751727

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '36b2dfb0baf7'
down_revision: Union[str, Sequence[str], None] = '55e2ef258fed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('employees',
        sa.Column('joining_date', sa.DateTime(), nullable=True),
        schema='auth'
    )

def downgrade():
    op.drop_column('employees', 'joining_date', schema='auth')