# app/accounts/networking_helper.py

from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts, EntryStatus, TransactionSource,
    TaxLedger, GeneralLedger
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime
from decimal import Decimal


async def get_account_by_code(session: AsyncSession, code: str, center_id):
    """Fetch account by code for a specific center"""
    result = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.code == code,
            ChartOfAccounts.center_id == center_id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        print(f"❌ Account code {code} not found for center {center_id}")
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
    """
    Post journal entries for networking access (visit to another center).
    
    For Host Center (receiving visit):
    - Debit: Cash/Bank (1100) - Amount received
    - Credit: Network Income (4200) - Revenue from visit
    
    For Guest Center (paying for visit):
    - Debit: Networking Expense (5800) - Fee for visiting
    - Credit: Cash/Bank (1100) - Amount paid
    """
    try:
        now = datetime.utcnow()

        # ============================================
        # HOST CENTER (network_center_id) - NETWORK_IN
        # ============================================
        print(f"📍 Processing HOST center: {network_center_id}")
        
        host_cash_acct = await get_account_by_code(session, "1100", network_center_id)
        host_network_income_acct = await get_account_by_code(session, "4200", network_center_id)

        print(f"✅ Host cash account: {host_cash_acct.code}")
        print(f"✅ Host network income account: {host_network_income_acct.code}")

        # Create Journal Entry for HOST (network_in)
        entry_id_host = uuid4()
        journal_entry_host = JournalEntry(
            id=entry_id_host,
            entry_number=f"NETIN-{uuid4().hex[:8].upper()}",
            entry_date=now,
            description=f"Networking Income - Member Visit",
            source=TransactionSource.NETWORK_IN.value,
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
        )
        session.add(journal_entry_host)
        await session.flush()

        # Host center lines: DR Cash, CR Network Income
        host_lines = [
            {
                "account": host_cash_acct,
                "debit": amount,
                "credit": Decimal("0.00"),
                "description": "Network visit payment received"
            },
            {
                "account": host_network_income_acct,
                "debit": Decimal("0.00"),
                "credit": amount,
                "description": "Network income from member visit"
            }
        ]

        for line_data in host_lines:
            line_id = uuid4()
            
            journal_line = JournalEntryLine(
                id=line_id,
                journal_entry_id=entry_id_host,
                account_id=line_data["account"].id,
                entry_date=now,
                description=line_data["description"],
                debit=line_data["debit"],
                credit=line_data["credit"],
                created_at=now,
                created_by=approved_by,
            )
            session.add(journal_line)
            await session.flush()

            gl_entry = GeneralLedger(
                id=uuid4(),
                account_id=line_data["account"].id,
                journal_entry_id=entry_id_host,
                journal_entry_line_id=line_id,
                transaction_date=now,
                description=line_data["description"],
                debit=line_data["debit"],
                credit=line_data["credit"],
                balance=Decimal("0.00"),
                center_id=network_center_id,
                source=TransactionSource.NETWORK_IN.value,
                source_id=str(membership_id),
                created_at=now,
                created_by=approved_by,
            )
            session.add(gl_entry)

        await session.flush()
        print(f"✅ Host center journal entry created: {journal_entry_host.entry_number}")

        # ============================================
        # GUEST CENTER (home_center_id) - NETWORK_OUT
        # ============================================
        print(f"📍 Processing GUEST center: {home_center_id}")
        
        guest_cash_acct = await get_account_by_code(session, "1100", home_center_id)
        guest_network_expense_acct = await get_account_by_code(session, "5800", home_center_id)

        print(f"✅ Guest cash account: {guest_cash_acct.code}")
        print(f"✅ Guest network expense account: {guest_network_expense_acct.code}")

        # Create Journal Entry for GUEST (network_out)
        entry_id_guest = uuid4()
        journal_entry_guest = JournalEntry(
            id=entry_id_guest,
            entry_number=f"NETOUT-{uuid4().hex[:8].upper()}",
            entry_date=now,
            description=f"Networking Expense - Member Visit to Another Center",
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

        # Guest center lines: DR Networking Expense, CR Cash
        guest_lines = [
            {
                "account": guest_network_expense_acct,
                "debit": amount,
                "credit": Decimal("0.00"),
                "description": "Networking expense for member visit"
            },
            {
                "account": guest_cash_acct,
                "debit": Decimal("0.00"),
                "credit": amount,
                "description": "Payment for networking visit"
            }
        ]

        for line_data in guest_lines:
            line_id = uuid4()
            
            journal_line = JournalEntryLine(
                id=line_id,
                journal_entry_id=entry_id_guest,
                account_id=line_data["account"].id,
                entry_date=now,
                description=line_data["description"],
                debit=line_data["debit"],
                credit=line_data["credit"],
                created_at=now,
                created_by=approved_by,
            )
            session.add(journal_line)
            await session.flush()

            gl_entry = GeneralLedger(
                id=uuid4(),
                account_id=line_data["account"].id,
                journal_entry_id=entry_id_guest,
                journal_entry_line_id=line_id,
                transaction_date=now,
                description=line_data["description"],
                debit=line_data["debit"],
                credit=line_data["credit"],
                balance=Decimal("0.00"),
                center_id=home_center_id,
                source=TransactionSource.NETWORK_OUT.value,
                source_id=str(membership_id),
                created_at=now,
                created_by=approved_by,
            )
            session.add(gl_entry)

        await session.flush()
        print(f"✅ Guest center journal entry created: {journal_entry_guest.entry_number}")

        return {
            "host_entry_id": entry_id_host,
            "guest_entry_id": entry_id_guest,
            "host_entry_number": journal_entry_host.entry_number,
            "guest_entry_number": journal_entry_guest.entry_number
        }

    except ValueError as ve:
        import traceback
        traceback.print_exc()
        print(f"❌ Validation error: {str(ve)}")
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Error posting networking journal: {str(e)}")
        raise ValueError(f"Failed to post networking access journal: {str(e)}")