"""Add payrole record models

Revision ID: 9d13d999711d
Revises: d29650538aff
Create Date: 2026-03-16 10:56:58.997315

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid


# revision identifiers, used by Alembic.
revision = '9d13d999711d'
down_revision = 'd29650538aff'
branch_labels = None
depends_on = None


def upgrade():
    # Create PayrollStatus enum type in public schema
    payroll_status_enum = postgresql.ENUM(
        'pending', 'processing', 'paid', 'failed', 'cancelled',
        name='payrollstatus',
        create_type=True
    )
    payroll_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Create payroll_records table in payrole schema
    op.create_table(
        'payroll_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('center_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('payroll_month', sa.Integer(), nullable=False),
        sa.Column('payroll_year', sa.Integer(), nullable=False),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('gross_salary', sa.Numeric(10, 2), nullable=False),
        sa.Column('tds_amount', sa.Numeric(10, 2), server_default='0.00'),
        sa.Column('other_deductions', sa.Numeric(10, 2), server_default='0.00'),
        sa.Column('total_deductions', sa.Numeric(10, 2), server_default='0.00'),
        sa.Column('net_salary', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_method', postgresql.ENUM(
            'cash', 'bank_transfer', 'upi', 'card', 'other',
            name='payroll_payment_method',
            create_type=False  # Already exists
        ), nullable=True),
        sa.Column('status', postgresql.ENUM(
            'pending', 'processing', 'paid', 'failed', 'cancelled',
            name='payrollstatus',
            create_type=False  # Already created above
        ), nullable=False, server_default='pending', index=True),
        sa.Column('paid_date', sa.Date(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['employee_id'], ['shared.users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['center_id'], ['center.centers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['shared.users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['updated_by'], ['shared.users.id'], ondelete='SET NULL'),
        schema='payrole'
    )
    
    # Create indexes
    op.create_index(
        'ix_payroll_records_employee_id',
        'payroll_records',
        ['employee_id'],
        unique=False,
        schema='payrole'
    )
    op.create_index(
        'ix_payroll_records_center_id',
        'payroll_records',
        ['center_id'],
        unique=False,
        schema='payrole'
    )
    op.create_index(
        'ix_payroll_records_status',
        'payroll_records',
        ['status'],
        unique=False,
        schema='payrole'
    )


def downgrade():
    # Drop table
    op.drop_table('payroll_records', schema='payrole')
    
    # Drop PayrollStatus enum
    payroll_status_enum = postgresql.ENUM(
        'pending', 'processing', 'paid', 'failed', 'cancelled',
        name='payrollstatus'
    )
    payroll_status_enum.drop(op.get_bind(), checkfirst=True)