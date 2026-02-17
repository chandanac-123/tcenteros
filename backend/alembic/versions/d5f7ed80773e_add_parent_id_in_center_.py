"""Add parent id in center

Revision ID: d5f7ed80773e
Revises: 067357d5e808
Create Date: 2026-02-17 06:47:19.623663

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5f7ed80773e'
down_revision: Union[str, Sequence[str], None] = '067357d5e808'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        'centers',
        sa.Column('parent_center_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )
    op.create_foreign_key(
        'fk_centers_parent_center_id',
        'centers', 'centers',
        ['parent_center_id'], ['id'],
        source_schema='center',
        referent_schema='center',
        ondelete='SET NULL'
    )

def downgrade():
    op.drop_constraint('fk_centers_parent_center_id', 'centers', schema='center', type_='foreignkey')
    op.drop_column('centers', 'parent_center_id', schema='center')
