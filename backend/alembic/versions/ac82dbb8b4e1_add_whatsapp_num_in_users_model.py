"""Add whatsapp num in users models

Revision ID: ac82dbb8b4e1
Revises: 23d212b66655
Create Date: 2026-02-23 10:48:54.365383

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ac82dbb8b4e1'
down_revision = '23d212b66655'
branch_labels = None
depends_on = None

def upgrade():
    # Remove whatsapp_number from auth.superadmins
    with op.batch_alter_table('superadmins', schema='auth') as batch_op:
        batch_op.drop_column('whatsapp_number')
    # Add whatsapp_number to shared.users
    with op.batch_alter_table('users', schema='shared') as batch_op:
        batch_op.add_column(sa.Column('whatsapp_number', sa.String(), nullable=True))

def downgrade():
    # Add whatsapp_number back to auth.superadmins
    with op.batch_alter_table('superadmins', schema='auth') as batch_op:
        batch_op.add_column(sa.Column('whatsapp_number', sa.String(), nullable=True))
    # Remove whatsapp_number from shared.users
    with op.batch_alter_table('users', schema='shared') as batch_op:
        batch_op.drop_column('whatsapp_number')