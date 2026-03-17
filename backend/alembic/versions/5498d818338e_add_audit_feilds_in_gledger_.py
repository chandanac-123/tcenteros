"""Add audit feilds in gledger

Revision ID: 5498d818338e
Revises: 31608b123b51
Create Date: 2026-03-17 09:51:02.361483

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5498d818338e'
down_revision = '31608b123b51'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('general_ledger', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='accounts')
    # Remove or comment out the line below if the column already exists
    # op.add_column('general_ledger', sa.Column('updated_by', sa.UUID(as_uuid=True), nullable=True), schema='accounts')

def downgrade():
    op.drop_column('general_ledger', 'updated_at', schema='accounts')
    op.drop_column('general_ledger', 'updated_by', schema='accounts')