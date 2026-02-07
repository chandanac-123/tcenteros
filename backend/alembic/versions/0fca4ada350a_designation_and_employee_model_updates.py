"""Designation and Employee model update

Revision ID: 0fca4ada350a
Revises: 8df273f487b0
Create Date: 2026-02-07 05:45:39.334249

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0fca4ada350a'
down_revision: Union[str, Sequence[str], None] = '8df273f487b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add qualification to Employee
    op.add_column('employees',
        sa.Column('qualification', sa.String(), nullable=True),
        schema='auth'
    )
    # Add image_url to Designation
    op.add_column('designations',
        sa.Column('image_url', sa.String(), nullable=True),
        schema='settings'
    )


def downgrade():
    # Remove qualification from Employee
    op.drop_column('employees', 'qualification', schema='auth')
    # Remove image_url from Designation
    op.drop_column('designations', 'image_url', schema='settings')
