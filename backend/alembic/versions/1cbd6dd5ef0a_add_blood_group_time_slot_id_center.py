"""Add blood_group, time_slot_id, center_holidays, center_operational_settings, center_time_slots, memberships, member_memberships

Revision ID: 1cbd6dd5ef0a
Revises: 91bb8e792807
Create Date: 2026-01-30 08:59:11.734048

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = '1cbd6dd5ef0a'
down_revision: Union[str, Sequence[str], None] = '91bb8e792807'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # Ensure membership schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS membership")

    # 1. Create center_time_slots table first (center schema)
    op.create_table(
        'center_time_slots',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=False),
        sa.Column('start_time', sa.String(), nullable=False),
        sa.Column('end_time', sa.String(), nullable=False),
        sa.Column('slot_capacity', sa.Integer(), nullable=False),
        schema='center'
    )

    # 2. Add blood_group and time_slot_id to members (auth schema)
    op.add_column('members', sa.Column('blood_group', sa.String(), nullable=True), schema='auth')
    op.add_column('members', sa.Column('time_slot_id', sa.UUID(as_uuid=True), nullable=True), schema='auth')
    op.create_foreign_key(
        'fk_members_time_slot_id',
        'members', 'center_time_slots',
        ['time_slot_id'], ['id'],
        source_schema='auth', referent_schema='center'
    )

    # 3. Create center_operational_settings (settings schema)
    op.create_table(
        'center_operational_settings',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('opening_time', sa.Time(), nullable=False),
        sa.Column('closing_time', sa.Time(), nullable=False),
        sa.Column('week_off_days', sa.ARRAY(
            sa.Enum(
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                name='week_day_enum',
                create_type=False,
                native_enum=False
            )
        ), nullable=False, default=[]),
        schema='settings'
    )

    # 4. Create center_holidays (settings schema)
    op.create_table(
        'center_holidays',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('holiday_name', sa.String(100), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('total_days', sa.Integer(), nullable=False),
        sa.Column('week_days', sa.ARRAY(
            sa.Enum(
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                name='holiday_week_day_enum',
                create_type=False,
                native_enum=False
            )
        ), nullable=False),
        schema='settings'
    )

    # 5. Create memberships (membership schema)
    op.create_table(
        'memberships',
        sa.Column('membership_id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=False),
        sa.Column('membership_name', sa.String(), nullable=False),
        sa.Column('membership_code', sa.String(), nullable=False, unique=True),
        sa.Column('description', sa.String()),
        sa.Column('duration', sa.String(), nullable=False),
        sa.Column('default_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.Enum(
            'active', 'inactive', 'suspended',
            name='statusenum',
            create_type=False,
            native_enum=False
        ), nullable=False, server_default='active'),
        schema='membership'
    )

    # 6. Create member_memberships (membership schema)
    op.create_table(
        'member_memberships',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('member_id', sa.UUID(as_uuid=True), sa.ForeignKey('auth.members.id'), nullable=False),
        sa.Column('membership_id', sa.UUID(as_uuid=True), sa.ForeignKey('membership.memberships.membership_id'), nullable=False),
        sa.Column('center_id', sa.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('tax_category_id', sa.UUID(as_uuid=True), sa.ForeignKey('settings.tax_categories.id'), nullable=True),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('auto_renewal_enabled', sa.Boolean(), default=False),
        sa.Column('membership_status', sa.Enum(
            'active', 'inactive', 'suspended',
            name='statusenum',
            create_type=False,
            native_enum=False
        ), nullable=False, server_default='active'),
        schema='membership'
    )

def downgrade():
    op.drop_constraint('fk_members_time_slot_id', 'members', schema='auth', type_='foreignkey')
    op.drop_column('members', 'blood_group', schema='auth')
    op.drop_column('members', 'time_slot_id', schema='auth')
    op.drop_table('center_time_slots', schema='center')
    op.drop_table('center_operational_settings', schema='settings')
    op.drop_table('center_holidays', schema='settings')
    op.drop_table('member_memberships', schema='membership')
    op.drop_table('memberships', schema='membership')