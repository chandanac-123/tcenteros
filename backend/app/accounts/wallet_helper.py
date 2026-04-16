from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts,
    EntryStatus, TransactionSource, GeneralLedger
)
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from datetime import datetime
from sqlalchemy import select


async def post_wallet_transaction_journal(
    session: AsyncSession,
    *,
    center_id,
    amount,
    payment_order_id,
    created_by,
    transaction_type  # "create" or "topup"
):
    now = datetime.utcnow()

    # 🔹 Fetch Accounts
    cash_acct = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.code == "1100"
        )
    )
    cash_acct = cash_acct.scalar_one_or_none()

    wallet_acct = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.code == "2150"
        )
    )
    wallet_acct = wallet_acct.scalar_one_or_none()

    if not cash_acct or not wallet_acct:
        raise ValueError("Required wallet accounts not found")

    # 🔹 Prevent duplicate entry
    existing = await session.execute(
        select(JournalEntry).where(
            JournalEntry.source == TransactionSource.GENERAL_INCOME.value,
            JournalEntry.source_id == str(payment_order_id)
        )
    )
    if existing.scalar_one_or_none():
        return

    # 🔹 Journal Lines
    lines = [
        # Dr Cash
        JournalEntryLine(
            id=uuid4(),
            account_id=cash_acct.id,
            entry_date=now,
            description=f"Wallet {transaction_type} - cash received",
            debit=amount,
            credit=0
        ),
        # Cr Wallet Liability
        JournalEntryLine(
            id=uuid4(),
            account_id=wallet_acct.id,
            entry_date=now,
            description=f"Wallet {transaction_type} - liability created",
            debit=0,
            credit=amount
        )
    ]

    # 🔹 Journal Entry
    journal_entry = JournalEntry(
        id=uuid4(),
        entry_number=f"WALLET-{uuid4().hex[:8]}",
        entry_date=now,
        description=f"Wallet {transaction_type} - PaymentOrder {payment_order_id}",
        source=TransactionSource.MANUAL.value,
        source_id=str(payment_order_id),
        center_id=center_id,
        status=EntryStatus.POSTED.value,
        posted_at=now,
        posted_by=created_by,
        total_debit=amount,
        total_credit=amount,
        created_by=created_by,
        updated_by=created_by,
        created_at=now,
        updated_at=now,
        lines=lines
    )

    session.add(journal_entry)
    await session.flush()

    # 🔹 Ledger Entries
    for line in lines:
        session.add(
            GeneralLedger(
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
                created_at=now
            )
        )

    await session.flush()

    return journal_entry