import uuid
from uuid import UUID

from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.core.models.base import Base


# =========================
# MODULE
# =========================
class Module(Base):
    __tablename__ = "modules"
    __table_args__ = {"schema": "permissions"}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

    submodules = relationship("SubModule", back_populates="module", cascade="all, delete-orphan")
    permissions = relationship("Permission", back_populates="module")


# =========================
# SUBMODULE
# =========================
class SubModule(Base):
    __tablename__ = "submodules"
    __table_args__ = (
        UniqueConstraint('module_id', 'name', name='uq_module_submodule'),
        {"schema": "permissions"}
    )

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)

    module_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("permissions.modules.id", ondelete="CASCADE"),
        nullable=False
    )

    module = relationship("Module", back_populates="submodules")
    permissions = relationship("Permission", back_populates="submodule")


# =========================
# ACTION
# =========================
class Action(Base):
    __tablename__ = "actions"
    __table_args__ = {"schema": "permissions"}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

    permissions = relationship("Permission", back_populates="action")


# =========================
# PERMISSION
# =========================
class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = (
        UniqueConstraint('module_id', 'submodule_id', 'action_id', name='uq_permission'),
        {"schema": "permissions"}
    )

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    module_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("permissions.modules.id", ondelete="CASCADE"),
        nullable=True
    )

    submodule_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("permissions.submodules.id", ondelete="CASCADE"),
        nullable=True
    )

    action_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("permissions.actions.id", ondelete="CASCADE"),
        nullable=True
    )

    code = Column(String, nullable=True)  # e.g., employee.add

    module = relationship("Module", back_populates="permissions")
    submodule = relationship("SubModule", back_populates="permissions")
    action = relationship("Action", back_populates="permissions")

    designation_permissions = relationship(
        "DesignationPermission",
        back_populates="permission",
        cascade="all, delete-orphan"
    )


# =========================
# DESIGNATION PERMISSION
# =========================
class DesignationPermission(Base):
    __tablename__ = "designation_permissions"
    __table_args__ = (
        UniqueConstraint('designation_id', 'permission_id', name='uq_designation_permission'),
        {"schema": "permissions"}
    )

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    designation_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("settings.designations.id", ondelete="CASCADE"),
        nullable=False
    )

    permission_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("permissions.permissions.id", ondelete="CASCADE"),
        nullable=False
    )

    # Relationships
    designation = relationship("Designation", backref="designation_permissions")
    permission = relationship("Permission", back_populates="designation_permissions")