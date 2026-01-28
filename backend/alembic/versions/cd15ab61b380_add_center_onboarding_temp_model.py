"""add center_onboarding_temp model to center schema

Revision ID: cd15ab61b380
Revises: 0f54c425217d
Create Date: 2026-01-28 17:17:48.278659

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'cd15ab61b380'
down_revision: Union[str, Sequence[str], None] = '0f54c425217d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'center_onboarding_temp',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False),
        sa.Column('center_name', sa.String(), nullable=False),
        sa.Column('contact_person', sa.String(), nullable=False),
        sa.Column('center_email', sa.String(), nullable=False),
        sa.Column('center_phone', sa.String(), nullable=False),
        sa.Column('city', sa.String(), nullable=False),
        sa.Column('center_category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('kind_of_center', sa.JSON(), nullable=True),
        sa.Column('members_count', sa.Integer(), server_default="0", nullable=False),
        sa.Column('trainer_count', sa.Integer(), server_default="0", nullable=False),
        sa.Column('currently_using_digital_tool', sa.String(), nullable=True),
        sa.Column('marketing_platform', sa.JSON(), nullable=True),
        sa.Column('platform_feature_ids', sa.JSON(), nullable=False),
        sa.Column('is_terms_and_conditions', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('calculated_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        schema='center'
    )

def downgrade():
    op.drop_table('center_onboarding_temp', schema='center')