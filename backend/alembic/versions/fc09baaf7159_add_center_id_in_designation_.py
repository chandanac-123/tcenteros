"""Add center_id in designation

Revision ID: fc09baaf7159
Revises: 79c70a4e23ed
Create Date: 2026-02-21 05:55:26.083899

"""
from alembic import op
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fc09baaf7159'
down_revision = '79c70a4e23ed'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('designations', sa.Column('center_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True), schema='settings')
    op.create_foreign_key(
        'fk_designation_center',
        'designations', 'centers',
        ['center_id'], ['id'],
        source_schema='settings',
        referent_schema='center'
    )

def downgrade():
    op.drop_constraint('fk_designation_center', 'designations', schema='settings')
    op.drop_column('designations', 'center_id', schema='settings')