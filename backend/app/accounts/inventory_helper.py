from app.accounts.models.models import (
    JournalEntry, JournalEntryLine, ChartOfAccounts, EntryStatus, TransactionSource,
    TaxLedger, GeneralLedger
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime

async def get_account_by_code(session: AsyncSession, code: str, center_id):
    result = await session.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.code == code,
            ChartOfAccounts.center_id == center_id
        )
    )
    return result.scalar_one_or_none()

async def post_inventory_sale_journal(
    session: AsyncSession,
    *,
    sale,
    created_by
):
    now = datetime.utcnow()
    center_id = sale.center_id

    # Get accounts
    cash_acct = await get_account_by_code(session, "1100", center_id)  # Cash/Bank
    sales_acct = await get_account_by_code(session, "4100", center_id)  # Sales Revenue
    inventory_acct = await get_account_by_code(session, "1400", center_id)  # Inventory Asset
    cogs_acct = await get_account_by_code(session, "5400", center_id)  # COGS Expense

    if not all([cash_acct, sales_acct, inventory_acct, cogs_acct]):
        raise Exception("Required ChartOfAccounts not found for sale transaction.")

    cogs_amount = getattr(sale, "cogs_amount", None)
    if cogs_amount is None:
        cogs_amount = sum([(item.quantity * (item.product.last_cost or 0)) for item in sale.items])

    lines = [
        JournalEntryLine(
            id=uuid4(),
            account_id=cash_acct.id,
            entry_date=now,
            description="Sale receipt",
            debit=sale.total_amount,
            credit=0
        ),
        JournalEntryLine(
            id=uuid4(),
            account_id=sales_acct.id,
            entry_date=now,
            description="Sales income",
            debit=0,
            credit=sale.subtotal_amount
        ),
    ]

    tax_ledger = None
    if sale.tax_amount and sale.tax_amount > 0:
        output_tax_acct = await get_account_by_code(session, "2200", center_id)  # GST Payable
        if output_tax_acct:
            lines.append(
                JournalEntryLine(
                    id=uuid4(),
                    account_id=output_tax_acct.id,
                    entry_date=now,
                    description="Output Tax on Sale",
                    debit=0,
                    credit=sale.tax_amount
                )
            )
            # TaxLedger entry for output tax
            tax_ledger = TaxLedger(
                id=uuid4(),
                journal_entry_id=None,  # Set after journal entry is created
                center_id=center_id,
                transaction_date=now,
                tax_type=getattr(sale, "tax_type", "GST"),
                tax_rate=getattr(sale, "tax_rate", 0),
                taxable_amount=sale.subtotal_amount,
                tax_amount=sale.tax_amount,
                source=TransactionSource.INVENTORY_SALE.value,
                source_id=str(sale.id),
                created_at=now,
            )

    # COGS
    lines.append(
        JournalEntryLine(
            id=uuid4(),
            account_id=cogs_acct.id,
            entry_date=now,
            description="Cost of Goods Sold",
            debit=cogs_amount,
            credit=0
        )
    )
    lines.append(
        JournalEntryLine(
            id=uuid4(),
            account_id=inventory_acct.id,
            entry_date=now,
            description="Inventory reduction",
            debit=0,
            credit=cogs_amount
        )
    )

    journal_entry = JournalEntry(
        id=uuid4(),
        entry_number=f"SALE-{uuid4().hex[:8]}",
        entry_date=now,
        description=f"Sale #{sale.id}",
        source=TransactionSource.INVENTORY_SALE.value,
        source_id=str(sale.id),
        center_id=center_id,
        status=EntryStatus.POSTED.value,
        posted_at=now,
        posted_by=created_by,
        total_debit=sale.total_amount + cogs_amount,
        total_credit=sale.total_amount + cogs_amount,
        created_by=created_by,
        updated_by=created_by,
        created_at=now,
        updated_at=now,
        lines=lines
    )
    session.add(journal_entry)
    await session.flush()

    # Add GeneralLedger entries
    for line in lines:
        gl_entry = GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=journal_entry.id,
            journal_entry_line_id=line.id,
            transaction_date=now,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=0,  # Set by a periodic process or trigger
            center_id=center_id,
            source=journal_entry.source,
            source_id=journal_entry.source_id,
            created_at=now,
        )
        session.add(gl_entry)

    # Add TaxLedger entry if needed
    if tax_ledger:
        tax_ledger.journal_entry_id = journal_entry.id
        session.add(tax_ledger)

    await session.flush()
    return journal_entry.id

async def post_inventory_purchase_journal(
    session: AsyncSession,
    *,
    purchase,
    created_by
):
    now = datetime.utcnow()
    center_id = purchase.center_id

    # Get accounts
    inventory_acct = await get_account_by_code(session, "1400", center_id)  # Inventory Asset
    cash_acct = await get_account_by_code(session, "1100", center_id)  # Cash/Bank
    input_tax_acct = await get_account_by_code(session, "2100", center_id)  # Input Tax (GST Receivable)

    if not all([inventory_acct, cash_acct]):
        raise Exception("Required ChartOfAccounts not found for purchase transaction.")

    lines = [
        JournalEntryLine(
            id=uuid4(),
            account_id=inventory_acct.id,
            entry_date=now,
            description="Inventory purchase",
            debit=purchase.subtotal_amount,
            credit=0
        ),
        JournalEntryLine(
            id=uuid4(),
            account_id=cash_acct.id,
            entry_date=now,
            description="Purchase payment",
            debit=0,
            credit=purchase.total_amount
        ),
    ]

    tax_ledger = None
    if purchase.tax_amount and purchase.tax_amount > 0 and input_tax_acct:
        lines.append(
            JournalEntryLine(
                id=uuid4(),
                account_id=input_tax_acct.id,
                entry_date=now,
                description="Input Tax on Purchase",
                debit=purchase.tax_amount,
                credit=0
            )
        )
        # TaxLedger entry for input tax
        tax_ledger = TaxLedger(
            id=uuid4(),
            journal_entry_id=None,  # Set after journal entry is created
            center_id=center_id,
            transaction_date=now,
            tax_type=getattr(purchase, "tax_type", "GST"),
            tax_rate=getattr(purchase, "tax_rate", 0),
            taxable_amount=purchase.subtotal_amount,
            tax_amount=purchase.tax_amount,
            source=TransactionSource.INVENTORY_PURCHASE.value,
            source_id=str(purchase.id),
            created_at=now,
        )

    journal_entry = JournalEntry(
        id=uuid4(),
        entry_number=f"PUR-{uuid4().hex[:8]}",
        entry_date=now,
        description=f"Purchase #{purchase.id}",
        source=TransactionSource.INVENTORY_PURCHASE.value,
        source_id=str(purchase.id),
        center_id=center_id,
        status=EntryStatus.POSTED.value,
        posted_at=now,
        posted_by=created_by,
        total_debit=purchase.total_amount,
        total_credit=purchase.total_amount,
        created_by=created_by,
        updated_by=created_by,
        created_at=now,
        updated_at=now,
        lines=lines
    )
    session.add(journal_entry)
    await session.flush()

    # Add GeneralLedger entries
    for line in lines:
        gl_entry = GeneralLedger(
            id=uuid4(),
            account_id=line.account_id,
            journal_entry_id=journal_entry.id,
            journal_entry_line_id=line.id,
            transaction_date=now,
            description=line.description,
            debit=line.debit,
            credit=line.credit,
            balance=0,  # Set by a periodic process or trigger
            center_id=center_id,
            source=journal_entry.source,
            source_id=journal_entry.source_id,
            created_at=now,
        )
        session.add(gl_entry)

    # Add TaxLedger entry if needed
    if tax_ledger:
        tax_ledger.journal_entry_id = journal_entry.id
        session.add(tax_ledger)

    await session.flush()
    return journal_entry.id