"""update the designation model

Revision ID: da1b7bd76f00
Revises: 9944a2804d12
Create Date: 2026-03-18 08:06:50.266498

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'da1b7bd76f00'
down_revision = '9944a2804d12'
branch_labels = None
depends_on = None

def upgrade():
    # Drop the old unique constraint on name
    op.drop_constraint('designations_name_key', 'designations', schema='settings', type_='unique')
    # Add new unique constraint on (center_id, name)
    op.create_unique_constraint(
        'uq_designation_center_name',
        'designations',
        ['center_id', 'name'],
        schema='settings'
    )

def downgrade():
    # Remove the new unique constraint
    op.drop_constraint('uq_designation_center_name', 'designations', schema='settings', type_='unique')
    # Restore the old unique constraint on name
    op.create_unique_constraint(
        'designations_name_key',
        'designations',
        ['name'],
        schema='settings'
    )