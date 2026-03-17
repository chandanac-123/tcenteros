"""Add audit updated_at account

Revision ID: 31608b123b51
Revises: 2a6a98a0bb5f
Create Date: 2026-03-17 09:45:14.611390

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '31608b123b51'
down_revision = '2a6a98a0bb5f'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('journal_entry_lines', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='accounts')
    # Remove or comment out the line below if the column already exists
    # op.add_column('journal_entry_lines', sa.Column('updated_by', sa.UUID(as_uuid=True), nullable=True), schema='accounts')

def downgrade():
    op.drop_column('journal_entry_lines', 'updated_at', schema='accounts')
    op.drop_column('journal_entry_lines', 'updated_by', schema='accounts')