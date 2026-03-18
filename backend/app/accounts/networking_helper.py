from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts, EntryStatus,
    GeneralLedger, TaxLedger
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime

async def get_account(session: AsyncSession, center_id, account_type, name):
    result = await session.execute(
        select(ChartOfAccounts)
        .where(
            ChartOfAccounts.center_id == center_id,
            ChartOfAccounts.account_type == account_type,
            ChartOfAccounts.name.ilike(name)
        )
    )
    return result.scalar_one_or_none()

async def post_networking_access_journal(
    session: AsyncSession,
    *,
    home_center_id,
    network_center_id,
    amount,
    platform_share,
    member_id,
    membership_id,
    approved_by,
    tax_type=None,
    tax_rate=0,
    tax_amount=0
):
    now = datetime.utcnow()
    # 1. Get accounts
    home_expense_acct = await get_account(session, home_center_id, "expense", "Networking Expense")
    network_income_acct = await get_account(session, network_center_id, "revenue", "Networking Income")
    platform_income_acct = await get_account(session, network_center_id, "revenue", "Platform Income")

    if not all([home_expense_acct, network_income_acct, platform_income_acct]):
        raise Exception("Required ChartOfAccounts not found for networking transaction.")

    # 2. Home center: Expense entry
    home_lines = [
        JournalEntryLine(
            id=uuid4(),
            account_id=home_expense_acct.id,
            entry_date=now,
            description="Networking access expense",
            debit=amount,
            credit=0
        ),
        JournalEntryLine(
            id=uuid4(),
            account_id=home_expense_acct.id,  # Or a "Cash/Bank" account if you want to show outflow
            entry_date=now,
            description="Networking access payment",
            debit=0,
            credit=amount
        )
    ]
    je_home = JournalEntry(
        id=uuid4(),
        entry_number=f"NET-{uuid4().hex[:8]}",
        entry_date=now,
        description=f"Networking access expense for membership {membership_id}",
        source="network_settlement",
        source_id=str(membership_id),
        center_id=home_center_id,
        status=EntryStatus.POSTED.value,
        posted_at=now,
        posted_by=approved_by,
        total_debit=amount,
        total_credit=amount,
        created_by=approved_by,
        updated_by=approved_by,
        created_at=now,
        updated_at=now,
        lines=home_lines
    )
    session.add(je_home)
    await session.flush()

    # GeneralLedger for home center
    for line in home_lines:
        gl_entry = GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=je_home.id,
            journal_entry_line_id=line.id,
            transaction_date=now,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=0,  # To be updated by a periodic process
            center_id=home_center_id,
            source=je_home.source,
            source_id=je_home.source_id,
            created_at=now,
        )
        session.add(gl_entry)

    # 3. Network center: Income entry
    network_lines = [
        JournalEntryLine(
            id=uuid4(),
            account_id=network_income_acct.id,
            entry_date=now,
            description="Networking access income",
            debit=0,
            credit=amount - platform_share
        ),
        JournalEntryLine(
            id=uuid4(),
            account_id=platform_income_acct.id,
            entry_date=now,
            description="Platform share from networking",
            debit=0,
            credit=platform_share
        ),
        JournalEntryLine(
            id=uuid4(),
            account_id=network_income_acct.id,  # Or a "Cash/Bank" account if you want to show inflow
            entry_date=now,
            description="Networking access receipt",
            debit=amount,
            credit=0
        )
    ]
    je_network = JournalEntry(
        id=uuid4(),
        entry_number=f"NET-{uuid4().hex[:8]}",
        entry_date=now,
        description=f"Networking access income for membership {membership_id}",
        source="network_settlement",
        source_id=str(membership_id),
        center_id=network_center_id,
        status=EntryStatus.POSTED.value,
        posted_at=now,
        posted_by=approved_by,
        total_debit=amount,
        total_credit=amount,
        created_by=approved_by,
        updated_by=approved_by,
        created_at=now,
        updated_at=now,
        lines=network_lines
    )
    session.add(je_network)
    await session.flush()

    # GeneralLedger for network center
    for line in network_lines:
        gl_entry = GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=je_network.id,
            journal_entry_line_id=line.id,
            transaction_date=now,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=0,  # To be updated by a periodic process
            center_id=network_center_id,
            source=je_network.source,
            source_id=je_network.source_id,
            created_at=now,
        )
        session.add(gl_entry)

    # TaxLedger (optional, only if tax is involved)
    if tax_amount and tax_amount > 0:
        tax_ledger = TaxLedger(
            id=uuid4(),
            journal_entry_id=je_network.id,
            center_id=network_center_id,
            transaction_date=now,
            tax_type=tax_type or "GST",
            tax_rate=tax_rate,
            taxable_amount=amount - tax_amount,
            tax_amount=tax_amount,
            source="network_settlement",
            source_id=str(membership_id),
            created_at=now,
        )
        session.add(tax_ledger)

    await session.flush()
    return je_home.id, je_network.id