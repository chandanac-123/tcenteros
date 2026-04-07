"""create permissions schema and tables

Revision ID: 10ca0b12f1f4
Revises: e3865d02c4d9
Create Date: 2026-04-07 06:09:46.325013

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '10ca0b12f1f4'
down_revision = 'e3865d02c4d9'
branch_labels = None
depends_on = None


def upgrade():
    # =========================
    # 1. CREATE SCHEMA
    # =========================
    op.execute("CREATE SCHEMA IF NOT EXISTS permissions")

    # =========================
    # 2. MODULES TABLE
    # =========================
    op.create_table(
        'modules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        schema='permissions'
    )

    # =========================
    # 3. SUBMODULES TABLE
    # =========================
    op.create_table(
        'submodules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column(
            'module_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('permissions.modules.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.UniqueConstraint('module_id', 'name', name='uq_module_submodule'),
        schema='permissions'
    )

    # =========================
    # 4. ACTIONS TABLE
    # =========================
    op.create_table(
        'actions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        schema='permissions'
    )

    # =========================
    # 5. PERMISSIONS TABLE
    # =========================
    op.create_table(
        'permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            'module_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('permissions.modules.id', ondelete='CASCADE'),
            nullable=True
        ),
        sa.Column(
            'submodule_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('permissions.submodules.id', ondelete='CASCADE'),
            nullable=True
        ),
        sa.Column(
            'action_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('permissions.actions.id', ondelete='CASCADE'),
            nullable=True
        ),
        sa.Column('code', sa.String(), nullable=True),
        sa.UniqueConstraint(
            'module_id', 'submodule_id', 'action_id',
            name='uq_permission'
        ),
        schema='permissions'
    )

    # =========================
    # 6. DESIGNATION PERMISSIONS
    # =========================
    op.create_table(
        'designation_permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            'designation_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('settings.designations.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.Column(
            'permission_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('permissions.permissions.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.UniqueConstraint(
            'designation_id', 'permission_id',
            name='uq_designation_permission'
        ),
        schema='permissions'
    )


def downgrade():
    # Drop in reverse order
    op.drop_table('designation_permissions', schema='permissions')
    op.drop_table('permissions', schema='permissions')
    op.drop_table('actions', schema='permissions')
    op.drop_table('submodules', schema='permissions')
    op.drop_table('modules', schema='permissions')

    op.execute("DROP SCHEMA IF EXISTS permissions CASCADE")