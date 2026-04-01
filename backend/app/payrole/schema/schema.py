from pydantic import BaseModel, UUID4, condecimal, conint
from typing import Literal
from uuid import UUID

class EmployeeSalaryCreate(BaseModel):
    employee_id: UUID4
    salary: condecimal(max_digits=10, decimal_places=2)
    salary_type: Literal["permanent", "contract", "part_time"]
    pay_cycle: Literal["monthly", "weekly", "daily"]

    class Config:
        from_attributes = True

class EmployeeSalaryUpdate(BaseModel):
    salary: condecimal(max_digits=10, decimal_places=2)
    salary_type: Literal["permanent", "contract", "part_time"]
    pay_cycle: Literal["monthly", "weekly", "daily"]

    class Config:
        from_attributes = True




class PayrollCycleCreateUpdate(BaseModel):
    payroll_cycle_day: conint(ge=1, le=31)


class PayrollCycleOut(BaseModel):
    center_id: UUID
    payroll_cycle_day: int

    class Config:
        orm_mode = True


