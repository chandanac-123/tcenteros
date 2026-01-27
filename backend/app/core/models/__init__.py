# Base
from app.core.models.base import Base, AuditMixin

# Core / shared (User, enums)
from app.core.models import models as core_models

# Auth (CenterAdmin extends User)  ← MUST COME AFTER core
from app.auth.models import models as auth_models

# Settings
from app.settings.models import models as settings_models

# Center
from app.center.models import models as center_models

# Platform  ✅ ADD THIS
from app.platforms.models import models as platform_models

# Billing
from app.billing.models import models as billing_models

__all__ = ["Base", "AuditMixin"]
