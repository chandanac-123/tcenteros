from uuid import uuid4
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.accounts.models.models import (
    ChartOfAccounts, JournalEntry, JournalEntryLine, 
    GeneralLedger, TaxLedger
)
from app.billing.models.models import PaymentOrder

async def record_membership_sale(
    db: AsyncSession,
    payment_order: PaymentOrder,
    created_by: str
):
    center_id = payment_order.center_id

    accounts = await db.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.code.in_(['1100', '4000', '2200'])
        )
    )
    account_map = {acc.code: acc for acc in accounts.scalars().all()}

    if not all(code in account_map for code in ['1100', '4000', '2200']):
        raise ValueError("Required accounts not found for center")

    total_amount = Decimal(str(payment_order.total_amount))
    tax_amount = Decimal(str(payment_order.tax_amount or 0))
    revenue_amount = total_amount - tax_amount

    journal_entry = JournalEntry(
        id=uuid4(),
        entry_number=f"JE-{uuid4().hex[:8]}",
        center_id=center_id,
        entry_date=datetime.utcnow(),
        source="membership",
        source_id=str(payment_order.payment_order_id),
        description=f"Membership sale - Order #{str(payment_order.payment_order_id)[:8]}",
        status="posted",
        posted_at=None,
        posted_by=None,
        total_debit=total_amount,
        total_credit=total_amount,
        created_by=created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        updated_by=created_by
    )
    db.add(journal_entry)
    await db.flush()

    lines = [
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['1100'].id,
            entry_date=journal_entry.entry_date,
            description="Cash received - Membership payment",
            debit=total_amount,
            credit=Decimal('0'),
            created_at=datetime.utcnow()
        ),
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['4000'].id,
            entry_date=journal_entry.entry_date,
            description="Membership revenue earned",
            debit=Decimal('0'),
            credit=revenue_amount,
            created_at=datetime.utcnow()
        )
    ]

    if tax_amount > 0:
        lines.append(
            JournalEntryLine(
                id=uuid4(),
                journal_entry_id=journal_entry.id,
                account_id=account_map['2200'].id,
                entry_date=journal_entry.entry_date,
                description="GST collected on membership",
                debit=Decimal('0'),
                credit=tax_amount,
                created_at=datetime.utcnow()
            )
        )

    for line in lines:
        db.add(line)
    await db.flush()

    for line in lines:
        balance = line.debit - line.credit
        ledger_entry = GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=journal_entry.id,
            journal_entry_line_id=line.id,
            transaction_date=journal_entry.entry_date,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=balance,
            center_id=center_id,
            source="membership",
            source_id=str(payment_order.payment_order_id),
            created_at=datetime.utcnow()
        )
        db.add(ledger_entry)

    if tax_amount > 0:
        tax_ledger_entry = TaxLedger(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            center_id=center_id,
            transaction_date=journal_entry.entry_date,
            tax_type="GST",
            tax_rate=Decimal(str((tax_amount / revenue_amount * 100))) if revenue_amount > 0 else Decimal('0'),
            taxable_amount=revenue_amount,
            tax_amount=tax_amount,
            source="membership",
            source_id=str(payment_order.payment_order_id),
            created_at=datetime.utcnow()
        )
        db.add(tax_ledger_entry)

    # Do NOT commit here! Commit only in the API after all operations.
    return journal_entry

async def auto_record_payment_in_accounts(
    db: AsyncSession,
    payment_order: PaymentOrder,
    created_by: str
):
    if not payment_order:
        return None
    if payment_order.order_type == "membership":
        return await record_membership_sale(db, payment_order, created_by)
    else:
        return None

async def auto_record_payroll_payment(
    db: AsyncSession,
    payment_order: PaymentOrder,
    total_salary: Decimal,
    tds_amount: Decimal,
    net_payable: Decimal,
    created_by: str
):
    center_id = payment_order.center_id

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

    total_debit = total_salary
    total_credit = tds_amount + net_payable

    journal_entry = JournalEntry(
        id=uuid4(),
        entry_number=f"JE-{uuid4().hex[:8]}",
        center_id=center_id,
        entry_date=datetime.utcnow(),
        source="payroll",
        source_id=str(payment_order.payment_order_id),
        description=f"Payroll payment - Order #{str(payment_order.payment_order_id)[:8]}",
        status="posted",
        posted_at=None,
        posted_by=None,
        total_debit=total_debit,
        total_credit=total_credit,
        created_by=created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        updated_by=created_by
    )
    db.add(journal_entry)
    await db.flush()

    lines = [
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['5000'].id,
            entry_date=journal_entry.entry_date,
            description="Salary expense for the month",
            debit=total_salary,
            credit=Decimal('0'),
            created_at=datetime.utcnow()
        )
    ]

    if tds_amount > 0:
        lines.append(
            JournalEntryLine(
                id=uuid4(),
                journal_entry_id=journal_entry.id,
                account_id=account_map['2300'].id,
                entry_date=journal_entry.entry_date,
                description="TDS deducted from salary",
                debit=Decimal('0'),
                credit=tds_amount,
                created_at=datetime.utcnow()
            )
        )

    lines.append(
        JournalEntryLine(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            account_id=account_map['1200'].id,
            entry_date=journal_entry.entry_date,
            description="Salary paid via bank transfer",
            debit=Decimal('0'),
            credit=net_payable,
            created_at=datetime.utcnow()
        )
    )

    for line in lines:
        db.add(line)

    await db.flush()

    for line in lines:
        balance = line.debit - line.credit
        ledger_entry = GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=journal_entry.id,
            journal_entry_line_id=line.id,
            transaction_date=journal_entry.entry_date,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=balance,
            center_id=center_id,
            source="payroll",
            source_id=str(payment_order.payment_order_id),
            created_at=datetime.utcnow()
        )
        db.add(ledger_entry)

    await db.flush()
    print("[DEBUG] Finished auto_record_payroll_payment (no commit here).")
    return journal_entry