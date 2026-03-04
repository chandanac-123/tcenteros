"""Add payrole feilds in employee

Revision ID: 1533544153df
Revises: 7dfb4750e0f5
Create Date: 2026-03-04 12:42:13.268758

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1533544153df'
down_revision = '7dfb4750e0f5'
branch_labels = None
depends_on = None

def upgrade():
    # Drop salary_structures table from payrole schema
    op.drop_table('salary_structures', schema='payrole')

    # Add salary_type and pay_cycle columns to employees table in auth schema
    op.add_column('employees', sa.Column('salary_type', sa.String(), nullable=True), schema='auth')
    op.add_column('employees', sa.Column('pay_cycle', sa.String(), nullable=True), schema='auth')

def downgrade():
    # Remove salary_type and pay_cycle columns from employees table
    op.drop_column('employees', 'salary_type', schema='auth')
    op.drop_column('employees', 'pay_cycle', schema='auth')

    # Recreate salary_structures table in payrole schema
    op.create_table(
        'salary_structures',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('designation_id', sa.UUID(as_uuid=True), sa.ForeignKey('settings.designations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('salary_type', sa.String(), nullable=True),
        sa.Column('pay_cycle', sa.String(), nullable=True),
        sa.Column('salary_amount', sa.Numeric(10, 2), nullable=False),
        schema='payrole'
    )