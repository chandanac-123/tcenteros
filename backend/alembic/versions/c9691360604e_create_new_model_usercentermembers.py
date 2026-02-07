"""create new model usercentermember

Revision ID: c9691360604e
Revises: 0fca4ada350a
Create Date: 2026-02-07 09:19:01.262734

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = 'c9691360604e'
down_revision: Union[str, Sequence[str], None] = '0fca4ada350a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # 1. Add network_member to member_status_enum if it exists, otherwise do nothing
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status_enum') THEN
                BEGIN
                    -- Add value only if it does not exist
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_enum
                        WHERE enumlabel = 'network_member'
                        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'member_status_enum')
                    ) THEN
                        ALTER TYPE member_status_enum ADD VALUE 'network_member';
                    END IF;
                END;
            END IF;
        END$$;
    """)

    # 2. Create user_center_memberships table
    op.create_table(
        'user_center_memberships',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('shared.users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('center_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('time_slot_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.center_time_slots.id'), nullable=True),
        sa.Column('member_status', sa.Enum('member', 'guest', 'lead', 'visitor', 'network_member', name='member_status_enum'), nullable=False, server_default='member'),
        sa.Column('network_eligible', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        schema='auth'
    )

def downgrade():
    op.drop_table('user_center_memberships', schema='auth')
    # Note: Enum value removal is not supported in PostgreSQL, so downgrade does not remove 'network_member' from enum.