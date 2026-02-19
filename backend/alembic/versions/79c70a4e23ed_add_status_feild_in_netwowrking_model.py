"""Add status feild in netwowrking models

Revision ID: 79c70a4e23ed
Revises: c2b1d4f137c1
Create Date: 2026-02-19 11:32:00.074906

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '79c70a4e23ed'
down_revision = 'c2b1d4f137c1'
branch_labels = None
depends_on = None

def upgrade():
    # Create the enum type in the public schema
    op.execute("CREATE TYPE public.networking_status_enum AS ENUM ('pending', 'approved', 'paid')")
    # Add the column to the table
    op.add_column(
        'user_center_memberships',
        sa.Column(
            'network_status',
            sa.Enum('pending', 'approved', 'paid', name='networking_status_enum', schema='public'),
            nullable=False,
            server_default='pending'
        ),
        schema='auth'
    )

def downgrade():
    op.drop_column('user_center_memberships', 'network_status', schema='auth')
    op.execute("DROP TYPE public.networking_status_enum")