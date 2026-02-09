"""add fullname in employee and member

Revision ID: bafcef9f5f7a
Revises: d13cff322550
Create Date: 2026-02-09 04:12:32.115310

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bafcef9f5f7a'
down_revision: Union[str, Sequence[str], None] = 'd13cff322550'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('employees',
        sa.Column('full_name', sa.String(), nullable=True),
        schema='auth'
    )
    op.add_column('members',
        sa.Column('full_name', sa.String(), nullable=True),
        schema='auth'
    )

def downgrade():
    op.drop_column('employees', 'full_name', schema='auth')
    op.drop_column('members', 'full_name', schema='auth')