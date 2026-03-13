from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Boolean, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ENUM
from datetime import datetime
import enum
from app.core.models.base import Base, AuditMixin


class AccountType(str, enum.Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"


class EntryStatus(str, enum.Enum):
    DRAFT = "draft"
    POSTED = "posted"
    REVERSED = "reversed"


class TransactionSource(str, enum.Enum):
    MEMBERSHIP = "membership"
    INVENTORY_SALE = "inventory_sale"
    INVENTORY_PURCHASE = "inventory_purchase"
    PAYROLL = "payroll"
    NETWORK_SETTLEMENT = "network_settlement"
    GENERAL_EXPENSE = "general_expense"
    MANUAL = "manual"


# Create PostgreSQL ENUM types with schema specified
account_type_enum = ENUM(
    AccountType,
    name='account_type',
    schema='accounts',
    create_type=False  # Don't create, already exists from migration
)

entry_status_enum = ENUM(
    EntryStatus,
    name='entry_status',
    schema='accounts',
    create_type=False
)

transaction_source_enum = ENUM(
    TransactionSource,
    name='transaction_source',
    schema='accounts',
    create_type=False
)


# Chart of Accounts - CENTER-SPECIFIC
class ChartOfAccounts(Base, AuditMixin):
    __tablename__ = "chart_of_accounts"
    __table_args__ = {'schema': 'accounts'}

    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(UUID(as_uuid=True), ForeignKey('center.centers.id'), nullable=False, index=True)
    code = Column(String(20), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    account_type = Column(account_type_enum, nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey('accounts.chart_of_accounts.id'), nullable=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    center = relationship("Center", foreign_keys=[center_id])
    parent = relationship("ChartOfAccounts", remote_side=[id], backref="children")
    ledger_entries = relationship("GeneralLedger", back_populates="account")


# Journal Entry Header
class JournalEntry(Base, AuditMixin):
    __tablename__ = "journal_entries"
    __table_args__ = {'schema': 'accounts'}

    id = Column(Integer, primary_key=True, index=True)
    entry_number = Column(String(50), nullable=False, index=True)
    entry_date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    description = Column(Text, nullable=False)
    
    source = Column(transaction_source_enum, nullable=False, index=True)
    source_id = Column(String(50), index=True)
    center_id = Column(UUID(as_uuid=True), ForeignKey('center.centers.id'), nullable=False, index=True)
    
    status = Column(entry_status_enum, default=EntryStatus.DRAFT, index=True)
    posted_at = Column(DateTime)
    posted_by = Column(Integer)
    
    total_debit = Column(Numeric(15, 2), nullable=False)
    total_credit = Column(Numeric(15, 2), nullable=False)
    
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    center = relationship("Center", foreign_keys=[center_id])
    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")


# Journal Entry Lines
class JournalEntryLine(Base, AuditMixin):
    __tablename__ = "journal_entry_lines"
    __table_args__ = (
        Index('idx_je_line_account_date', 'account_id', 'entry_date'),
        {'schema': 'accounts'}
    )

    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey('accounts.journal_entries.id'), nullable=False)
    account_id = Column(Integer, ForeignKey('accounts.chart_of_accounts.id'), nullable=False)
    
    entry_date = Column(DateTime, nullable=False, index=True)
    description = Column(Text)
    
    debit = Column(Numeric(15, 2), default=0)
    credit = Column(Numeric(15, 2), default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    journal_entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("ChartOfAccounts")


# General Ledger (posted entries only)
class GeneralLedger(Base, AuditMixin):
    __tablename__ = "general_ledger"
    __table_args__ = (
        Index('idx_gl_account_date', 'account_id', 'transaction_date'),
        Index('idx_gl_center_account', 'center_id', 'account_id'),
        {'schema': 'accounts'}
    )

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey('accounts.chart_of_accounts.id'), nullable=False)
    journal_entry_id = Column(Integer, ForeignKey('accounts.journal_entries.id'), nullable=False)
    journal_entry_line_id = Column(Integer, ForeignKey('accounts.journal_entry_lines.id'), nullable=False)
    
    transaction_date = Column(DateTime, nullable=False, index=True)
    description = Column(Text)
    
    debit = Column(Numeric(15, 2), default=0)
    credit = Column(Numeric(15, 2), default=0)
    balance = Column(Numeric(15, 2), nullable=False)
    
    center_id = Column(UUID(as_uuid=True), ForeignKey('center.centers.id'), nullable=False, index=True)
    source = Column(transaction_source_enum, nullable=False)
    source_id = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    center = relationship("Center", foreign_keys=[center_id])
    account = relationship("ChartOfAccounts", back_populates="ledger_entries")
    journal_entry = relationship("JournalEntry")
    journal_entry_line = relationship("JournalEntryLine")


# Fiscal Period - CENTER-SPECIFIC
class FiscalPeriod(Base, AuditMixin):
    __tablename__ = "fiscal_periods"
    __table_args__ = {'schema': 'accounts'}

    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(UUID(as_uuid=True), ForeignKey('center.centers.id'), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    is_closed = Column(Boolean, default=False)
    closed_at = Column(DateTime)
    closed_by = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    center = relationship("Center", foreign_keys=[center_id])


# Tax Ledger
class TaxLedger(Base, AuditMixin):
    __tablename__ = "tax_ledger"
    __table_args__ = (
        Index('idx_tax_ledger_date', 'transaction_date'),
        Index('idx_tax_ledger_center', 'center_id'),
        {'schema': 'accounts'}
    )

    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey('accounts.journal_entries.id'), nullable=False)
    
    center_id = Column(UUID(as_uuid=True), ForeignKey('center.centers.id'), nullable=False, index=True)
    transaction_date = Column(DateTime, nullable=False)
    
    tax_type = Column(String(50), nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=False)
    
    taxable_amount = Column(Numeric(15, 2), nullable=False)
    tax_amount = Column(Numeric(15, 2), nullable=False)
    
    source = Column(transaction_source_enum, nullable=False)
    source_id = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    center = relationship("Center", foreign_keys=[center_id])
    journal_entry = relationship("JournalEntry")