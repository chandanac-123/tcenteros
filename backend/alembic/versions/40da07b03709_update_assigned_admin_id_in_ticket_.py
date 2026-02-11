"""update assigned_admin_id in ticket

Revision ID: 40da07b03709
Revises: 3ebf9135c93a
Create Date: 2026-02-11 05:46:12.442830

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '40da07b03709'
down_revision: Union[str, Sequence[str], None] = '3ebf9135c93a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    with op.batch_alter_table('tickets', schema='support') as batch_op:
        batch_op.drop_constraint('tickets_assigned_admin_id_fkey', type_='foreignkey')
        batch_op.alter_column('assigned_admin_id', type_=sa.dialects.postgresql.UUID(as_uuid=True), nullable=True)
        batch_op.add_column(sa.Column('assigned_admin_role', sa.String(), nullable=True))

def downgrade():
    with op.batch_alter_table('tickets', schema='support') as batch_op:
        batch_op.drop_column('assigned_admin_role')
        # You may need to recreate the FK if downgrading
        batch_op.create_foreign_key(
            'tickets_assigned_admin_id_fkey',
            'center_admins',
            ['assigned_admin_id'],
            ['id'],
            source_schema='support',
            referent_schema='auth'
        )
