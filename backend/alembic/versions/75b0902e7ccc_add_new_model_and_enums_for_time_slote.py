"""Add new model and enums for time slote request

Revision ID: 75b0902e7ccc
Revises: df48105be204
Create Date: 2026-02-02 06:03:40.496419

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '75b0902e7ccc'
down_revision: Union[str, Sequence[str], None] = 'df48105be204'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Enum types
time_slot_change_type = sa.Enum('permanent', 'temporary', name='timeslotchangetype')
time_slot_change_status = sa.Enum('pending', 'approved', 'rejected', name='timeslotchangestatus')

def upgrade():
    # Create enums using raw SQL
    # op.execute("CREATE TYPE timeslotchangetype AS ENUM ('permanent', 'temporary')")
    # op.execute("CREATE TYPE timeslotchangestatus AS ENUM ('pending', 'approved', 'rejected')")

    op.create_table(
        'time_slot_change_requests',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True),
        sa.Column('member_id', sa.UUID(as_uuid=True), sa.ForeignKey('auth.members.id'), nullable=False),
        sa.Column('old_time_slot_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.center_time_slots.id'), nullable=True),
        sa.Column('new_time_slot_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.center_time_slots.id'), nullable=True),
        sa.Column('change_type', sa.Enum('permanent', 'temporary', name='timeslotchangetype'), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', name='timeslotchangestatus'), nullable=False, server_default='pending'),
        sa.Column('approved_by', sa.UUID(as_uuid=True), sa.ForeignKey('auth.center_admins.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.UUID(as_uuid=True), nullable=True),
        schema='membership'
    )

def downgrade():
    op.drop_table('time_slot_change_requests', schema='membership')
    op.execute('DROP TYPE timeslotchangetype')
    op.execute('DROP TYPE timeslotchangestatus')
