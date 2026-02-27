"""Add center_image in center models

Revision ID: cea26885733a
Revises: 14bdc97a9ff6
Create Date: 2026-02-27 05:35:45.396710

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cea26885733a'
down_revision = '14bdc97a9ff6'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'centers',
        sa.Column('center_image', sa.String(), nullable=True),
        schema='center'
    )

def downgrade():
    op.drop_column('centers', 'center_image', schema='center')