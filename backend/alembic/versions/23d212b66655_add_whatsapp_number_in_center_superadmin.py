"""Add whatsapp number in center and superadmin

Revision ID: 23d212b66655
Revises: 87a62b2c7696
Create Date: 2026-02-23 08:05:16.045011

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '23d212b66655'
down_revision = '87a62b2c7696'
branch_labels = None
depends_on = None

def upgrade():
    # Add whatsapp_number to auth.superadmins
    op.add_column('superadmins',
        sa.Column('whatsapp_number', sa.String(), nullable=True),
        schema='auth'
    )
    # Add whatsapp_number to center.centers
    op.add_column('centers',
        sa.Column('whatsapp_number', sa.String(), nullable=True),
        schema='center'
    ) 

def downgrade():
    # Remove whatsapp_number from auth.superadmins
    op.drop_column('superadmins', 'whatsapp_number', schema='auth')
    # Remove whatsapp_number from center.centers
    op.drop_column('centers', 'whatsapp_number', schema='center')