from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, or_, extract
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import selectinload
from app.core.database import get_async_session
from app.core.dependencies import get_current_user, centeradmin_required
from app.accounts.models.models import (
    ChartOfAccounts, JournalEntry, JournalEntryLine, 
    GeneralLedger, TaxLedger, AccountType, EntryStatus, TransactionSource
)
from app.accounts.schema.schema import *
from app.accounts.models.models import (
    ChartOfAccounts, JournalEntry, JournalEntryLine, 
    GeneralLedger, TaxLedger, AccountType, TransactionSource
)
from app.payrole.models.models import PayrollRecord



router = APIRouter()

async def get_other_charges_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get all other charges (miscellaneous income/expense) for the period.
    """
    from app.accounts.models.models import GeneralLedger

    # Sources to include for other charges
    sources = ["general_expense", "general_income", "other_charges"]

    # Expenses
    expense_query = (
        select(func.sum(GeneralLedger.debit))
        .where(
            GeneralLedger.center_id == center_id,
            GeneralLedger.source.in_(sources),
            GeneralLedger.transaction_date >= period_start,
            GeneralLedger.transaction_date <= period_end
        )
    )
    expense_result = await db.execute(expense_query)
    total_expense = expense_result.scalar() or 0

    # Income
    income_query = (
        select(func.sum(GeneralLedger.credit))
        .where(
            GeneralLedger.center_id == center_id,
            GeneralLedger.source.in_(sources),
            GeneralLedger.transaction_date >= period_start,
            GeneralLedger.transaction_date <= period_end
        )
    )
    income_result = await db.execute(income_query)
    total_income = income_result.scalar() or 0

    return {
        "other_charges_income": float(total_income),
        "other_charges_expense": float(total_expense)
    }

@router.get("/dashboard/accounting")
async def get_accounting_dashboard(
    start_year: int = Query(None, description="Year for monthly chart"),
    end_year: int = Query(None, description="Year for monthly chart"),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]

    # 1. Total Income, Expense, GST Payable, Payroll
    total_income = await session.execute(
        select(func.sum(GeneralLedger.credit))
        .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
        .where(
            GeneralLedger.center_id == center_id,
            ChartOfAccounts.account_type == AccountType.REVENUE
        )
    )
    total_income = float(total_income.scalar() or 0)

    total_expense = await session.execute(
        select(func.sum(GeneralLedger.debit))
        .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
        .where(
            GeneralLedger.center_id == center_id,
            ChartOfAccounts.account_type == AccountType.EXPENSE
        )
    )
    total_expense = float(total_expense.scalar() or 0)

    gst_payable = await session.execute(
        select(func.sum(GeneralLedger.credit - GeneralLedger.debit))
        .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
        .where(
            GeneralLedger.center_id == center_id,
            ChartOfAccounts.code == "2200"
        )
    )
    gst_payable = float(gst_payable.scalar() or 0)

    payroll_expense = await session.execute(
        select(func.sum(GeneralLedger.debit))
        .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
        .where(
            GeneralLedger.center_id == center_id,
            ChartOfAccounts.code == "5000"
        )
    )
    payroll_expense = float(payroll_expense.scalar() or 0)

    # 2. Monthly Income & Expense Chart
    year = start_year or datetime.utcnow().year
    monthly_income = []
    monthly_expense = []
    for month in range(1, 13):
        income = await session.execute(
            select(func.sum(GeneralLedger.credit))
            .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
            .where(
                GeneralLedger.center_id == center_id,
                ChartOfAccounts.account_type == AccountType.REVENUE,
                extract('month', GeneralLedger.transaction_date) == month,
                extract('year', GeneralLedger.transaction_date) == year
            )
        )
        monthly_income.append(float(income.scalar() or 0))

        expense = await session.execute(
            select(func.sum(GeneralLedger.debit))
            .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
            .where(
                GeneralLedger.center_id == center_id,
                ChartOfAccounts.account_type == AccountType.EXPENSE,
                extract('month', GeneralLedger.transaction_date) == month,
                extract('year', GeneralLedger.transaction_date) == year
            )
        )
        monthly_expense.append(float(expense.scalar() or 0))

    # 3. Income Breakdown
    income_codes = {
        "membership": "4000",
        "network": "4200",
        "inventory_sales": "4100",
        "other": "4300"
    }
    income_breakdown = {}
    for key, code in income_codes.items():
        value = await session.execute(
            select(func.sum(GeneralLedger.credit))
            .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
            .where(
                GeneralLedger.center_id == center_id,
                ChartOfAccounts.code == code
            )
        )
        income_breakdown[key] = float(value.scalar() or 0)
    total_income_for_breakdown = sum(income_breakdown.values())
    for key in income_breakdown:
        percent = (
            (income_breakdown[key] / total_income_for_breakdown) * 100
            if total_income_for_breakdown > 0 else 0
        )
        income_breakdown[key] = {
            "value": income_breakdown[key],
            "percentage": round(percent, 2)
        }

    # 4. Expense Breakdown
    expense_codes = {
    "networking": "5500",
    "salary": "5000",
    "branching": ["5600", "5700"],  # Include both General Expense and Branch Purchase Expense
    "inventory_purchase": "5400",
    "other": "5100"
}
    expense_breakdown = {}
    for key, code in expense_codes.items():
        if isinstance(code, list):
            value = await session.execute(
                select(func.sum(GeneralLedger.debit))
                .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
                .where(
                    GeneralLedger.center_id == center_id,
                    ChartOfAccounts.code.in_(code)
                )
            )
        else:
            value = await session.execute(
                select(func.sum(GeneralLedger.debit))
                .join(ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id)
                .where(
                    GeneralLedger.center_id == center_id,
                    ChartOfAccounts.code == code
                )
            )
        expense_breakdown[key] = float(value.scalar() or 0)
    total_expense_for_breakdown = sum(expense_breakdown.values())
    for key in expense_breakdown:
        percent = (
            (expense_breakdown[key] / total_expense_for_breakdown) * 100
            if total_expense_for_breakdown > 0 else 0
        )
        expense_breakdown[key] = {
            "value": expense_breakdown[key],
            "percentage": round(percent, 2)
        }

    return {
        "totals": {
            "income": total_income,
            "expense": total_expense,
            "gst_payable": gst_payable,
            "payroll_expense": payroll_expense
        },
        "monthly_chart": {
            "income": monthly_income,
            "expense": monthly_expense
        },
        "income_breakdown": income_breakdown,
        "expense_breakdown": expense_breakdown
    }





# ============================================
# HELPER FUNCTIONS (Embedded Business Logic)
# ============================================

async def get_account_by_code(db: AsyncSession, code: str, center_id: UUID):
    """Get account by code for specific center"""
    result = await db.execute(
        select(ChartOfAccounts).where(
            and_(
                ChartOfAccounts.code == code,
                ChartOfAccounts.center_id == center_id
            )
        )
    )
    return result.scalar_one_or_none()


async def generate_entry_number(db: AsyncSession) -> str:
    """Generate unique journal entry number"""
    result = await db.execute(select(func.count(JournalEntry.id)))
    count = result.scalar() or 0
    return f"JE{datetime.utcnow().strftime('%Y%m%d')}{count + 1:05d}"


async def create_and_post_journal_entry(
    db: AsyncSession,
    entry_data: JournalEntryCreate,
    created_by: int
) -> JournalEntry:
    """Create and post journal entry in one go"""
    
    # Generate entry number
    entry_number = await generate_entry_number(db)
    
    # Calculate totals
    total_debit = sum(line.debit for line in entry_data.lines)
    total_credit = sum(line.credit for line in entry_data.lines)
    
    # Create journal entry
    journal_entry = JournalEntry(
        entry_number=entry_number,
        entry_date=entry_data.entry_date,
        description=entry_data.description,
        source=entry_data.source,
        source_id=entry_data.source_id,
        center_id=UUID(entry_data.center_id),
        total_debit=total_debit,
        total_credit=total_credit,
        created_by=created_by,
        status=EntryStatus.POSTED,
        posted_at=datetime.utcnow(),
        posted_by=created_by
    )
    
    db.add(journal_entry)
    await db.flush()
    
    # Create lines and post to ledger
    for line_data in entry_data.lines:
        # Create journal line
        line = JournalEntryLine(
            journal_entry_id=journal_entry.id,
            account_id=line_data.account_id,
            entry_date=entry_data.entry_date,
            description=line_data.description,
            debit=line_data.debit,
            credit=line_data.credit
        )
        db.add(line)
        await db.flush()
        
        # Get current balance
        balance_result = await db.execute(
            select(GeneralLedger.balance)
            .where(GeneralLedger.account_id == line_data.account_id)
            .order_by(GeneralLedger.id.desc())
            .limit(1)
        )
        current_balance = balance_result.scalar() or Decimal(0)
        
        # Get account type
        account_result = await db.execute(
            select(ChartOfAccounts).where(ChartOfAccounts.id == line_data.account_id)
        )
        account = account_result.scalar_one()
        
        # Calculate new balance
        if account.account_type in [AccountType.ASSET, AccountType.EXPENSE]:
            new_balance = current_balance + line_data.debit - line_data.credit
        else:
            new_balance = current_balance + line_data.credit - line_data.debit
        
        # Create ledger entry
        ledger_entry = GeneralLedger(
            account_id=line_data.account_id,
            journal_entry_id=journal_entry.id,
            journal_entry_line_id=line.id,
            transaction_date=entry_data.entry_date,
            description=line_data.description or entry_data.description,
            debit=line_data.debit,
            credit=line_data.credit,
            balance=new_balance,
            center_id=UUID(entry_data.center_id),
            source=entry_data.source,
            source_id=entry_data.source_id
        )
        db.add(ledger_entry)
    
    await db.commit()
    await db.refresh(journal_entry)
    
    return journal_entry


async def record_tax(
    db: AsyncSession,
    journal_entry_id: int,
    center_id: UUID,
    transaction_date: datetime,
    tax_type: str,
    tax_rate: Decimal,
    taxable_amount: Decimal,
    tax_amount: Decimal,
    source: TransactionSource,
    source_id: str
):
    """Record tax in tax ledger"""
    tax_entry = TaxLedger(
        journal_entry_id=journal_entry_id,
        center_id=center_id,
        transaction_date=transaction_date,
        tax_type=tax_type,
        tax_rate=tax_rate,
        taxable_amount=taxable_amount,
        tax_amount=tax_amount,
        source=source,
        source_id=source_id
    )
    db.add(tax_entry)
    await db.commit()


# ============================================
# CHART OF ACCOUNTS APIs
# ============================================

@router.get("/chart-of-accounts", response_model=List[ChartOfAccountsResponse])
async def get_chart_of_accounts(
    center_id: str,
    account_type: Optional[AccountType] = None,
    is_active: bool = True,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get chart of accounts for a center"""
    
    query = select(ChartOfAccounts).where(ChartOfAccounts.center_id == UUID(center_id))
    
    if account_type:
        query = query.where(ChartOfAccounts.account_type == account_type)
    if is_active is not None:
        query = query.where(ChartOfAccounts.is_active == is_active)
    
    query = query.order_by(ChartOfAccounts.code)
    
    result = await db.execute(query)
    accounts = result.scalars().all()
    
    # Convert UUID to string for each account
    return [
        ChartOfAccountsResponse(
            id=account.id,
            center_id=str(account.center_id),  # Convert UUID to string
            code=account.code,
            name=account.name,
            account_type=account.account_type,
            parent_id=account.parent_id,
            description=account.description,
            is_active=account.is_active,
            is_system=account.is_system,
            created_at=account.created_at,
            updated_at=account.updated_at
        )
        for account in accounts
    ]





# ============================================
# 1. LEDGER TAB - All Transactions
# ============================================

@router.get("/ledger", summary="Get all ledger entries")
async def get_ledger_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    account_code: Optional[str] = None,
    account_type: Optional[AccountType] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,  # Search in description
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get all ledger entries with filters
    Shows: Date, Account, Description, Debit, Credit, Balance, Entry Number
    """
    center_id = current_admin["center_id"]
    
    # Build query with joins
    query = select(
        GeneralLedger,
        ChartOfAccounts.code.label('account_code'),
        ChartOfAccounts.name.label('account_name'),
        ChartOfAccounts.account_type.label('account_type'),
        JournalEntry.entry_number.label('entry_number')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).join(
        JournalEntry, GeneralLedger.journal_entry_id == JournalEntry.id
    ).where(GeneralLedger.center_id == UUID(center_id))
    
    # Filters
    if account_code:
        query = query.where(ChartOfAccounts.code == account_code)
    
    if account_type:
        query = query.where(ChartOfAccounts.account_type == account_type)
    
    if start_date:
        query = query.where(func.date(GeneralLedger.transaction_date) >= start_date)
    
    if end_date:
        query = query.where(func.date(GeneralLedger.transaction_date) <= end_date)
    
    if search:
        query = query.where(GeneralLedger.description.ilike(f"%{search}%"))
    
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Pagination
    query = query.order_by(desc(GeneralLedger.transaction_date), desc(GeneralLedger.id))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    entries = []
    for row in rows:
        entries.append({
            "id": row.GeneralLedger.id,
            "date": row.GeneralLedger.transaction_date.strftime("%Y-%m-%d"),
            "entry_number": row.entry_number,
            "account_code": row.account_code,
            "account_name": row.account_name,
            "account_type": row.account_type,
            "description": row.GeneralLedger.description,
            "debit": float(row.GeneralLedger.debit) if row.GeneralLedger.debit else 0,
            "credit": float(row.GeneralLedger.credit) if row.GeneralLedger.credit else 0,
            "balance": float(row.GeneralLedger.balance),
            "source": row.GeneralLedger.source,
            "source_id": row.GeneralLedger.source_id
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "entries": entries
    }


# ============================================
# 2. INCOME TAB - All Revenue Sources
# ============================================

@router.get("/income", summary="Get all income entries")
async def get_income_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    income_type: Optional[str] = Query(None, description="membership, inventory, network, other"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get all income/revenue entries
    Shows: Date, Income Type, Source, Amount, Tax, Total
    """
    center_id = current_admin["center_id"]
    
    # Query revenue accounts (4000-4999)
    query = select(
        GeneralLedger,
        ChartOfAccounts.code.label('account_code'),
        ChartOfAccounts.name.label('account_name'),
        JournalEntry.entry_number.label('entry_number'),
        JournalEntry.description.label('je_description')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).join(
        JournalEntry, GeneralLedger.journal_entry_id == JournalEntry.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        ChartOfAccounts.account_type == AccountType.REVENUE
    )
    
    # Filter by income type
    if income_type == "membership":
        query = query.where(ChartOfAccounts.code == "4000")
    elif income_type == "inventory":
        query = query.where(ChartOfAccounts.code == "4100")
    elif income_type == "network":
        query = query.where(ChartOfAccounts.code == "4200")
    elif income_type == "other":
        query = query.where(ChartOfAccounts.code == "4300")
    
    # Date filters
    if start_date:
        query = query.where(func.date(GeneralLedger.transaction_date) >= start_date)
    if end_date:
        query = query.where(func.date(GeneralLedger.transaction_date) <= end_date)
    
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Pagination
    query = query.order_by(desc(GeneralLedger.transaction_date))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    entries = []
    for row in rows:
        # Get corresponding tax entry if exists
        tax_query = select(TaxLedger).where(
            TaxLedger.journal_entry_id == row.GeneralLedger.journal_entry_id
        )
        tax_result = await db.execute(tax_query)
        tax_entry = tax_result.scalar_one_or_none()
        
        entries.append({
            "id": row.GeneralLedger.id,
            "date": row.GeneralLedger.transaction_date.strftime("%Y-%m-%d"),
            "entry_number": row.entry_number,
            "income_type": row.account_name,
            "account_code": row.account_code,
            "description": row.je_description,
            "amount": float(row.GeneralLedger.credit),  # Income is credit
            "tax_amount": float(tax_entry.tax_amount) if tax_entry else 0,
            "total_amount": float(row.GeneralLedger.credit) + (float(tax_entry.tax_amount) if tax_entry else 0),
            "source": row.GeneralLedger.source,
            "source_id": row.GeneralLedger.source_id
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
        "summary": {
            "total_income": sum(e["amount"] for e in entries),
            "total_tax": sum(e["tax_amount"] for e in entries)
        }
    }


# ============================================
# 3. EXPENSE TAB - All Costs
# ============================================

@router.get("/expenses", summary="Get all expense entries")
async def get_expense_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    expense_type: Optional[str] = Query(None, description="salary, rent, marketing, utilities, cogs, platform_fee, general"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get all expense entries
    Shows: Date, Expense Type, Description, Amount
    """
    center_id = current_admin["center_id"]
    
    # Query expense accounts (5000-5999)
    query = select(
        GeneralLedger,
        ChartOfAccounts.code.label('account_code'),
        ChartOfAccounts.name.label('account_name'),
        JournalEntry.entry_number.label('entry_number'),
        JournalEntry.description.label('je_description')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).join(
        JournalEntry, GeneralLedger.journal_entry_id == JournalEntry.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        ChartOfAccounts.account_type == AccountType.EXPENSE
    )
    
    # Filter by expense type
    expense_codes = {
        "salary": "5000",
        "rent": "5100",
        "marketing": "5200",
        "utilities": "5300",
        "cogs": "5400",
        "platform_fee": "5500",
        "general": "5600"
    }
    
    if expense_type and expense_type in expense_codes:
        query = query.where(ChartOfAccounts.code == expense_codes[expense_type])
    
    # Date filters
    if start_date:
        query = query.where(func.date(GeneralLedger.transaction_date) >= start_date)
    if end_date:
        query = query.where(func.date(GeneralLedger.transaction_date) <= end_date)
    
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Pagination
    query = query.order_by(desc(GeneralLedger.transaction_date))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    entries = []
    for row in rows:
        entries.append({
            "id": row.GeneralLedger.id,
            "date": row.GeneralLedger.transaction_date.strftime("%Y-%m-%d"),
            "entry_number": row.entry_number,
            "expense_type": row.account_name,
            "account_code": row.account_code,
            "description": row.je_description,
            "amount": float(row.GeneralLedger.debit),  # Expenses are debit
            "source": row.GeneralLedger.source,
            "source_id": row.GeneralLedger.source_id
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
        "summary": {
            "total_expenses": sum(e["amount"] for e in entries)
        }
    }


# ============================================
# 4. PAYROLL TAB - Salary Accounting
# ============================================

from sqlalchemy.orm import selectinload


@router.get("/payroll", summary="Get payroll accounting entries")
async def get_payroll_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020),
    employee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get payroll accounting entries
    Shows: Date, Employee, Gross Salary, Deductions, Net Salary, Status
    """
    center_id = current_admin["center_id"]

    # Query salary expense account (5000)
    query = select(
        GeneralLedger,
        JournalEntry.entry_number.label('entry_number'),
        JournalEntry.description.label('description')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).join(
        JournalEntry, GeneralLedger.journal_entry_id == JournalEntry.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        GeneralLedger.source == TransactionSource.PAYROLL,
        ChartOfAccounts.code == "5000"
    )

    # Filters
    if month:
        query = query.where(func.extract('month', GeneralLedger.transaction_date) == month)
    if year:
        query = query.where(func.extract('year', GeneralLedger.transaction_date) == year)
    if employee_id:
        query = query.where(GeneralLedger.source_id == employee_id)

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Pagination
    query = query.order_by(desc(GeneralLedger.transaction_date))
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    rows = result.all()

    # Collect all payroll IDs to batch fetch PayrollRecords and Employees
    payroll_ids = [str(row.GeneralLedger.source_id) for row in rows if row.GeneralLedger.source_id]
    payrolls = {}
    employees = {}

    if payroll_ids:
        # Fetch PayrollRecords with employee relationship
        payroll_result = await db.execute(
            select(PayrollRecord)
            .options(selectinload(PayrollRecord.employee))
            .where(PayrollRecord.id.in_(payroll_ids))
        )
        for pr in payroll_result.scalars().all():
            payrolls[str(pr.id)] = pr
            if pr.employee:
                employees[str(pr.employee.id)] = pr.employee

    entries = []
    for row in rows:
        payroll = payrolls.get(str(row.GeneralLedger.source_id))
        employee_name = "Unknown"
        status = "unknown"
        gross_salary = float(row.GeneralLedger.debit) if row.GeneralLedger.debit else 0
        deductions = 0
        net_salary = 0
        if payroll:
            if payroll.employee:
                # Try both .full_name and .name for compatibility
                employee_name = getattr(payroll.employee, "full_name", None) or getattr(payroll.employee, "name", None) or "Unknown"
            status = payroll.status.value if hasattr(payroll.status, "value") else str(payroll.status)
            gross_salary = float(payroll.gross_salary) if payroll.gross_salary else gross_salary
            deductions = float(payroll.total_deductions) if payroll.total_deductions else 0
            net_salary = float(payroll.net_salary) if payroll.net_salary else 0

        entries.append({
            "id": str(row.GeneralLedger.id),
            "date": row.GeneralLedger.transaction_date.strftime("%Y-%m-%d"),
            "entry_number": row.entry_number,
            "payroll_id": str(row.GeneralLedger.source_id),
            "employee_name": employee_name,
            "gross_salary": gross_salary,
            "deductions": deductions,
            "net_salary": net_salary,
            "month": row.GeneralLedger.transaction_date.strftime("%B %Y"),
            "status": status
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
        "summary": {
            "total_gross_salary": sum(e["gross_salary"] for e in entries),
            "total_deductions": sum(e["deductions"] for e in entries),
            "total_net_salary": sum(e["net_salary"] for e in entries)
        }
    }


# ============================================
# 5. INVENTORY TAB - Stock Accounting
# ============================================

@router.get("/inventory-accounting", summary="Get inventory accounting entries")
async def get_inventory_accounting(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    transaction_type: Optional[str] = Query(None, description="purchase, sale, adjustment"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get inventory accounting entries
    Shows: Date, Type, Description, Quantity, Value, COGS (for sales)
    """
    center_id = current_admin["center_id"]
    
    # Query inventory and COGS accounts
    query = select(
        GeneralLedger,
        ChartOfAccounts.code.label('account_code'),
        ChartOfAccounts.name.label('account_name'),
        JournalEntry.entry_number.label('entry_number'),
        JournalEntry.description.label('description')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).join(
        JournalEntry, GeneralLedger.journal_entry_id == JournalEntry.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        or_(
            GeneralLedger.source == TransactionSource.INVENTORY_SALE,
            GeneralLedger.source == TransactionSource.INVENTORY_PURCHASE
        )
    )
    
    # Filter by transaction type
    if transaction_type == "purchase":
        query = query.where(
            GeneralLedger.source == TransactionSource.INVENTORY_PURCHASE,
            ChartOfAccounts.code == "1400"  # Inventory Asset
        )
    elif transaction_type == "sale":
        query = query.where(
            GeneralLedger.source == TransactionSource.INVENTORY_SALE,
            or_(
                ChartOfAccounts.code == "4100",  # Sales Income
                ChartOfAccounts.code == "5400"   # COGS
            )
        )
    
    # Date filters
    if start_date:
        query = query.where(func.date(GeneralLedger.transaction_date) >= start_date)
    if end_date:
        query = query.where(func.date(GeneralLedger.transaction_date) <= end_date)
    
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Pagination
    query = query.order_by(desc(GeneralLedger.transaction_date))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    entries = []
    for row in rows:
        transaction_type_label = "Purchase" if row.GeneralLedger.source == TransactionSource.INVENTORY_PURCHASE else "Sale"
        
        entries.append({
            "id": row.GeneralLedger.id,
            "date": row.GeneralLedger.transaction_date.strftime("%Y-%m-%d"),
            "entry_number": row.entry_number,
            "transaction_type": transaction_type_label,
            "account": row.account_name,
            "description": row.description,
            "debit": float(row.GeneralLedger.debit) if row.GeneralLedger.debit else 0,
            "credit": float(row.GeneralLedger.credit) if row.GeneralLedger.credit else 0,
            "source_id": row.GeneralLedger.source_id
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
        "summary": {
            "total_purchases": sum(e["debit"] for e in entries if e["transaction_type"] == "Purchase"),
            "total_sales": sum(e["credit"] for e in entries if e["transaction_type"] == "Sale")
        }
    }


# ============================================
# 6. SETTLEMENTS TAB - Network & Trainer Payouts
# ============================================



@router.get("/settlements", summary="Get settlement entries")
async def get_settlement_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    settlement_type: Optional[str] = Query(None, description="network_in, network_out, branch_purchase, inventory_purchase, payroll, other"),
    status: Optional[str] = Query(None, description="pending, completed"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get all settlement entries for the center, filtered by type, status, and date.
    Includes other charges (miscellaneous income/expense) in the results.
    Membership revenue is never included.
    """
    center_id = current_admin["center_id"]

    # Only allow these sources in settlements
    settlement_sources = [
        TransactionSource.BRANCH_PURCHASE.value,
        TransactionSource.NETWORK_IN.value,
        TransactionSource.NETWORK_OUT.value,
        TransactionSource.INVENTORY_PURCHASE.value,
        TransactionSource.PAYROLL.value,
        TransactionSource.OTHER_CHARGES.value,
        TransactionSource.GENERAL_EXPENSE.value,
        TransactionSource.GENERAL_INCOME.value
    ]

    # Map settlement_type to TransactionSource
    settlement_type_map = {
        "branch_purchase": TransactionSource.BRANCH_PURCHASE.value,
        "network_in": TransactionSource.NETWORK_IN.value,
        "network_out": TransactionSource.NETWORK_OUT.value,
        "inventory_purchase": TransactionSource.INVENTORY_PURCHASE.value,
        "payroll": TransactionSource.PAYROLL.value,
        "other": [
            TransactionSource.OTHER_CHARGES.value,
            TransactionSource.GENERAL_EXPENSE.value,
            TransactionSource.GENERAL_INCOME.value
        ]
    }

    # Always restrict to settlement sources
    query = select(JournalEntry).options(selectinload(JournalEntry.lines)).where(
        JournalEntry.center_id == center_id,
        JournalEntry.source.in_(settlement_sources)
    )

    # Filter by settlement_type
    if settlement_type:
        mapped = settlement_type_map.get(settlement_type)
        if isinstance(mapped, list):
            query = query.where(JournalEntry.source.in_(mapped))
        elif mapped:
            query = query.where(JournalEntry.source == mapped)

    # Filter by status
    if status:
        if status == "pending":
            query = query.where(JournalEntry.status == EntryStatus.DRAFT.value)
        elif status == "completed":
            query = query.where(JournalEntry.status == EntryStatus.POSTED.value)

    # Filter by date
    if start_date:
        query = query.where(JournalEntry.entry_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.where(JournalEntry.entry_date <= datetime.combine(end_date, datetime.max.time()))

    # Total count (must not include order_by)
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_count = total_result.scalar_one()

    # Order and paginate
    query = query.order_by(JournalEntry.entry_date.desc())
    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    entries = result.scalars().all()

    # For each entry, if it's an "other charge", add a breakdown of income/expense
    data = []
    for entry in entries:
        other_charges_breakdown = None
        if entry.source in [
            TransactionSource.OTHER_CHARGES.value,
            TransactionSource.GENERAL_EXPENSE.value,
            TransactionSource.GENERAL_INCOME.value,
            "other_charges", "general_expense", "general_income"
        ]:
            period_start = entry.entry_date.date()
            period_end = entry.entry_date.date()
            other_charges = await get_other_charges_for_period(center_id, period_start, period_end, db)
            other_charges_breakdown = {
                "other_charges_income": other_charges["other_charges_income"],
                "other_charges_expense": other_charges["other_charges_expense"]
            }

        data.append({
            "id": str(entry.id),
            "entry_number": entry.entry_number,
            "entry_date": entry.entry_date.isoformat(),
            "description": entry.description,
            "source": entry.source,
            "source_id": entry.source_id,
            "status": entry.status,
            "posted_at": entry.posted_at.isoformat() if entry.posted_at else None,
            "total_debit": float(entry.total_debit),
            "total_credit": float(entry.total_credit),
            "created_by": str(entry.created_by) if entry.created_by else None,
            "lines": [
                {
                    "account_id": line.account_id,
                    "description": line.description,
                    "debit": float(line.debit),
                    "credit": float(line.credit)
                }
                for line in entry.lines
            ],
            "other_charges_breakdown": other_charges_breakdown
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total_count,
        "data": data
    }


# ============================================
# 7. TAXES TAB - GST & Statutory Liabilities
# ============================================

@router.get("/taxes", summary="Get tax entries")
async def get_tax_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    tax_type: Optional[str] = Query(None, description="GST, TDS"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get all tax-related entries
    Shows: Date, Tax Type, Taxable Amount, Tax Rate, Tax Amount, Status
    """
    center_id = current_admin["center_id"]
    
    # Query from TaxLedger
    query = select(
        TaxLedger,
        JournalEntry.entry_number.label('entry_number')
    ).join(
        JournalEntry, TaxLedger.journal_entry_id == JournalEntry.id
    ).where(TaxLedger.center_id == UUID(center_id))
    
    # Filters
    if tax_type:
        query = query.where(TaxLedger.tax_type == tax_type)
    
    if start_date:
        query = query.where(func.date(TaxLedger.transaction_date) >= start_date)
    if end_date:
        query = query.where(func.date(TaxLedger.transaction_date) <= end_date)
    
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Pagination
    query = query.order_by(desc(TaxLedger.transaction_date))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    rows = result.all()
    
    entries = []
    for row in rows:
        entries.append({
            "id": row.TaxLedger.id,
            "date": row.TaxLedger.transaction_date.strftime("%Y-%m-%d"),
            "entry_number": row.entry_number,
            "tax_type": row.TaxLedger.tax_type,
            "tax_rate": float(row.TaxLedger.tax_rate),
            "taxable_amount": float(row.TaxLedger.taxable_amount),
            "tax_amount": float(row.TaxLedger.tax_amount),
            "source": row.TaxLedger.source,
            "source_id": row.TaxLedger.source_id
        })
    
    # Calculate tax payable (liability accounts)
    gst_payable_query = select(
        func.sum(GeneralLedger.credit - GeneralLedger.debit).label('gst_payable')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        ChartOfAccounts.code == "2200"  # GST Payable
    )
    gst_result = await db.execute(gst_payable_query)
    gst_payable = gst_result.scalar() or 0
    
    tds_payable_query = select(
        func.sum(GeneralLedger.credit - GeneralLedger.debit).label('tds_payable')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        ChartOfAccounts.code == "2300"  # TDS Payable
    )
    tds_result = await db.execute(tds_payable_query)
    tds_payable = tds_result.scalar() or 0
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
        "summary": {
            "total_tax_collected": sum(e["tax_amount"] for e in entries),
            "gst_payable": float(gst_payable),
            "tds_payable": float(tds_payable),
            "total_payable": float(gst_payable) + float(tds_payable)
        }
    }


# ============================================
# 8. OVERVIEW/DASHBOARD - Financial Summary
# ============================================

@router.get("/overview", summary="Get financial overview/dashboard")
async def get_financial_overview(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    Get financial overview with key metrics
    Shows: Total Income, Total Expenses, Net Profit, Outstanding Receivables, etc.
    """
    center_id = current_admin["center_id"]
    
    # Default to current month if no dates provided
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()
    
    # Total Income (Revenue accounts)
    income_query = select(
        func.sum(GeneralLedger.credit - GeneralLedger.debit).label('total_income')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        ChartOfAccounts.account_type == AccountType.REVENUE,
        func.date(GeneralLedger.transaction_date) >= start_date,
        func.date(GeneralLedger.transaction_date) <= end_date
    )
    income_result = await db.execute(income_query)
    total_income = income_result.scalar() or 0
    
    # Total Expenses
    expense_query = select(
        func.sum(GeneralLedger.debit - GeneralLedger.credit).label('total_expenses')
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        ChartOfAccounts.account_type == AccountType.EXPENSE,
        func.date(GeneralLedger.transaction_date) >= start_date,
        func.date(GeneralLedger.transaction_date) <= end_date
    )
    expense_result = await db.execute(expense_query)
    total_expenses = expense_result.scalar() or 0
    
    # Cash Balance
    cash_query = select(GeneralLedger.balance).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        or_(ChartOfAccounts.code == "1100", ChartOfAccounts.code == "1200")
    ).order_by(desc(GeneralLedger.id)).limit(1)
    cash_result = await db.execute(cash_query)
    cash_balance = cash_result.scalar() or 0
    
    # Accounts Receivable
    ar_query = select(GeneralLedger.balance).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        or_(ChartOfAccounts.code == "1300", ChartOfAccounts.code == "1310")
    ).order_by(desc(GeneralLedger.id)).limit(1)
    ar_result = await db.execute(ar_query)
    accounts_receivable = ar_result.scalar() or 0
    
    # Tax Payable
    tax_payable_query = select(GeneralLedger.balance).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).where(
        GeneralLedger.center_id == UUID(center_id),
        or_(ChartOfAccounts.code == "2200", ChartOfAccounts.code == "2300")
    ).order_by(desc(GeneralLedger.id)).limit(1)
    tax_result = await db.execute(tax_payable_query)
    tax_payable = tax_result.scalar() or 0
    
    return {
        "period": {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        },
        "income": {
            "total": float(total_income),
            "membership": 0,  # Can break down by account
            "inventory": 0,
            "network": 0,
            "other": 0
        },
        "expenses": {
            "total": float(total_expenses),
            "salary": 0,  # Can break down by account
            "rent": 0,
            "utilities": 0,
            "other": 0
        },
        "profitability": {
            "net_profit": float(total_income - total_expenses),
            "profit_margin": float((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
        },
        "balances": {
            "cash": float(cash_balance),
            "accounts_receivable": float(accounts_receivable),
            "tax_payable": float(tax_payable)
        }
    }