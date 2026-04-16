"""Add branch count feild

Revision ID: c43a438fd31c
Revises: f4bc5acdc72c
Create Date: 2026-02-25 11:34:15.117029

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c43a438fd31c'
down_revision = 'f4bc5acdc72c'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'centers',
        sa.Column('branch_count', sa.Integer(), nullable=False, server_default='0'),
        schema='center'
    )

def downgrade():
    op.drop_column('centers', 'branch_count', schema='center')