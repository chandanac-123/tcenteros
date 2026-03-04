from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.payrole.models.models import SalaryStructure
from app.settings.models.models import Designation
from app.payrole.schema.schema import SalaryStructureCreate
from app.core.database import get_async_session
from app.core.dependencies import centeradmin_required

router = APIRouter()

@router.post("/salary-structure", status_code=201)
async def create_salary_structure(
    payload: SalaryStructureCreate,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]

    # Optionally, check if the designation belongs to this center
    # (Assuming Designation model has center_id)
    designation = await session.get(Designation, payload.designation_id)
    if not designation or str(designation.center_id) != str(center_id):
        raise HTTPException(status_code=403, detail="Designation does not belong to your center.")

    salary_struct = SalaryStructure(
        center_id=center_id,
        designation_id=payload.designation_id,
        salary_type=payload.salary_type,
        pay_cycle=payload.pay_cycle,
        salary_amount=payload.salary_amount
    )
    session.add(salary_struct)
    await session.commit()
    await session.refresh(salary_struct)
    return {
        "detail": "Salary structure created successfully",
        "salary_structure_id": str(salary_struct.id)
    }