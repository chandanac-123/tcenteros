from pydantic import BaseModel
from uuid import UUID

class SalaryStructureCreate(BaseModel):
    designation_id: UUID
    salary_type: str  # e.g., "permanent", "contract", "hybrid", "part_time"
    pay_cycle: str    # e.g., "monthly", "weekly", "biweekly"
    salary_amount: float