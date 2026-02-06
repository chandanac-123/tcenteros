"""Add changes for networkings

Revision ID: 30793b8790c7
Revises: 796a1078f26a
Create Date: 2026-02-06 10:32:26.511384

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '30793b8790c7'
down_revision: Union[str, Sequence[str], None] = '796a1078f26a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Add network_center_id to auth.members
    op.add_column(
        'members',
        sa.Column('network_center_id', postgresql.UUID(as_uuid=True), nullable=True),
        schema='auth'
    )
    # 2. Add networking_amount to center.centers
    op.add_column(
        'centers',
        sa.Column('networking_amount', sa.Numeric(10, 2), nullable=True),
        schema='center'
    )
    # 3. Set default of network_eligible to True in auth.members
    op.alter_column(
        'members',
        'network_eligible',
        schema='auth',
        server_default=sa.text('true'),
        existing_type=sa.Boolean(),
    )

def downgrade():
    # 1. Remove network_center_id from auth.members
    op.drop_column('members', 'network_center_id', schema='auth')
    # 2. Remove networking_amount from center.centers
    op.drop_column('centers', 'networking_amount', schema='center')
    # 3. Revert default of network_eligible to None (or previous default)
    op.alter_column(
        'members',
        'network_eligible',
        schema='auth',
        server_default=None,
        existing_type=sa.Boolean(),
    )
