from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.settings.models.models import Designation
from app.payrole.schema.schema import SalaryStructureCreate
from app.core.database import get_async_session
from app.core.dependencies import centeradmin_required

router = APIRouter()

