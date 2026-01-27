
from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs

# ----------------------
# Common Mixins
# ----------------------

# Base class for models
class Base(AsyncAttrs, DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.

    - AsyncAttrs: enables async ORM features (await obj.relationship)
    - DeclarativeBase: SQLAlchemy 2.0 declarative system
    """
    pass


class AuditMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("shared.users.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("shared.users.id"), nullable=True)
