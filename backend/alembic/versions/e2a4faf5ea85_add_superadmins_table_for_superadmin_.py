"""Add superadmins table for superadmin

Revision ID: e2a4faf5ea85
Revises: fece6b92db42
Create Date: 2026-01-28 05:48:57.376575

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2a4faf5ea85'
down_revision: Union[str, Sequence[str], None] = 'fece6b92db42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'superadmins',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('shared.users.id', ondelete='CASCADE'), primary_key=True),
        schema='auth'
    )

def downgrade():
    op.drop_table('superadmins', schema='auth')