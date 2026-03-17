from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.accounts.models.models import AccountType, EntryStatus, TransactionSource
from uuid import UUID


# ============================================
# Chart of Accounts Schemas
# ============================================

class ChartOfAccountsBase(BaseModel):
    code: str
    name: str
    account_type: AccountType
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True


class ChartOfAccountsCreate(ChartOfAccountsBase):
    center_id: str


class ChartOfAccountsResponse(BaseModel):
    id: int
    center_id: UUID  # Change from str to UUID (Pydantic will serialize to string in JSON)
    code: str
    name: str
    account_type: str  # or AccountType enum
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool
    is_system: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 


# ============================================
# Journal Entry Schemas
# ============================================

class JournalEntryLineCreate(BaseModel):
    account_id: int
    description: Optional[str] = None
    debit: Decimal = Decimal(0)
    credit: Decimal = Decimal(0)
    
    @validator('debit', 'credit')
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError("Amount cannot be negative")
        return v


class JournalEntryLineResponse(JournalEntryLineCreate):
    id: int
    journal_entry_id: int
    entry_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class JournalEntryCreate(BaseModel):
    entry_date: datetime
    description: str
    source: TransactionSource
    source_id: Optional[str] = None
    center_id: str
    lines: List[JournalEntryLineCreate]
    
    @validator('lines')
    def validate_double_entry(cls, v):
        total_debit = sum(line.debit for line in v)
        total_credit = sum(line.credit for line in v)
        
        if abs(total_debit - total_credit) > Decimal('0.01'):
            raise ValueError(f"Debits ({total_debit}) must equal Credits ({total_credit})")
        
        if len(v) < 2:
            raise ValueError("At least 2 lines required for double-entry")
        
        return v


class JournalEntryResponse(BaseModel):
    id: int
    entry_number: str
    entry_date: datetime
    description: str
    source: TransactionSource
    source_id: Optional[str]
    center_id: str
    status: EntryStatus
    total_debit: Decimal
    total_credit: Decimal
    created_by: int
    created_at: datetime
    posted_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============================================
# Ledger & Report Schemas
# ============================================

class GeneralLedgerResponse(BaseModel):
    id: int
    account_code: str
    account_name: str
    transaction_date: datetime
    description: Optional[str]
    debit: Decimal
    credit: Decimal
    balance: Decimal
    source: TransactionSource
    entry_number: str
    
    class Config:
        from_attributes = True


class TrialBalanceItem(BaseModel):
    account_code: str
    account_name: str
    account_type: AccountType
    debit: Decimal
    credit: Decimal


class TrialBalanceResponse(BaseModel):
    as_of_date: datetime
    items: List[TrialBalanceItem]
    total_debit: Decimal
    total_credit: Decimal
    is_balanced: bool


class IncomeStatementItem(BaseModel):
    account_code: str
    account_name: str
    amount: Decimal


class IncomeStatementResponse(BaseModel):
    start_date: datetime
    end_date: datetime
    revenue: List[IncomeStatementItem]
    expenses: List[IncomeStatementItem]
    total_revenue: Decimal
    total_expenses: Decimal
    net_profit: Decimal


class BalanceSheetResponse(BaseModel):
    as_of_date: datetime
    assets: List[IncomeStatementItem]
    liabilities: List[IncomeStatementItem]
    equity: List[IncomeStatementItem]
    total_assets: Decimal
    total_liabilities: Decimal
    total_equity: Decimal
    is_balanced: bool


class TaxLedgerResponse(BaseModel):
    id: int
    transaction_date: datetime
    tax_type: str
    tax_rate: Decimal
    taxable_amount: Decimal
    tax_amount: Decimal
    source: TransactionSource
    source_id: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================
# Automated Transaction Schemas
# ============================================

class MembershipSaleRequest(BaseModel):
    center_id: str
    amount: Decimal
    tax_amount: Decimal
    tax_rate: Decimal
    payment_method: str  # 'cash' or 'bank'
    source_id: str
    transaction_date: Optional[datetime] = None


class InventorySaleRequest(BaseModel):
    center_id: str
    sale_amount: Decimal
    tax_amount: Decimal
    tax_rate: Decimal
    cogs_amount: Decimal
    payment_method: str
    source_id: str
    transaction_date: Optional[datetime] = None


class InventoryPurchaseRequest(BaseModel):
    center_id: str
    purchase_amount: Decimal
    payment_method: str
    source_id: str
    transaction_date: Optional[datetime] = None


class PayrollRequest(BaseModel):
    center_id: str
    gross_salary: Decimal
    net_salary: Decimal
    deductions: Decimal
    source_id: str
    transaction_date: Optional[datetime] = None


class NetworkIncomeRequest(BaseModel):
    center_id: str
    gross_income: Decimal
    platform_fee: Decimal
    net_income: Decimal
    source_id: str
    transaction_date: Optional[datetime] = None


class GeneralExpenseRequest(BaseModel):
    center_id: str
    amount: Decimal
    expense_type: str  # 'rent', 'utilities', 'general'
    payment_method: str
    source_id: str
    transaction_date: Optional[datetime] = None