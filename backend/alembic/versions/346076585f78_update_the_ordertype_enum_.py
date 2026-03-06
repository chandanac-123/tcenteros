"""update the ordertype enum

Revision ID: 346076585f78
Revises: c35d696e3154
Create Date: 2026-03-06 09:38:40.143827

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '346076585f78'
down_revision = 'c35d696e3154'
branch_labels = None
depends_on = None



def upgrade() -> None:
    # Use a variable name unlikely to collide with catalog columns
    op.execute(
        r"""
DO $$
DECLARE
  v_typname text;
BEGIN
  SELECT t.typname INTO v_typname
  FROM pg_type t
  WHERE EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace cn ON c.relnamespace = cn.oid
    WHERE cn.nspname = 'billing'
      AND c.relname = 'payment_orders'
      AND a.attname = 'order_type'
      AND a.atttypid = t.oid
  );

  IF v_typname IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type tt ON e.enumtypid = tt.oid
      WHERE tt.typname = v_typname
        AND e.enumlabel = 'stock_purchase'
    ) THEN
      EXECUTE format('ALTER TYPE %I ADD VALUE %L', v_typname, 'stock_purchase');
    END IF;
  END IF;
END
$$;
"""
    )


def downgrade() -> None:
    # Removing an enum label in-place is non-trivial; leave downgrade as no-op.
    pass