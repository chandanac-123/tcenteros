from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.accounts.models.models import (
    ChartOfAccounts, JournalEntry, JournalEntryLine, 
    GeneralLedger, TaxLedger, AccountType, EntryStatus, TransactionSource
)
from app.accounts.schema.schema import *

router = APIRouter()


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
    return result.scalars().all()


@router.post("/chart-of-accounts", response_model=ChartOfAccountsResponse)
async def create_account(
    account_data: ChartOfAccountsCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Create new account"""
    
    # Check if code already exists for this center
    existing = await db.execute(
        select(ChartOfAccounts).where(
            and_(
                ChartOfAccounts.code == account_data.code,
                ChartOfAccounts.center_id == UUID(account_data.center_id)
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Account code already exists for this center")
    
    account = ChartOfAccounts(**account_data.dict())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    
    return account


# ============================================
# JOURNAL ENTRY APIs
# ============================================

@router.post("/journal-entries", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry_data: JournalEntryCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Create and post journal entry"""
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    return journal_entry


@router.get("/journal-entries", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    center_id: str,
    source: Optional[TransactionSource] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get journal entries"""
    
    query = select(JournalEntry).where(JournalEntry.center_id == UUID(center_id))
    
    if source:
        query = query.where(JournalEntry.source == source)
    if start_date:
        query = query.where(JournalEntry.entry_date >= start_date)
    if end_date:
        query = query.where(JournalEntry.entry_date <= end_date)
    
    query = query.order_by(desc(JournalEntry.entry_date)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    return result.scalars().all()


# ============================================
# GENERAL LEDGER APIs
# ============================================

@router.get("/ledger", response_model=List[GeneralLedgerResponse])
async def get_general_ledger(
    center_id: str,
    account_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get general ledger entries"""
    
    query = select(
        GeneralLedger,
        ChartOfAccounts.code.label('account_code'),
        ChartOfAccounts.name.label('account_name'),
        JournalEntry.entry_number
    ).join(
        ChartOfAccounts, GeneralLedger.account_id == ChartOfAccounts.id
    ).join(
        JournalEntry, GeneralLedger.journal_entry_id == JournalEntry.id
    ).where(GeneralLedger.center_id == UUID(center_id))
    
    if account_id:
        query = query.where(GeneralLedger.account_id == account_id)
    if start_date:
        query = query.where(GeneralLedger.transaction_date >= start_date)
    if end_date:
        query = query.where(GeneralLedger.transaction_date <= end_date)
    
    query = query.order_by(desc(GeneralLedger.transaction_date)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        GeneralLedgerResponse(
            id=row.GeneralLedger.id,
            account_code=row.account_code,
            account_name=row.account_name,
            transaction_date=row.GeneralLedger.transaction_date,
            description=row.GeneralLedger.description,
            debit=row.GeneralLedger.debit,
            credit=row.GeneralLedger.credit,
            balance=row.GeneralLedger.balance,
            source=row.GeneralLedger.source,
            entry_number=row.entry_number
        )
        for row in rows
    ]


# ============================================
# FINANCIAL REPORTS
# ============================================

@router.get("/reports/trial-balance", response_model=TrialBalanceResponse)
async def get_trial_balance(
    center_id: str,
    as_of_date: datetime = Query(default_factory=datetime.utcnow),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get trial balance"""
    
    subquery = select(
        GeneralLedger.account_id,
        func.sum(GeneralLedger.debit).label('total_debit'),
        func.sum(GeneralLedger.credit).label('total_credit')
    ).where(
        and_(
            GeneralLedger.center_id == UUID(center_id),
            GeneralLedger.transaction_date <= as_of_date
        )
    ).group_by(GeneralLedger.account_id).subquery()
    
    query = select(
        ChartOfAccounts.code,
        ChartOfAccounts.name,
        ChartOfAccounts.account_type,
        subquery.c.total_debit,
        subquery.c.total_credit
    ).join(
        subquery, ChartOfAccounts.id == subquery.c.account_id
    ).order_by(ChartOfAccounts.code)
    
    result = await db.execute(query)
    rows = result.all()
    
    items = []
    grand_total_debit = Decimal(0)
    grand_total_credit = Decimal(0)
    
    for row in rows:
        debit = row.total_debit or Decimal(0)
        credit = row.total_credit or Decimal(0)
        
        if row.account_type in [AccountType.ASSET, AccountType.EXPENSE]:
            net = debit - credit
            item_debit = net if net > 0 else Decimal(0)
            item_credit = abs(net) if net < 0 else Decimal(0)
        else:
            net = credit - debit
            item_credit = net if net > 0 else Decimal(0)
            item_debit = abs(net) if net < 0 else Decimal(0)
        
        items.append(TrialBalanceItem(
            account_code=row.code,
            account_name=row.name,
            account_type=row.account_type,
            debit=item_debit,
            credit=item_credit
        ))
        
        grand_total_debit += item_debit
        grand_total_credit += item_credit
    
    return TrialBalanceResponse(
        as_of_date=as_of_date,
        items=items,
        total_debit=grand_total_debit,
        total_credit=grand_total_credit,
        is_balanced=abs(grand_total_debit - grand_total_credit) < Decimal('0.01')
    )


@router.get("/reports/income-statement", response_model=IncomeStatementResponse)
async def get_income_statement(
    center_id: str,
    start_date: datetime,
    end_date: datetime,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get income statement (P&L)"""
    
    # Revenue
    revenue_query = select(
        ChartOfAccounts.code,
        ChartOfAccounts.name,
        func.sum(GeneralLedger.credit - GeneralLedger.debit).label('amount')
    ).join(
        GeneralLedger, ChartOfAccounts.id == GeneralLedger.account_id
    ).where(
        and_(
            ChartOfAccounts.account_type == AccountType.REVENUE,
            GeneralLedger.center_id == UUID(center_id),
            GeneralLedger.transaction_date >= start_date,
            GeneralLedger.transaction_date <= end_date
        )
    ).group_by(ChartOfAccounts.code, ChartOfAccounts.name)
    
    revenue_result = await db.execute(revenue_query)
    revenue_items = [
        IncomeStatementItem(account_code=row.code, account_name=row.name, amount=row.amount or Decimal(0))
        for row in revenue_result.all()
    ]
    
    # Expenses
    expense_query = select(
        ChartOfAccounts.code,
        ChartOfAccounts.name,
        func.sum(GeneralLedger.debit - GeneralLedger.credit).label('amount')
    ).join(
        GeneralLedger, ChartOfAccounts.id == GeneralLedger.account_id
    ).where(
        and_(
            ChartOfAccounts.account_type == AccountType.EXPENSE,
            GeneralLedger.center_id == UUID(center_id),
            GeneralLedger.transaction_date >= start_date,
            GeneralLedger.transaction_date <= end_date
        )
    ).group_by(ChartOfAccounts.code, ChartOfAccounts.name)
    
    expense_result = await db.execute(expense_query)
    expense_items = [
        IncomeStatementItem(account_code=row.code, account_name=row.name, amount=row.amount or Decimal(0))
        for row in expense_result.all()
    ]
    
    total_revenue = sum(item.amount for item in revenue_items)
    total_expenses = sum(item.amount for item in expense_items)
    
    return IncomeStatementResponse(
        start_date=start_date,
        end_date=end_date,
        revenue=revenue_items,
        expenses=expense_items,
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_profit=total_revenue - total_expenses
    )


@router.get("/reports/balance-sheet", response_model=BalanceSheetResponse)
async def get_balance_sheet(
    center_id: str,
    as_of_date: datetime = Query(default_factory=datetime.utcnow),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get balance sheet"""
    
    async def get_account_balances(account_type: AccountType):
        query = select(
            ChartOfAccounts.code,
            ChartOfAccounts.name,
            func.sum(
                func.case(
                    (account_type.value in ['asset', 'expense'], GeneralLedger.debit - GeneralLedger.credit),
                    else_=GeneralLedger.credit - GeneralLedger.debit
                )
            ).label('balance')
        ).join(
            GeneralLedger, ChartOfAccounts.id == GeneralLedger.account_id
        ).where(
            and_(
                ChartOfAccounts.account_type == account_type,
                GeneralLedger.center_id == UUID(center_id),
                GeneralLedger.transaction_date <= as_of_date
            )
        ).group_by(ChartOfAccounts.code, ChartOfAccounts.name)
        
        result = await db.execute(query)
        return [
            IncomeStatementItem(account_code=row.code, account_name=row.name, amount=row.balance or Decimal(0))
            for row in result.all()
        ]
    
    assets = await get_account_balances(AccountType.ASSET)
    liabilities = await get_account_balances(AccountType.LIABILITY)
    equity = await get_account_balances(AccountType.EQUITY)
    
    total_assets = sum(item.amount for item in assets)
    total_liabilities = sum(item.amount for item in liabilities)
    total_equity = sum(item.amount for item in equity)
    
    return BalanceSheetResponse(
        as_of_date=as_of_date,
        assets=assets,
        liabilities=liabilities,
        equity=equity,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        total_equity=total_equity,
        is_balanced=abs(total_assets - (total_liabilities + total_equity)) < Decimal('0.01')
    )


# ============================================
# TAX LEDGER
# ============================================

@router.get("/tax-ledger", response_model=List[TaxLedgerResponse])
async def get_tax_ledger(
    center_id: str,
    tax_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Get tax ledger entries"""
    
    query = select(TaxLedger).where(TaxLedger.center_id == UUID(center_id))
    
    if tax_type:
        query = query.where(TaxLedger.tax_type == tax_type)
    if start_date:
        query = query.where(TaxLedger.transaction_date >= start_date)
    if end_date:
        query = query.where(TaxLedger.transaction_date <= end_date)
    
    query = query.order_by(desc(TaxLedger.transaction_date)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    return result.scalars().all()


# ============================================
# AUTOMATED TRANSACTION RECORDING
# ============================================

@router.post("/auto-record/membership-sale")
async def auto_record_membership_sale(
    data: MembershipSaleRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Auto-record membership sale: Dr Cash/Bank, Cr Membership Income, Cr GST"""
    
    center_id = UUID(data.center_id)
    transaction_date = data.transaction_date or datetime.utcnow()
    
    # Get accounts
    cash_account = await get_account_by_code(db, '1100' if data.payment_method == 'cash' else '1200', center_id)
    membership_income = await get_account_by_code(db, '4100', center_id)
    gst_payable = await get_account_by_code(db, '2310', center_id)
    
    if not all([cash_account, membership_income, gst_payable]):
        raise HTTPException(status_code=400, detail="Required accounts not found. Initialize chart of accounts first.")
    
    revenue_amount = data.amount - data.tax_amount
    
    # Create journal entry
    entry_data = JournalEntryCreate(
        entry_date=transaction_date,
        description=f"Membership sale - {data.source_id}",
        source=TransactionSource.MEMBERSHIP,
        source_id=data.source_id,
        center_id=data.center_id,
        lines=[
            JournalEntryLineCreate(
                account_id=cash_account.id,
                description=f"Payment received via {data.payment_method}",
                debit=data.amount,
                credit=Decimal(0)
            ),
            JournalEntryLineCreate(
                account_id=membership_income.id,
                description="Membership revenue",
                debit=Decimal(0),
                credit=revenue_amount
            ),
            JournalEntryLineCreate(
                account_id=gst_payable.id,
                description=f"GST @ {data.tax_rate}%",
                debit=Decimal(0),
                credit=data.tax_amount
            )
        ]
    )
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    
    # Record tax
    await record_tax(
        db=db,
        journal_entry_id=journal_entry.id,
        center_id=center_id,
        transaction_date=transaction_date,
        tax_type="GST",
        tax_rate=data.tax_rate,
        taxable_amount=revenue_amount,
        tax_amount=data.tax_amount,
        source=TransactionSource.MEMBERSHIP,
        source_id=data.source_id
    )
    
    return {"message": "Membership sale recorded", "entry_number": journal_entry.entry_number}


@router.post("/auto-record/inventory-sale")
async def auto_record_inventory_sale(
    data: InventorySaleRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Auto-record inventory sale: Dr Cash, Cr Sales Income, Cr GST; Dr COGS, Cr Inventory"""
    
    center_id = UUID(data.center_id)
    transaction_date = data.transaction_date or datetime.utcnow()
    
    # Get accounts
    cash_account = await get_account_by_code(db, '1100' if data.payment_method == 'cash' else '1200', center_id)
    sales_income = await get_account_by_code(db, '4200', center_id)
    gst_payable = await get_account_by_code(db, '2310', center_id)
    cogs_account = await get_account_by_code(db, '5400', center_id)
    inventory_account = await get_account_by_code(db, '1400', center_id)
    
    if not all([cash_account, sales_income, gst_payable, cogs_account, inventory_account]):
        raise HTTPException(status_code=400, detail="Required accounts not found")
    
    revenue_amount = data.sale_amount - data.tax_amount
    
    entry_data = JournalEntryCreate(
        entry_date=transaction_date,
        description=f"Inventory sale - {data.source_id}",
        source=TransactionSource.INVENTORY_SALE,
        source_id=data.source_id,
        center_id=data.center_id,
        lines=[
            JournalEntryLineCreate(account_id=cash_account.id, debit=data.sale_amount, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=sales_income.id, debit=Decimal(0), credit=revenue_amount),
            JournalEntryLineCreate(account_id=gst_payable.id, debit=Decimal(0), credit=data.tax_amount),
            JournalEntryLineCreate(account_id=cogs_account.id, debit=data.cogs_amount, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=inventory_account.id, debit=Decimal(0), credit=data.cogs_amount)
        ]
    )
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    
    await record_tax(
        db=db, journal_entry_id=journal_entry.id, center_id=center_id,
        transaction_date=transaction_date, tax_type="GST", tax_rate=data.tax_rate,
        taxable_amount=revenue_amount, tax_amount=data.tax_amount,
        source=TransactionSource.INVENTORY_SALE, source_id=data.source_id
    )
    
    return {"message": "Inventory sale recorded", "entry_number": journal_entry.entry_number}


@router.post("/auto-record/inventory-purchase")
async def auto_record_inventory_purchase(
    data: InventoryPurchaseRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Auto-record inventory purchase: Dr Inventory, Cr Cash/Payable"""
    
    center_id = UUID(data.center_id)
    transaction_date = data.transaction_date or datetime.utcnow()
    
    inventory_account = await get_account_by_code(db, '1400', center_id)
    payment_account = await get_account_by_code(db, '1100' if data.payment_method == 'cash' else '2110', center_id)
    
    if not all([inventory_account, payment_account]):
        raise HTTPException(status_code=400, detail="Required accounts not found")
    
    entry_data = JournalEntryCreate(
        entry_date=transaction_date,
        description=f"Inventory purchase - {data.source_id}",
        source=TransactionSource.INVENTORY_PURCHASE,
        source_id=data.source_id,
        center_id=data.center_id,
        lines=[
            JournalEntryLineCreate(account_id=inventory_account.id, debit=data.purchase_amount, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=payment_account.id, debit=Decimal(0), credit=data.purchase_amount)
        ]
    )
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    return {"message": "Inventory purchase recorded", "entry_number": journal_entry.entry_number}


@router.post("/auto-record/payroll")
async def auto_record_payroll(
    data: PayrollRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Auto-record payroll: Dr Salary Expense, Cr Salaries Payable, Cr Cash, Cr TDS"""
    
    center_id = UUID(data.center_id)
    transaction_date = data.transaction_date or datetime.utcnow()
    
    salary_expense = await get_account_by_code(db, '5100', center_id)
    salaries_payable = await get_account_by_code(db, '2200', center_id)
    cash_account = await get_account_by_code(db, '1200', center_id)
    tds_payable = await get_account_by_code(db, '2320', center_id)
    
    if not all([salary_expense, salaries_payable, cash_account, tds_payable]):
        raise HTTPException(status_code=400, detail="Required accounts not found")
    
    entry_data = JournalEntryCreate(
        entry_date=transaction_date,
        description=f"Payroll - {data.source_id}",
        source=TransactionSource.PAYROLL,
        source_id=data.source_id,
        center_id=data.center_id,
        lines=[
            JournalEntryLineCreate(account_id=salary_expense.id, debit=data.gross_salary, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=salaries_payable.id, debit=Decimal(0), credit=data.gross_salary),
            JournalEntryLineCreate(account_id=salaries_payable.id, debit=data.gross_salary, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=cash_account.id, debit=Decimal(0), credit=data.net_salary),
            JournalEntryLineCreate(account_id=tds_payable.id, debit=Decimal(0), credit=data.deductions)
        ]
    )
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    return {"message": "Payroll recorded", "entry_number": journal_entry.entry_number}


@router.post("/auto-record/network-income")
async def auto_record_network_income(
    data: NetworkIncomeRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Auto-record network income: Dr Network Receivable, Cr Network Income, Dr Platform Fee Expense"""
    
    center_id = UUID(data.center_id)
    transaction_date = data.transaction_date or datetime.utcnow()
    
    network_receivable = await get_account_by_code(db, '1310', center_id)
    network_income = await get_account_by_code(db, '4300', center_id)
    platform_fee_expense = await get_account_by_code(db, '5500', center_id)
    
    if not all([network_receivable, network_income, platform_fee_expense]):
        raise HTTPException(status_code=400, detail="Required accounts not found")
    
    entry_data = JournalEntryCreate(
        entry_date=transaction_date,
        description=f"Network visit income - {data.source_id}",
        source=TransactionSource.NETWORK_SETTLEMENT,
        source_id=data.source_id,
        center_id=data.center_id,
        lines=[
            JournalEntryLineCreate(account_id=network_receivable.id, debit=data.net_income, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=platform_fee_expense.id, debit=data.platform_fee, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=network_income.id, debit=Decimal(0), credit=data.gross_income)
        ]
    )
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    return {"message": "Network income recorded", "entry_number": journal_entry.entry_number}


@router.post("/auto-record/general-expense")
async def auto_record_general_expense(
    data: GeneralExpenseRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """Auto-record general expense: Dr Expense, Cr Cash"""
    
    center_id = UUID(data.center_id)
    transaction_date = data.transaction_date or datetime.utcnow()
    
    expense_codes = {'rent': '5200', 'utilities': '5300', 'general': '5600'}
    expense_account = await get_account_by_code(db, expense_codes.get(data.expense_type, '5600'), center_id)
    cash_account = await get_account_by_code(db, '1100' if data.payment_method == 'cash' else '1200', center_id)
    
    if not all([expense_account, cash_account]):
        raise HTTPException(status_code=400, detail="Required accounts not found")
    
    entry_data = JournalEntryCreate(
        entry_date=transaction_date,
        description=f"{data.expense_type.title()} expense - {data.source_id}",
        source=TransactionSource.GENERAL_EXPENSE,
        source_id=data.source_id,
        center_id=data.center_id,
        lines=[
            JournalEntryLineCreate(account_id=expense_account.id, debit=data.amount, credit=Decimal(0)),
            JournalEntryLineCreate(account_id=cash_account.id, debit=Decimal(0), credit=data.amount)
        ]
    )
    
    journal_entry = await create_and_post_journal_entry(db, entry_data, current_user.id)
    return {"message": f"{data.expense_type.title()} expense recorded", "entry_number": journal_entry.entry_number}