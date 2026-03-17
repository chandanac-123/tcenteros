"""Add audit feilds in taxledger

Revision ID: 9944a2804d12
Revises: 5498d818338e
Create Date: 2026-03-17 10:03:44.707335

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9944a2804d12'
down_revision = '5498d818338e'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('tax_ledger', sa.Column('updated_at', sa.DateTime(), nullable=True), schema='accounts')
    # Remove or comment out the line below if the column already exists
    # op.add_column('tax_ledger', sa.Column('updated_by', sa.UUID(as_uuid=True), nullable=True), schema='accounts')

def downgrade():
    op.drop_column('tax_ledger', 'updated_at', schema='accounts')
    op.drop_column('tax_ledger', 'updated_by', schema='accounts')