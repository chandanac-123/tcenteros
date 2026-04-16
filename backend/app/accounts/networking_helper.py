from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts, EntryStatus, TransactionSource,
    GeneralLedger
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime
from decimal import Decimal


# ✅ FIXED: no async here
async def get_account_by_code(session: AsyncSession, code: str, center_id):
    with session.no_autoflush:   # ✅ FIX
        result = await session.execute(
            select(ChartOfAccounts).where(
                ChartOfAccounts.code == code,
                ChartOfAccounts.center_id == center_id
            )
        )
    account = result.scalar_one_or_none()
    if not account:
        raise ValueError(f"Account code {code} not found for center {center_id}")
    return account


async def post_networking_access_journal(
    session: AsyncSession,
    *,
    home_center_id,
    network_center_id,
    amount,
    platform_share,
    member_id,
    membership_id,
    approved_by
):
    try:
        now = datetime.utcnow()

        # ✅ correct split
        center_share = (amount - platform_share).quantize(Decimal("0.01"))

        # =========================
        # HOST CENTER (INCOME)
        # =========================
        with session.no_autoflush:   # ✅ FIX
            host_cash_acct = await get_account_by_code(session, "1100", network_center_id)
            host_income_acct = await get_account_by_code(session, "4200", network_center_id)

        entry_id_host = uuid4()

        journal_entry_host = JournalEntry(
            id=entry_id_host,
            entry_number=f"NETIN-{uuid4().hex[:8].upper()}",
            entry_date=now,
            description="Networking Income - Member Visit",
            source=TransactionSource.NETWORK_IN.value,
            source_id=str(membership_id),
            center_id=network_center_id,
            status=EntryStatus.POSTED.value,
            posted_at=now,
            posted_by=approved_by,
            total_debit=center_share,
            total_credit=center_share,
            created_by=approved_by,
            updated_by=approved_by,
            created_at=now,
            updated_at=now,
        )

        session.add(journal_entry_host)
        await session.flush()

        host_lines = [
            {"account": host_cash_acct, "debit": center_share, "credit": Decimal("0.00")},
            {"account": host_income_acct, "debit": Decimal("0.00"), "credit": center_share},
        ]

        for line in host_lines:
            line_id = uuid4()

            session.add(JournalEntryLine(
                id=line_id,
                journal_entry_id=entry_id_host,
                account_id=line["account"].id,
                entry_date=now,
                description="Network income",
                debit=line["debit"],
                credit=line["credit"],
                created_at=now,
                created_by=approved_by,
            ))

            session.add(GeneralLedger(
                id=uuid4(),
                account_id=line["account"].id,
                journal_entry_id=entry_id_host,
                journal_entry_line_id=line_id,
                transaction_date=now,
                description="Network income",
                debit=line["debit"],
                credit=line["credit"],
                balance=line["debit"] - line["credit"],
                center_id=network_center_id,
                source=TransactionSource.NETWORK_IN.value,
                source_id=str(membership_id),
                created_at=now,
                created_by=approved_by,
            ))

        # =========================
        # HOME CENTER (EXPENSE)
        # =========================
        with session.no_autoflush:   # ✅ FIX
            guest_cash_acct = await get_account_by_code(session, "1100", home_center_id)
            guest_expense_acct = await get_account_by_code(session, "5800", home_center_id)

        entry_id_guest = uuid4()

        journal_entry_guest = JournalEntry(
            id=entry_id_guest,
            entry_number=f"NETOUT-{uuid4().hex[:8].upper()}",
            entry_date=now,
            description="Networking Expense",
            source=TransactionSource.NETWORK_OUT.value,
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
        )

        session.add(journal_entry_guest)
        await session.flush()

        guest_lines = [
            {"account": guest_expense_acct, "debit": amount, "credit": Decimal("0.00")},
            {"account": guest_cash_acct, "debit": Decimal("0.00"), "credit": amount},
        ]

        for line in guest_lines:
            line_id = uuid4()

            session.add(JournalEntryLine(
                id=line_id,
                journal_entry_id=entry_id_guest,
                account_id=line["account"].id,
                entry_date=now,
                description="Networking expense",
                debit=line["debit"],
                credit=line["credit"],
                created_at=now,
                created_by=approved_by,
            ))

            session.add(GeneralLedger(
                id=uuid4(),
                account_id=line["account"].id,
                journal_entry_id=entry_id_guest,
                journal_entry_line_id=line_id,
                transaction_date=now,
                description="Networking expense",
                debit=line["debit"],
                credit=line["credit"],
                balance=line["debit"] - line["credit"],
                center_id=home_center_id,
                source=TransactionSource.NETWORK_OUT.value,
                source_id=str(membership_id),
                created_at=now,
                created_by=approved_by,
            ))

        return {
            "host_entry_id": entry_id_host,
            "guest_entry_id": entry_id_guest
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to post networking access journal: {str(e)}")