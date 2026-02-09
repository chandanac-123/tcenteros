"""Add address in member and employee

Revision ID: 55e2ef258fed
Revises: bafcef9f5f7a
Create Date: 2026-02-09 06:48:36.917927

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '55e2ef258fed'
down_revision: Union[str, Sequence[str], None] = 'bafcef9f5f7a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('employees',
        sa.Column('address_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='auth'
    )
    op.create_foreign_key(
        'fk_employees_address_id_address',
        'employees', 'address',
        ['address_id'], ['id'],
        source_schema='auth',
        referent_schema='settings',
    )
    op.add_column('members',
        sa.Column('address_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='auth'
    )
    op.create_foreign_key(
        'fk_members_address_id_address',
        'members', 'address',
        ['address_id'], ['id'],
        source_schema='auth',
        referent_schema='settings',
    )

def downgrade():
    op.drop_constraint('fk_employees_address_id_address', 'employees', schema='auth', type_='foreignkey')
    op.drop_column('employees', 'address_id', schema='auth')
    op.drop_constraint('fk_members_address_id_address', 'members', schema='auth', type_='foreignkey')
    op.drop_column('members', 'address_id', schema='auth')
