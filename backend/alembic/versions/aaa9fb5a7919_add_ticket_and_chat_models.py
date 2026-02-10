"""Add ticket and chat model

Revision ID: aaa9fb5a7919
Revises: 53b5247b0d93
Create Date: 2026-02-10 11:12:14.876533

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = 'aaa9fb5a7919'
down_revision: Union[str, Sequence[str], None] = '53b5247b0d93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create the support schema if it doesn't exist
    op.execute("CREATE SCHEMA IF NOT EXISTS support")

    # Define the ticketstatus enum (do not explicitly create it, let create_table handle it)
    ticket_status_enum = sa.Enum('pending', 'open', 'assigned', 'closed', name='ticketstatus')

    op.create_table(
        'tickets',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('member_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('auth.members.id'), nullable=False),
        sa.Column('center_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id'), nullable=True),
        sa.Column('assigned_admin_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('auth.center_admins.id'), nullable=True),
        sa.Column('status', ticket_status_enum, nullable=False, server_default='pending'),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='support'
    )

    op.create_table(
        'ticket_messages',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('ticket_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('support.tickets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sender_role', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='support'
    )

def downgrade():
    op.drop_table('ticket_messages', schema='support')
    op.drop_table('tickets', schema='support')
    # Drop the enum type (only if it exists)
    try:
        ticket_status_enum = sa.Enum('pending', 'open', 'assigned', 'closed', name='ticketstatus')
        ticket_status_enum.drop(op.get_bind(), checkfirst=True)
    except Exception:
        pass