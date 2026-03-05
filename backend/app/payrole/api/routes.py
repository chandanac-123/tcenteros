# backend/app/auth/api/employee_salary_routes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_session
from app.auth.models.models import CenterAdmin, Employee
from app.payrole.schema.schema import EmployeeSalaryUpdate, EmployeeSalaryCreate
from app.core.dependencies import centeradmin_required
from sqlalchemy import select, or_, and_, func
from pydantic import UUID4

router = APIRouter()

@router.post("/payrole/employee-salary", status_code=200)
async def set_employee_salary(
    payload: EmployeeSalaryCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # Get logged-in centeradmin and their center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Validate employee belongs to this center
    employee = await db.get(Employee, payload.employee_id)
    if not employee or str(employee.center_id) != str(center_id):
        raise HTTPException(status_code=400, detail="Employee does not belong to your center")

    # Update salary fields
    employee.salary = payload.salary
    employee.salary_type = payload.salary_type
    employee.pay_cycle = payload.pay_cycle

    await db.commit()
    await db.refresh(employee)

    return {
        "id": str(employee.id),
        "full_name": employee.full_name,
        "center_id": str(employee.center_id),
        "salary": float(employee.salary),
        "salary_type": employee.salary_type,
        "pay_cycle": employee.pay_cycle,
        "designation_id": str(employee.designation_id) if employee.designation_id else None,
        "joining_date": employee.joining_date,
    }


@router.get("/center/employees/salary-structure", response_model=dict)
async def list_employees_salary_structure(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    full_name: str = Query(None, description="Search by full name"),
    salary: float = Query(None, description="Search by salary"),
    designation: str = Query(None, description="Search by designation"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Employee
    from app.settings.models.models import Designation

    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Build base query
    query = select(Employee).where(Employee.center_id == center_id)

    # Join with Designation if searching by designation
    if designation:
        query = query.join(Designation, Employee.designation_id == Designation.id)

    # Add search filters
    filters = []
    if full_name:
        filters.append(Employee.full_name.ilike(f"%{full_name}%"))
    if salary is not None:
        filters.append(Employee.salary == salary)
    if designation:
        filters.append(Designation.name.ilike(f"%{designation}%"))

    if filters:
        query = query.where(and_(*filters))

    # Get total count for pagination
    count_query = select(func.count()).select_from(Employee).where(Employee.center_id == center_id)
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    employees = result.scalars().all()

    data = []
    for emp in employees:
        designation_name = None
        if emp.designation_id:
            designation_obj = await db.get(Designation, emp.designation_id)
            if designation_obj:
                designation_name = designation_obj.name
        data.append({
            "id": str(emp.id),
            "full_name": emp.full_name,
            "salary": float(emp.salary) if emp.salary else None,
            "salary_type": emp.salary_type,
            "pay_cycle": emp.pay_cycle,
            "designation": designation_name,
            "joining_date": emp.joining_date,
        })

    return {
        "employees": data,
        "page": page,
        "page_size": page_size,
        "total": total
    }


@router.get("/center/employees/{employee_id}/salary-structure", response_model=dict)
async def get_employee_salary_structure_by_id(
    employee_id: UUID4,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Employee
    from app.settings.models.models import Designation

    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    employee = await db.get(Employee, employee_id)
    if not employee or str(employee.center_id) != str(center_id):
        raise HTTPException(status_code=404, detail="Employee not found in your center")

    designation_name = None
    if employee.designation_id:
        designation = await db.get(Designation, employee.designation_id)
        if designation:
            designation_name = designation.name

    return {
        "id": str(employee.id),
        "full_name": employee.full_name,
        "salary": float(employee.salary) if employee.salary else None,
        "salary_type": employee.salary_type,
        "pay_cycle": employee.pay_cycle,
        "designation": designation_name,
        "joining_date": employee.joining_date,
    }


@router.put("/center/employees/{employee_id}/salary-structure", response_model=dict)
async def update_employee_salary_structure(
    employee_id: UUID4,
    payload: EmployeeSalaryUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Employee
    from app.settings.models.models import Designation

    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    employee = await db.get(Employee, employee_id)
    if not employee or str(employee.center_id) != str(center_id):
        raise HTTPException(status_code=404, detail="Employee not found in your center")

    employee.salary = payload.salary
    employee.salary_type = payload.salary_type
    employee.pay_cycle = payload.pay_cycle
    await db.commit()
    await db.refresh(employee)

    designation_name = None
    if employee.designation_id:
        designation = await db.get(Designation, employee.designation_id)
        if designation:
            designation_name = designation.name

    return {
        "id": str(employee.id),
        "full_name": employee.full_name,
        "salary": float(employee.salary) if employee.salary else None,
        "salary_type": employee.salary_type,
        "pay_cycle": employee.pay_cycle,
        "designation": designation_name,
        "joining_date": employee.joining_date,
    }


@router.delete("/center/employees/{employee_id}/salary-structure", status_code=204)
async def delete_employee_salary_structure(
    employee_id: UUID4,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Employee

    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    employee = await db.get(Employee, employee_id)
    if not employee or str(employee.center_id) != str(center_id):
        raise HTTPException(status_code=404, detail="Employee not found in your center")

    await db.delete(employee)
    await db.commit()
    return {"detail": "Employee deleted"}