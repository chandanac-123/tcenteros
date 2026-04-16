"""create_payroll_payment_method_enum

Revision ID: d29650538aff
Revises: b3646ff39a37
Create Date: 2026-03-16 06:20:55.493719

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd29650538aff'
down_revision = 'b3646ff39a37'
branch_labels = None
depends_on = None

def upgrade():
    # Check if enum exists, create only if it doesn't
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_payment_method') THEN
                CREATE TYPE payroll_payment_method AS ENUM ('cash', 'bank_transfer', 'upi', 'card', 'other');
            END IF;
        END $$;
    """)

def downgrade():
    op.execute("DROP TYPE IF EXISTS payroll_payment_method CASCADE")