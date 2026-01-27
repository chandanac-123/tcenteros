"""Add Employee, Member, and WhiteLabelConfig models

Revision ID: 107312f76b72
Revises: e533a354d52f
Create Date: 2026-01-27 11:45:27.886835

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = '107312f76b72'
down_revision: Union[str, Sequence[str], None] = 'e533a354d52f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():

    # Ensure branding schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS branding")
    
    # Employee table
    op.create_table(
        'employees',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('shared.users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('center_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=False),
        sa.Column('designation_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('settings.designations.id'), nullable=True),
        sa.Column('specialization', sa.String(), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=True),
        sa.Column('salary', sa.Numeric(10, 2), nullable=True),
        sa.Column('attendance_marking_allowed', sa.Boolean(), nullable=False, default=False),
        schema='auth'
    )

    # Member table
    op.create_table(
        'members',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('shared.users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('home_center_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('blocked_reason', sa.String(), nullable=True),
        sa.Column('network_eligible', sa.Boolean(), nullable=False, default=True),
        sa.Column('last_login_device', sa.String(), nullable=True),
        schema='auth'
    )

    # WhiteLabelConfig table
    op.create_table(
        'white_label_configs',
        sa.Column('white_label_id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('center_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=False),
        sa.Column('app_name', sa.String(), nullable=False),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('primary_color', sa.String(), nullable=True),
        sa.Column('secondary_color', sa.String(), nullable=True),
        sa.Column('custom_domain', sa.String(), nullable=True),
        sa.Column('status', sa.dialects.postgresql.ENUM(
            'active', 'inactive', 'suspended',
            name='statusenum',
            create_type=False
        ), nullable=False, server_default='active'),
        schema='branding'
    )

def downgrade():
    op.drop_table('employees', schema='auth')
    op.drop_table('members', schema='auth')
    op.drop_table('white_label_configs', schema='branding')