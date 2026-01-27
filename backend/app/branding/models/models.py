from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.models.base import Base, AuditMixin
from app.core.models.models import StatusEnum

class WhiteLabelConfig(Base, AuditMixin):
    __tablename__ = "white_label_configs"
    __table_args__ = {"schema": "branding"}

    white_label_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    center_id = Column(UUID(as_uuid=True), ForeignKey("center.centers.id"), nullable=False)
    app_name = Column(String, nullable=False)
    logo_url = Column(String)
    primary_color = Column(String)
    secondary_color = Column(String)
    custom_domain = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.active, nullable=False)

    # Relationship to Center (optional)
    center = relationship("Center", backref="white_label_configs")