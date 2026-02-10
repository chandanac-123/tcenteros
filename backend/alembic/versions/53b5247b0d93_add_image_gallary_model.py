"""Add image gallary models

Revision ID: 53b5247b0d93
Revises: 41c048f47ab2
Create Date: 2026-02-10 08:33:44.127525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid


# revision identifiers, used by Alembic.
revision: str = '53b5247b0d93'
down_revision: Union[str, Sequence[str], None] = '41c048f47ab2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'center_gallery_images',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('center_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('center.centers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        schema='center'
    )

def downgrade():
    op.drop_table('center_gallery_images', schema='center')
