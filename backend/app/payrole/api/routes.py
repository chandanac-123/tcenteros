# backend/app/auth/api/employee_salary_routes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_session
from app.auth.models.models import CenterAdmin, Employee
from app.payrole.schema.schema import EmployeeSalaryUpdate, EmployeeSalaryCreate
from app.core.dependencies import centeradmin_required
from sqlalchemy import select, or_, and_, func
from pydantic import UUID4
from typing import Optional
from app.billing.models.models import PaymentOrder, PayerType, PayeeType, OrderType, ReferenceSchema, PaymentOrderStatus, Currency, PaymentMethod
from app.accounts.helpers import auto_record_payroll_payment
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from app.settings.models.models import CenterOperationalSetting
from app.payrole.models.models import PayrollRecord, PayrollStatus, PayrollPaymentMethod
from decimal import Decimal
from uuid import uuid4


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

        "employee_id": str(employee_id),   # <-- path param shown here
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





@router.post("/payroll/run", status_code=201)
async def run_payroll(
    payment_method: str = Query("bank_transfer", pattern="^(cash|bank_transfer|upi|card|other)$"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    """
    Run payroll for all active employees of the center.
    Creates PaymentOrder and records in accounts module as expense.
    """
    import traceback

    # Get center admin and center details
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    center_id = center_admin.center_id

    # Get operational settings
    settings_result = await db.execute(
        select(CenterOperationalSetting).where(
            CenterOperationalSetting.center_id == center_id
        )
    )
    settings = settings_result.scalar_one_or_none()

    if not settings:
        raise HTTPException(
            status_code=400,
            detail="Operational settings not configured. Please set payroll cycle day in settings."
        )

    # Validate payroll cycle day
    today = date.today()
    payroll_cycle_day = settings.payroll_cycle_day

    # Check if today is the payroll day
    if today.day != payroll_cycle_day:
        raise HTTPException(
            status_code=400,
            detail=f"Payroll can only be run on day {payroll_cycle_day} of the month. Today is day {today.day}."
        )

    # Calculate payroll period (previous month)
    payroll_month = today.replace(day=1) - relativedelta(days=1)  # Last month
    period_start = payroll_month.replace(day=1)
    period_end = payroll_month.replace(day=payroll_month.day)

    # Check if payroll already run for this period
    existing_payroll = await db.execute(
        select(PayrollRecord).where(
            and_(
                PayrollRecord.center_id == center_id,
                PayrollRecord.payroll_month == payroll_month.month,
                PayrollRecord.payroll_year == payroll_month.year,
                PayrollRecord.status == PayrollStatus.paid
            )
        )
    )
    if existing_payroll.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail=f"Payroll already processed for {payroll_month.strftime('%B %Y')}"
        )

    # Get all active employees for this center
    employees_result = await db.execute(
        select(Employee).where(
            and_(
                Employee.center_id == center_id,
                Employee.status == "active"
            )
        )
    )
    employees = employees_result.scalars().all()

    if not employees:
        raise HTTPException(
            status_code=400,
            detail="No active employees found for this center"
        )

    # Calculate salaries
    payroll_records = []
    total_gross_salary = Decimal('0')
    total_deductions = Decimal('0')
    total_net_salary = Decimal('0')
    skipped_employees = []

    for employee in employees:
        # Skip employees with no salary set
        if employee.salary is None:
            skipped_employees.append(f"Employee '{employee.full_name}' (ID: {employee.id}) has no salary set and was skipped.")
            continue
        try:
            gross_salary = Decimal(str(employee.salary))
        except Exception:
            skipped_employees.append(f"Employee '{employee.full_name}' (ID: {employee.id}) has invalid salary value and was skipped.")
            continue

        # Calculate deductions (TDS: 10% if salary > 50000)
        tds_amount = Decimal('0')
        if gross_salary > 50000:
            tds_amount = gross_salary * Decimal('0.10')  # 10% TDS

        # Other deductions (from employee model if exists)
        other_deductions = Decimal(str(getattr(employee, 'deductions', 0)))

        total_deductions_emp = tds_amount + other_deductions
        net_salary = gross_salary - total_deductions_emp

        # Create payroll record - Use PayrollPaymentMethod
        payroll_record = PayrollRecord(
            id=uuid4(),
            employee_id=employee.id,
            center_id=center_id,
            payroll_month=payroll_month.month,
            payroll_year=payroll_month.year,
            period_start=period_start,
            period_end=period_end,
            gross_salary=gross_salary,
            tds_amount=tds_amount,
            other_deductions=other_deductions,
            total_deductions=total_deductions_emp,
            net_salary=net_salary,
            payment_method=PayrollPaymentMethod(payment_method),  # Use PayrollPaymentMethod
            status=PayrollStatus.paid,
            paid_date=today,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(payroll_record)
        payroll_records.append(payroll_record)

        total_gross_salary += gross_salary
        total_deductions += total_deductions_emp
        total_net_salary += net_salary

    await db.flush()

    # If no employees processed, raise error
    if not payroll_records:
        raise HTTPException(
            status_code=400,
            detail="No employees with valid salary found for payroll run. " +
                   " ".join(skipped_employees)
        )

    # Create PaymentOrder (Expense for center) - Use BillingPaymentMethod
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        payer_user_id=center_admin.id,  # Center admin pays
        payer_type=PayerType.center_admin,
        payee_type=PayeeType.center,  # Paid by center
        center_id=center_id,
        order_type=OrderType.payroll,  # Using payroll for payroll expense
        reference_schema=ReferenceSchema.center,
        reference_id=center_id,
        subtotal_amount=float(total_gross_salary),
        tax_amount=0.00,  # No tax on salary payment
        total_amount=float(total_gross_salary),
        currency=Currency.INR,
        status=PaymentOrderStatus.paid,
        payment_method=PaymentMethod(payment_method),  # Use BillingPaymentMethod
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(payment_order)
    await db.flush()

    # Record in accounts module
    try:
        await auto_record_payroll_payment(
            db=db,
            payment_order=payment_order,
            total_salary=total_gross_salary,
            tds_amount=total_deductions,
            net_payable=total_net_salary,
            created_by=str(current_user["user_id"])
        )
        print(f"✅ Payroll accounting entry created for {payroll_month.strftime('%B %Y')}")
    except Exception as e:
        print(f"❌ Failed to record payroll in accounts: {str(e)}")
        traceback.print_exc()
        # Don't fail payroll run, just log the error

    await db.commit()

    # Build response
    return {
        "message": f"Payroll processed successfully for {payroll_month.strftime('%B %Y')}",
        "payroll_period": {
            "month": payroll_month.month,
            "year": payroll_month.year,
            "period_start": str(period_start),
            "period_end": str(period_end)
        },
        "summary": {
            "total_employees": len(payroll_records),
            "total_gross_salary": float(total_gross_salary),
            "total_deductions": float(total_deductions),
            "total_net_salary": float(total_net_salary)
        },
        "payment_order_id": str(payment_order.payment_order_id),
        "payment_method": payment_method,
        "payroll_records": [
            {
                "id": str(record.id),
                "employee_id": str(record.employee_id),
                "employee_name": next(
                    (emp.full_name for emp in employees if emp.id == record.employee_id),
                    "Unknown"
                ),
                "gross_salary": float(record.gross_salary),
                "deductions": float(record.total_deductions),
                "net_salary": float(record.net_salary)
            }
            for record in payroll_records
        ],
        "skipped_employees": skipped_employees
    }


@router.get("/payroll/history")
async def get_payroll_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    """Get payroll history for the center"""
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    
    # Build query
    query = select(PayrollRecord).where(
        PayrollRecord.center_id == center_admin.center_id
    )
    
    if month:
        query = query.where(PayrollRecord.payroll_month == month)
    if year:
        query = query.where(PayrollRecord.payroll_year == year)
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(PayrollRecord).where(
            PayrollRecord.center_id == center_admin.center_id
        )
    )
    total = count_result.scalar_one()
    
    # Apply pagination
    query = query.order_by(
        PayrollRecord.payroll_year.desc(),
        PayrollRecord.payroll_month.desc()
    ).offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    # Get employee details
    employee_ids = [record.employee_id for record in records]
    employees_result = await db.execute(
        select(Employee).where(Employee.id.in_(employee_ids))
    )
    employees = {emp.id: emp for emp in employees_result.scalars().all()}
    
    return {
        "payroll_records": [
            {
                "id": str(record.id),
                "employee_id": str(record.employee_id),
                "employee_name": employees.get(record.employee_id).full_name if employees.get(record.employee_id) else "Unknown",
                "payroll_month": record.payroll_month,
                "payroll_year": record.payroll_year,
                "period": f"{record.payroll_month}/{record.payroll_year}",
                "gross_salary": float(record.gross_salary),
                "deductions": float(record.total_deductions),
                "net_salary": float(record.net_salary),
                "payment_method": record.payment_method.value,
                "status": record.status.value,
                "paid_date": str(record.paid_date) if record.paid_date else None
            }
            for record in records
        ],
        "page": page,
        "page_size": page_size,
        "total": total
    }