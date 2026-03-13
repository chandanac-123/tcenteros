# backend/app/accounts/helpers.py

from uuid import uuid4
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.accounts.models.models import (
    ChartOfAccounts, JournalEntry, JournalEntryLine, 
    GeneralLedger, TaxLedger, TransactionSource, EntryStatus
)
from app.billing.models.models import PaymentOrder


async def record_membership_sale(
    db: AsyncSession,
    payment_order: PaymentOrder,
    created_by: str
):
    """
    Record membership sale in accounting system.
    Entry:
        Dr 1100 Cash                     [total_amount]
            Cr 4000 Membership Revenue   [amount before tax]
            Cr 2200 GST Payable           [tax_amount]
    """
    center_id = payment_order.center_id
    
    # Fetch account codes
    accounts = await db.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.code.in_(['1100', '4000', '2200'])
        )
    )
    account_map = {acc.code: acc for acc in accounts.scalars().all()}
    
    if not all(code in account_map for code in ['1100', '4000', '2200']):
        raise ValueError("Required accounts not found for center")
    
    # Calculate amounts
    total_amount = Decimal(str(payment_order.total_amount))
    tax_amount = Decimal(str(payment_order.tax_amount or 0))
    revenue_amount = total_amount - tax_amount
    
    # Create journal entry
    journal_entry = JournalEntry(
        id=uuid4(),
        center_id=center_id,
        entry_date=datetime.utcnow(),
        source=TransactionSource.MEMBERSHIP,  # ✅ FIXED: changed from transaction_source
        source_id=payment_order.payment_order_id,  # ✅ FIXED: changed from reference_id
        description=f"Membership sale - Order #{str(payment_order.payment_order_id)[:8]}",
        status=EntryStatus.POSTED,
        created_by=created_by,
        updated_by=created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(journal_entry)
    await db.flush()
    
    # Create journal entry lines
    lines = [
        # Dr Cash
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['1100'].id,
            debit_amount=total_amount,
            credit_amount=Decimal('0'),
            description=f"Cash received - Membership payment",
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        # Cr Membership Revenue
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['4000'].id,
            debit_amount=Decimal('0'),
            credit_amount=revenue_amount,
            description=f"Membership revenue earned",
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
    
    # Cr GST Payable (if tax exists)
    if tax_amount > 0:
        lines.append(
            JournalEntryLine(
                id=uuid4(),
                journal_entry_id=journal_entry.id,
                account_id=account_map['2200'].id,
                debit_amount=Decimal('0'),
                credit_amount=tax_amount,
                description=f"GST collected on membership",
                created_by=created_by,
                updated_by=created_by,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        )
    
    for line in lines:
        db.add(line)
    
    await db.flush()
    
    # Post to general ledger
    for line in lines:
        ledger_entry = GeneralLedger(
            id=uuid4(),
            center_id=center_id,
            account_id=line.account_id,
            journal_entry_line_id=line.id,
            transaction_date=journal_entry.entry_date,
            debit_amount=line.debit_amount,
            credit_amount=line.credit_amount,
            description=line.description,
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(ledger_entry)
    
    # Post to tax ledger if GST exists
    if tax_amount > 0:
        tax_ledger_entry = TaxLedger(
            id=uuid4(),
            center_id=center_id,
            journal_entry_line_id=lines[-1].id,  # GST line
            tax_type="GST",
            tax_rate=Decimal(str((tax_amount / revenue_amount * 100))) if revenue_amount > 0 else Decimal('0'),
            taxable_amount=revenue_amount,
            tax_amount=tax_amount,
            transaction_date=journal_entry.entry_date,
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(tax_ledger_entry)
    
    await db.commit()
    return journal_entry


async def auto_record_payment_in_accounts(
    db: AsyncSession,
    payment_order: PaymentOrder,
    created_by: str
):
    """
    Router function to direct PaymentOrder to appropriate accounting function.
    Only records if payment_order exists and has required fields.
    """
    if not payment_order:
        return None
        
    if payment_order.order_type == "membership":
        return await record_membership_sale(db, payment_order, created_by)
    # Add other order types here as we implement them
    # elif payment_order.order_type == "inventory_sale":
    #     return await record_inventory_sale(db, payment_order, created_by)
    else:
        # Log or skip unknown order types
        return None
    


async def auto_record_payroll_payment(
    db: AsyncSession,
    payment_order: PaymentOrder,
    total_salary: Decimal,
    tds_amount: Decimal,
    net_payable: Decimal,
    created_by: str
):
    """
    Record payroll payment in accounting system.
    Entry:
        Dr 5000 Salary Expense          [total_salary]
            Cr 2300 TDS Payable          [tds_amount]
            Cr 1200 Bank Account         [net_payable]
    """
    center_id = payment_order.center_id
    
    # Fetch account codes
    required_codes = ['5000', '2300', '1200']
    accounts = await db.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.code.in_(required_codes)
        )
    )
    account_map = {acc.code: acc for acc in accounts.scalars().all()}
    
    if not all(code in account_map for code in required_codes):
        raise ValueError(f"Required accounts not found for center. Missing: {set(required_codes) - set(account_map.keys())}")
    
    # Create journal entry
    journal_entry = JournalEntry(
        id=uuid4(),
        center_id=center_id,
        entry_date=datetime.utcnow(),
        source=TransactionSource.PAYROLL,
        source_id=payment_order.payment_order_id,
        description=f"Payroll payment - Order #{str(payment_order.payment_order_id)[:8]}",
        status=EntryStatus.POSTED,
        created_by=created_by,
        updated_by=created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(journal_entry)
    await db.flush()
    
    # Create journal entry lines
    lines = [
        # Dr Salary Expense
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['5000'].id,
            debit_amount=total_salary,
            credit_amount=Decimal('0'),
            description="Salary expense for the month",
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
    
    # Cr TDS Payable (if applicable)
    if tds_amount > 0:
        lines.append(
            JournalEntryLine(
                id=uuid4(),
                journal_entry_id=journal_entry.id,
                account_id=account_map['2300'].id,
                debit_amount=Decimal('0'),
                credit_amount=tds_amount,
                description="TDS deducted from salary",
                created_by=created_by,
                updated_by=created_by,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        )
    
    # Cr Bank Account
    lines.append(
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['1200'].id,
            debit_amount=Decimal('0'),
            credit_amount=net_payable,
            description="Salary paid via bank transfer",
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    )
    
    for line in lines:
        db.add(line)
    
    await db.flush()
    
    # Post to general ledger
    for line in lines:
        ledger_entry = GeneralLedger(
            id=uuid4(),
            center_id=center_id,
            account_id=line.account_id,
            journal_entry_line_id=line.id,
            transaction_date=journal_entry.entry_date,
            debit_amount=line.debit_amount,
            credit_amount=line.credit_amount,
            description=line.description,
            created_by=created_by,
            updated_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(ledger_entry)
    
    await db.flush()
    return journal_entry