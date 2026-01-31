"""Add memberstaus enum

Revision ID: df48105be204
Revises: aacd48d92fbe
Create Date: 2026-01-31 08:10:33.284384

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df48105be204'
down_revision: Union[str, Sequence[str], None] = 'aacd48d92fbe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define the new enum type
member_status_enum = sa.Enum('member', 'guest', 'lead', 'visitor', name='memberstatusenum')

def upgrade():
    # Create the enum type in the DB
    member_status_enum.create(op.get_bind(), checkfirst=True)
    # Add the new column to the members table
    op.add_column('members', sa.Column('member_status', member_status_enum, nullable=False, server_default='member'), schema='auth')

def downgrade():
    # Remove the column
    op.drop_column('members', 'member_status', schema='auth')
    # Drop the enum type
    member_status_enum.drop(op.get_bind(), checkfirst=True)
