"""Add payrole model

Revision ID: 7dfb4750e0f5
Revises: 52d09c6efafe
Create Date: 2026-03-04 11:53:39.374221

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7dfb4750e0f5'
down_revision = '52d09c6efafe'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS payrole")
    op.create_table(
        'salary_structures',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('designation_id', sa.UUID(as_uuid=True), sa.ForeignKey('settings.designations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('salary_type', sa.String(), nullable=False),
        sa.Column('pay_cycle', sa.String(), nullable=False),
        sa.Column('salary_amount', sa.Numeric(10, 2), nullable=False),
        schema='payrole'
    )

def downgrade():
    op.drop_table('salary_structures', schema='payrole')
    op.execute("DROP SCHEMA IF EXISTS payrole CASCADE")