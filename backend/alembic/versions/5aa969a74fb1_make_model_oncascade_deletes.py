"""make model oncascade delete

Revision ID: 5aa969a74fb1
Revises: 43d5fb7b217f
Create Date: 2026-02-03 05:12:31.229461

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5aa969a74fb1'
down_revision: Union[str, Sequence[str], None] = '43d5fb7b217f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Drop the old constraint
    op.drop_constraint(
        'member_memberships_membership_id_fkey',
        'member_memberships',
        schema='membership',
        type_='foreignkey'
    )
    # Add the new constraint with ON DELETE CASCADE
    op.create_foreign_key(
        'member_memberships_membership_id_fkey',
        'member_memberships',
        'memberships',
        ['membership_id'],
        ['membership_id'],
        source_schema='membership',
        referent_schema='membership',
        ondelete='CASCADE'
    )

def downgrade():
    # Drop the cascade constraint
    op.drop_constraint(
        'member_memberships_membership_id_fkey',
        'member_memberships',
        schema='membership',
        type_='foreignkey'
    )
    # Re-add the original constraint without cascade
    op.create_foreign_key(
        'member_memberships_membership_id_fkey',
        'member_memberships',
        'memberships',
        ['membership_id'],
        ['membership_id'],
        source_schema='membership',
        referent_schema='membership'
    )
