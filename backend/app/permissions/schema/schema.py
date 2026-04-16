from pydantic import BaseModel
from typing import Dict, Any
from uuid import UUID

class AssignPermissionRequest(BaseModel):
    designation_id: UUID
    permissions: Dict[str, Any]