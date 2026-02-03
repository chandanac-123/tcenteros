"""Add attendance

Revision ID: 5756b837a9c6
Revises: 5aa969a74fb1
Create Date: 2026-02-03 11:40:43.383838

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = '5756b837a9c6'
down_revision: Union[str, Sequence[str], None] = '5aa969a74fb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # 1. Add attendance_allowed_radius_meters to center_operational_settings
    op.add_column(
        'center_operational_settings',
        sa.Column('attendance_allowed_radius_meters', sa.Integer(), nullable=True, server_default='5'),
        schema='settings'
    )

    # 2. Ensure the attendance schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS attendance")

    # 3. Create attendances table
    op.create_table(
        'attendances',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', sa.UUID(as_uuid=True), sa.ForeignKey('shared.users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False, index=True),
        sa.Column('check_in_time', sa.DateTime(), nullable=True),
        sa.Column('check_in_latitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('check_in_longitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('check_in_location_valid', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('check_out_time', sa.DateTime(), nullable=True),
        sa.Column('check_out_latitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('check_out_longitude', sa.Numeric(9, 6), nullable=True),
        sa.Column('check_out_location_valid', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('status', sa.Enum('present', 'absent', 'holiday', name='attendancestatus', create_type=False), nullable=False, server_default='absent'),
        sa.Column('remarks', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.UUID(as_uuid=True), nullable=True),
        schema='attendance'
    )

def downgrade():
    op.drop_table('attendances', schema='attendance')
    op.drop_column('center_operational_settings', 'attendance_allowed_radius_meters', schema='settings')