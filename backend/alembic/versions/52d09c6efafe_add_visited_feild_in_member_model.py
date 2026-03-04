"""Add visited feild in member models

Revision ID: 52d09c6efafe
Revises: af66c84c8113
Create Date: 2026-03-04 08:51:01.162869

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '52d09c6efafe'
down_revision = 'af66c84c8113'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'members',
        sa.Column('visited_date', sa.Date(), nullable=True),
        schema='auth'
    )

def downgrade():
    op.drop_column('members', 'visited_date', schema='auth')