from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.models.models import User
from app.core.models.base import Base
from app.core.models.models import UserRole


class CenterAdmin(User):
    __tablename__ = "center_admins"
    __table_args__ = {"schema": "auth"}

    id = Column(
        UUID(as_uuid=True),
        ForeignKey("shared.users.id", ondelete="CASCADE"),
        primary_key=True
    )

    full_name = Column(String, nullable=False)

    address_id = Column(
        UUID(as_uuid=True),
        ForeignKey("settings.address.id"),
        nullable=True
    )

    center_id = Column(
        UUID(as_uuid=True),
        ForeignKey("center.centers.id"),
        nullable=False
    )

    network_access_enabled = Column(Boolean, default=False, nullable=False)
    white_label_enabled = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": UserRole.centeradmin,
    }

    # Relationships
    center = relationship(
    "Center",
    back_populates="admins",
    foreign_keys=[center_id]
)
    address = relationship(
    "Address",
    back_populates="center_admins",
    foreign_keys=[address_id]
)
