"""Add center_id in sku models

Revision ID: c52b353b5702
Revises: 7b3b45f80bae
Create Date: 2026-03-05 12:09:45.835690

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c52b353b5702'
down_revision = '7b3b45f80bae'
branch_labels = None
depends_on = None


def upgrade():

    # 1️⃣ Add column (temporarily nullable)
    op.add_column(
        "sku",
        sa.Column("center_id", postgresql.UUID(as_uuid=True), nullable=True),
        schema="shared"
    )

    # 2️⃣ Create foreign key
    op.create_foreign_key(
        "fk_sku_center",
        "sku",
        "centers",
        ["center_id"],
        ["id"],
        source_schema="shared",
        referent_schema="center",
    )

    # 3️⃣ If needed you can update existing rows here
    # Example:
    # op.execute("UPDATE shared.sku SET center_id = '<some-center-id>'")

    # 4️⃣ Make column NOT NULL
    op.alter_column(
        "sku",
        "center_id",
        nullable=False,
        schema="shared"
    )


def downgrade():

    op.drop_constraint(
        "fk_sku_center",
        "sku",
        schema="shared",
        type_="foreignkey"
    )

    op.drop_column(
        "sku",
        "center_id",
        schema="shared"
    )