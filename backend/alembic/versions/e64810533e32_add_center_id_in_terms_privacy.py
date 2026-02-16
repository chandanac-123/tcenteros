"""Add center_id in terms_privacy_

Revision ID: e64810533e32
Revises: eb10f02c2c6b
Create Date: 2026-02-16 08:22:34.918537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e64810533e32'
down_revision: Union[str, Sequence[str], None] = 'eb10f02c2c6b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        'terms_privacy',
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=True),
        schema='settings'
    )
    op.create_foreign_key(
        'fk_terms_privacy_center_id_centers',
        'terms_privacy', 'centers',
        ['center_id'], ['id'],
        source_schema='settings',
        referent_schema='center',
        ondelete='SET NULL'
    )

def downgrade():
    op.drop_constraint(
        'fk_terms_privacy_center_id_centers',
        'terms_privacy',
        schema='settings',
        type_='foreignkey'
    )
    op.drop_column('terms_privacy', 'center_id', schema='settings')
