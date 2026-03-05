from pydantic import BaseModel, UUID4, condecimal
from typing import Literal

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


