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
    return result.scalar_one_or_none()

async def post_inventory_sale_journal(
    session: AsyncSession,
    *,
    sale,
    created_by
):
    """
    Post journal entries for inventory sale.
    CRITICAL: Fetch Stock from database to get last_cost, NOT from Product!
    
    Creates entries for:
    - Cash/Bank (Debit: total_amount including tax)
    - Sales Revenue (Credit: subtotal_amount)
    - GST Payable (Credit: tax_amount, if applicable)
    - COGS Expense (Debit: calculated from stock.last_cost)
    - Inventory Asset (Credit: COGS amount)
    """
    from app.inventory.models.models import Stock, SaleItem
    
    try:
        now = datetime.utcnow()
        center_id = sale.center_id

        # Get required accounts
        cash_acct = await get_account_by_code(session, "1100", center_id)  # Cash/Bank
        sales_acct = await get_account_by_code(session, "4100", center_id)  # Sales Revenue
        inventory_acct = await get_account_by_code(session, "1400", center_id)  # Inventory Asset
        cogs_acct = await get_account_by_code(session, "5400", center_id)  # COGS Expense
        gst_acct = await get_account_by_code(session, "2200", center_id)  # GST Payable

        if not all([cash_acct, sales_acct, inventory_acct, cogs_acct]):
            raise ValueError("Required ChartOfAccounts not found for inventory_sale transaction.")

        # Calculate COGS correctly by fetching Stock for each item
        cogs_amount = Decimal("0.00")
        
        # Load sale items
        stmt = select(SaleItem).where(SaleItem.sale_id == sale.id)
        res = await session.execute(stmt)
        items = res.scalars().all()

        if not items:
            raise ValueError("Sale has no items")

        for item in items:
            # CRITICAL FIX: Fetch Stock from database to get last_cost
            stock_stmt = select(Stock).where(Stock.product_id == item.product_id)
            stock_res = await session.execute(stock_stmt)
            stock = stock_res.scalar_one_or_none()

            # Use stock.last_cost, NOT product.last_cost
            last_cost = Decimal(str(stock.last_cost)) if stock and stock.last_cost else Decimal("0.00")
            item_cogs = last_cost * Decimal(str(item.quantity))
            cogs_amount += item_cogs

        # Create Journal Entry
        entry_id = uuid4()
        journal_entry = JournalEntry(
            id=entry_id,
            entry_number=f"SALE-{uuid4().hex[:8].upper()}",
            entry_date=now,
            description=f"Inventory Sale #{str(sale.id)[:8]}",
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
        )
        session.add(journal_entry)
        await session.flush()  # Ensure entry_id is set before creating lines

        # Create Journal Entry Lines and General Ledger entries
        lines_data = []

        # Line 1: Debit Cash/Bank
        lines_data.append({
            "account": cash_acct,
            "debit": sale.total_amount,
            "credit": Decimal("0.00"),
            "description": "Sale receipt (Cash)"
        })

        # Line 2: Credit Sales Revenue
        lines_data.append({
            "account": sales_acct,
            "debit": Decimal("0.00"),
            "credit": sale.subtotal_amount,
            "description": "Sales income"
        })

        # Line 3: Credit GST Payable (if tax exists)
        if sale.tax_amount and sale.tax_amount > Decimal("0.00") and gst_acct:
            lines_data.append({
                "account": gst_acct,
                "debit": Decimal("0.00"),
                "credit": sale.tax_amount,
                "description": "Output GST on Sale"
            })

        # Line 4: Debit COGS
        lines_data.append({
            "account": cogs_acct,
            "debit": cogs_amount,
            "credit": Decimal("0.00"),
            "description": "Cost of Goods Sold"
        })

        # Line 5: Credit Inventory Asset
        lines_data.append({
            "account": inventory_acct,
            "debit": Decimal("0.00"),
            "credit": cogs_amount,
            "description": "Inventory reduction"
        })

        # Create JournalEntryLine and GeneralLedger entries
        for line_data in lines_data:
            line_id = uuid4()
            
            # Create JournalEntryLine
            journal_line = JournalEntryLine(
                id=line_id,
                journal_entry_id=entry_id,
                account_id=line_data["account"].id,
                entry_date=now,
                description=line_data["description"],
                debit=line_data["debit"],
                credit=line_data["credit"],
                created_at=now,
                created_by=created_by,
            )
            session.add(journal_line)
            await session.flush()

            # Create GeneralLedger entry - FIXED: Removed account_code parameter
            gl_entry = GeneralLedger(
                id=uuid4(),
                account_id=line_data["account"].id,
                journal_entry_id=entry_id,
                journal_entry_line_id=line_id,
                transaction_date=now,
                description=line_data["description"],
                debit=line_data["debit"],
                credit=line_data["credit"],
                balance=Decimal("0.00"),
                center_id=center_id,
                source=TransactionSource.INVENTORY_SALE.value,
                source_id=str(sale.id),
                created_at=now,
                created_by=created_by,
            )
            session.add(gl_entry)

        # Create TaxLedger entry if tax exists
        if sale.tax_amount and sale.tax_amount > Decimal("0.00"):
            tax_ledger = TaxLedger(
                id=uuid4(),
                journal_entry_id=entry_id,
                center_id=center_id,
                transaction_date=now,
                tax_type="GST",
                tax_rate=sale.tax_percentage or Decimal("0.00"),
                taxable_amount=sale.subtotal_amount,
                tax_amount=sale.tax_amount,
                source=TransactionSource.INVENTORY_SALE.value,
                source_id=str(sale.id),
                created_at=now,
                created_by=created_by,
            )
            session.add(tax_ledger)

        await session.flush()
        return entry_id

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to post inventory sale journal: {str(e)}")

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