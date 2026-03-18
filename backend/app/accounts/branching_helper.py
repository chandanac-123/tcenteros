from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts, EntryStatus, TransactionSource,
    GeneralLedger, TaxLedger
)
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from datetime import datetime
from sqlalchemy import select

async def post_branching_purchase_journal(
    session: AsyncSession,
    *,
    center_id,
    platform_center_id,
    subtotal_amount,
    tax_amount,
    total_amount,
    tax_type,
    tax_rate,
    payment_order_id,
    created_by
):
    now = datetime.utcnow()
    # Use General Expense instead of Branching Expense
    expense_acct = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.account_type == "expense",
            ChartOfAccounts.name.ilike("General Expense")
        )
    )
    expense_acct = expense_acct.scalar_one_or_none()
    cash_acct = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.account_type == "asset",
            ChartOfAccounts.name.ilike("Cash/Bank")
        )
    )
    cash_acct = cash_acct.scalar_one_or_none()
    output_tax_acct = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.code == "2200"  # GST Payable
        )
    )
    output_tax_acct = output_tax_acct.scalar_one_or_none()

    # Center: Expense
    center_lines = []
    if expense_acct:
        center_lines.append(
            JournalEntryLine(
                id=uuid4(),
                account_id=expense_acct.id,
                entry_date=now,
                description="Branching purchase expense",
                debit=subtotal_amount,
                credit=0
            )
        )
    if cash_acct:
        center_lines.append(
            JournalEntryLine(
                id=uuid4(),
                account_id=cash_acct.id,
                entry_date=now,
                description="Branching purchase payment",
                debit=0,
                credit=total_amount
            )
        )
    if tax_amount and tax_amount > 0 and output_tax_acct:
        center_lines.append(
            JournalEntryLine(
                id=uuid4(),
                account_id=output_tax_acct.id,
                entry_date=now,
                description="Output Tax on Branching",
                debit=0,
                credit=tax_amount
            )
        )

    if center_lines:
        je_center = JournalEntry(
            id=uuid4(),
            entry_number=f"BRANCH-{uuid4().hex[:8]}",
            entry_date=now,
            description=f"Branching purchase for PaymentOrder {payment_order_id}",
            source=TransactionSource.GENERAL_EXPENSE.value,
            source_id=str(payment_order_id),
            center_id=center_id,
            status=EntryStatus.POSTED.value,
            posted_at=now,
            posted_by=created_by,
            total_debit=total_amount,
            total_credit=total_amount,
            created_by=created_by,
            updated_by=created_by,
            created_at=now,
            updated_at=now,
            lines=center_lines
        )
        session.add(je_center)
        await session.flush()

        for line in center_lines:
            session.add(GeneralLedger(
                id=uuid4(),
                account_id=line.account_id,
                journal_entry_id=je_center.id,
                journal_entry_line_id=line.id,
                transaction_date=now,
                description=line.description,
                debit=line.debit,
                credit=line.credit,
                balance=0,
                center_id=center_id,
                source=je_center.source,
                source_id=je_center.source_id,
                created_at=now,
            ))

        # TaxLedger (if tax)
        if tax_amount and tax_amount > 0:
            session.add(TaxLedger(
                id=uuid4(),
                journal_entry_id=je_center.id,
                center_id=center_id,
                transaction_date=now,
                tax_type=tax_type.value if hasattr(tax_type, "value") else tax_type,
                tax_rate=tax_rate,
                taxable_amount=subtotal_amount,
                tax_amount=tax_amount,
                source=TransactionSource.GENERAL_EXPENSE.value,
                source_id=str(payment_order_id),
                created_at=now,
            ))

        await session.flush()

    # Skip platform-side entries if platform_center_id is None