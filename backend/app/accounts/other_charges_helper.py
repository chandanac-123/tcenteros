from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts, EntryStatus, TransactionSource,
    GeneralLedger, TaxLedger
)
from uuid import uuid4
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

async def post_miscellaneous_transaction_journal(
    session: AsyncSession,
    *,
    misc_txn,
    created_by
):
    now = datetime.utcnow()
    center_id = misc_txn.center_id
    amount = float(misc_txn.amount)
    tax_amount = float(misc_txn.tax_amount or 0)
    total_amount = float(misc_txn.total_amount)
    is_expense = misc_txn.transaction_type.lower() in ["expense", "payment", "debit"]
    is_income = misc_txn.transaction_type.lower() in ["income", "receipt", "credit"]

    # Debug: Print transaction info
    print(f"DEBUG: center_id={center_id}, category='{misc_txn.category}', transaction_type='{misc_txn.transaction_type}', is_expense={is_expense}, is_income={is_income}")

    # Get accounts
    if is_expense:
        main_acct_result = await session.execute(
            select(ChartOfAccounts).where(
                ChartOfAccounts.center_id == center_id,
                ChartOfAccounts.account_type == "expense",
                ChartOfAccounts.name.ilike(misc_txn.category)
            )
        )
        main_acct = main_acct_result.scalar_one_or_none()
        if not main_acct:
            main_acct_result = await session.execute(
                select(ChartOfAccounts).where(
                    ChartOfAccounts.center_id == center_id,
                    ChartOfAccounts.account_type == "expense",
                    ChartOfAccounts.name.ilike("General Expense")
                )
            )
            main_acct = main_acct_result.scalar_one_or_none()
    else:
        main_acct_result = await session.execute(
            select(ChartOfAccounts).where(
                ChartOfAccounts.center_id == center_id,
                ChartOfAccounts.account_type == "revenue",
                ChartOfAccounts.name.ilike(misc_txn.category)
            )
        )
        main_acct = main_acct_result.scalar_one_or_none()
        if not main_acct:
            main_acct_result = await session.execute(
                select(ChartOfAccounts).where(
                    ChartOfAccounts.center_id == center_id,
                    ChartOfAccounts.account_type == "revenue",
                    ChartOfAccounts.name.ilike("Other Income")
                )
            )
            main_acct = main_acct_result.scalar_one_or_none()

    cash_acct_result = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.account_type == "asset",
            ChartOfAccounts.name.ilike("Cash/Bank")
        )
    )
    cash_acct = cash_acct_result.scalar_one_or_none()

    tax_acct = None
    if tax_amount > 0:
        tax_acct_result = await session.execute(
            select(ChartOfAccounts).where(
                ChartOfAccounts.center_id == center_id,
                ChartOfAccounts.code == "2200"  # GST Payable
            )
        )
        tax_acct = tax_acct_result.scalar_one_or_none()

    if not all([main_acct, cash_acct]):
        raise Exception("Required ChartOfAccounts not found for miscellaneous transaction.")

    lines = []
    if is_expense:
        lines.append(JournalEntryLine(
            id=uuid4(),
            account_id=main_acct.id,
            entry_date=now,
            description=misc_txn.title,
            debit=amount,
            credit=0
        ))
        if tax_acct and tax_amount > 0:
            lines.append(JournalEntryLine(
                id=uuid4(),
                account_id=tax_acct.id,
                entry_date=now,
                description="Tax on expense",
                debit=tax_amount,
                credit=0
            ))
        lines.append(JournalEntryLine(
            id=uuid4(),
            account_id=cash_acct.id,
            entry_date=now,
            description="Payment for expense",
            debit=0,
            credit=total_amount
        ))
    elif is_income:
        lines.append(JournalEntryLine(
            id=uuid4(),
            account_id=cash_acct.id,
            entry_date=now,
            description="Receipt for income",
            debit=total_amount,
            credit=0
        ))
        lines.append(JournalEntryLine(
            id=uuid4(),
            account_id=main_acct.id,
            entry_date=now,
            description=misc_txn.title,
            debit=0,
            credit=amount
        ))
        if tax_acct and tax_amount > 0:
            lines.append(JournalEntryLine(
                id=uuid4(),
                account_id=tax_acct.id,
                entry_date=now,
                description="Tax on income",
                debit=0,
                credit=tax_amount
            ))

    journal_entry = JournalEntry(
        id=uuid4(),
        entry_number=f"MISC-{uuid4().hex[:8]}",
        entry_date=now,
        description=f"Miscellaneous transaction {misc_txn.title}",
        source=TransactionSource.GENERAL_EXPENSE.value,
        source_id=str(misc_txn.id),
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
        lines=lines
    )
    session.add(journal_entry)
    await session.flush()

    # GeneralLedger entries
    for line in lines:
        session.add(GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=journal_entry.id,
            journal_entry_line_id=line.id,
            transaction_date=now,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=0,
            center_id=center_id,
            source=journal_entry.source,
            source_id=journal_entry.source_id,
            created_at=now,
        ))

    # TaxLedger entry if tax
    if tax_acct and tax_amount > 0:
        session.add(TaxLedger(
            id=uuid4(),
            journal_entry_id=journal_entry.id,
            center_id=center_id,
            transaction_date=now,
            tax_type=misc_txn.tax_category.tax_type if misc_txn.tax_category else "GST",
            tax_rate=misc_txn.tax_category.tax_percentage if misc_txn.tax_category else 0,
            taxable_amount=amount,
            tax_amount=tax_amount,
            source=TransactionSource.GENERAL_EXPENSE.value,
            source_id=str(misc_txn.id),
            created_at=now,
        ))

    await session.flush()