"""Make SKUCategory name non-unique, add unique constraint on (center_id, name)

Revision ID: 2419ac91d32b
Revises: 952fd4492914
Create Date: 2026-03-30 04:19:07.084481

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2419ac91d32b'
down_revision = '952fd4492914'
branch_labels = None
depends_on = None

def upgrade():
    # Drop the old unique constraint on name
    op.drop_constraint('sku_categories_name_key', 'sku_categories', schema='settings', type_='unique')
    # Add a new unique constraint on (center_id, name)
    op.create_unique_constraint(
        'uq_sku_category_center_name',
        'sku_categories',
        ['center_id', 'name'],
        schema='settings'
    )

def downgrade():
    # Drop the new unique constraint
    op.drop_constraint('uq_sku_category_center_name', 'sku_categories', schema='settings', type_='unique')
    # Re-add the old unique constraint on name
    op.create_unique_constraint(
        'sku_categories_name_key',
        'sku_categories',
        ['name'],
        schema='settings'
    )