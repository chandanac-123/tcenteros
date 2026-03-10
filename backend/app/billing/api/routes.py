from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.core.dependencies import get_async_session, centeradmin_required
from app.billing.schema.schema import (
    TransactionListPaginatedResponse,
    TransactionDetailResponse,
    TransactionCreate,
    TransactionUpdate,
    DailySalesSummaryResponse
    )
from app.billing.models.models import PaymentOrder, PaymentOrderStatus, ReferenceSchema, PaymentMethod, OrderType
from app.inventory.models.models import Sale, SaleItem, Product
from app.membership.models.models import MemberMembership, Membership
from app.auth.models.models import Member, User
from sqlalchemy.orm import selectinload
from uuid import UUID

router = APIRouter()


@router.get("/transactions", summary="List all billing transactions", response_model=TransactionListPaginatedResponse)
async def list_billing_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[date] = Query(None, description="Filter from date (inclusive)"),
    date_to: Optional[date] = Query(None, description="Filter to date (inclusive)"),
    transaction_type: Optional[str] = Query(None, description="Filter by type: membership, product, network, service"),
    status: Optional[str] = Query(None, description="Filter by status: paid, pending, unpaid, failed, cancelled"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method: cash, card, upi, bank_transfer"),
    customer_id: Optional[str] = Query(None, description="Filter by customer/member ID"),
    source: Optional[str] = Query(None, description="Filter by source: local, pos, visit, online"),
    search: Optional[str] = Query(None, description="Search by invoice number or customer name"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Unified billing transactions list - shows all types of transactions:
    - Membership purchases/renewals
    - Product sales (POS)
    - Network visit charges
    - Service charges
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Build WHERE clauses
    where_clauses = [PaymentOrder.center_id == center_id]

    # Date filters
    if date_from:
        where_clauses.append(PaymentOrder.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        where_clauses.append(PaymentOrder.created_at <= datetime.combine(date_to, datetime.max.time()))

    # Type filter (order_type mapping)
    if transaction_type:
        type_mapping = {
            "membership": [OrderType.center_subscription, OrderType.renewal],
            "product": [OrderType.stock_purchase],
            "network": [OrderType.add_on],  # You may need to add a specific network order type
            "service": [OrderType.feature_purchase],
        }
        if transaction_type in type_mapping:
            where_clauses.append(PaymentOrder.order_type.in_(type_mapping[transaction_type]))

    # Status filter
    if status:
        status_mapping = {
            "paid": PaymentOrderStatus.paid,
            "pending": PaymentOrderStatus.pending,
            "unpaid": PaymentOrderStatus.unpaid,
            "failed": PaymentOrderStatus.failed,
            "cancelled": PaymentOrderStatus.cancelled,
            "refunded": PaymentOrderStatus.refunded,
        }
        if status in status_mapping:
            where_clauses.append(PaymentOrder.status == status_mapping[status])

    # Payment method filter
    if payment_method:
        method_mapping = {
            "cash": PaymentMethod.cash,
            "card": PaymentMethod.card,
            "upi": PaymentMethod.upi,
            "bank_transfer": PaymentMethod.bank_transfer,
            "other": PaymentMethod.other,
        }
        if payment_method in method_mapping:
            where_clauses.append(PaymentOrder.payment_method == method_mapping[payment_method])

    # Customer filter
    if customer_id:
        where_clauses.append(PaymentOrder.payer_user_id == customer_id)

    # Search filter (will require joins)
    # For now, skip complex search - can be added later with subqueries

    # Count total
    count_stmt = select(func.count()).select_from(PaymentOrder).where(*where_clauses)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Main query with eager loading
    stmt = (
        select(PaymentOrder)
        .options(selectinload(PaymentOrder.payer))
        .where(*where_clauses)
        .order_by(desc(PaymentOrder.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(stmt)
    payment_orders = result.scalars().all()

    # Build response
    transactions = []
    for po in payment_orders:
        # Determine transaction type and source
        trans_type = "product"
        if po.order_type in [OrderType.center_subscription, OrderType.renewal]:
            trans_type = "membership"
        elif po.order_type == OrderType.feature_purchase:
            trans_type = "service"
        elif po.order_type == OrderType.add_on:
            trans_type = "network"

        # Get customer name
        customer_name = None
        if po.payer:
            customer_name = getattr(po.payer, "full_name", None) or getattr(po.payer, "username", None) or po.payer.email

        # Generate invoice number (you may want to add this to PaymentOrder model)
        invoice_number = f"INV{str(po.payment_order_id)[:8].upper()}"

        transactions.append({
            "invoice_number": invoice_number,
            "transaction_id": str(po.payment_order_id),
            "customer_name": customer_name,
            "customer_id": str(po.payer_user_id) if po.payer_user_id else None,
            "type": trans_type,
            "source": source or "local",  # You may want to add source field to PaymentOrder
            "date": po.created_at,
            "subtotal": str(po.subtotal_amount),
            "tax": str(po.tax_amount),
            "total_amount": str(po.total_amount),
            "payment_method": po.payment_method.value if po.payment_method else None,
            "status": po.status.value,
            "reference_id": str(po.reference_id) if po.reference_id else None,
            "reference_schema": po.reference_schema.value if po.reference_schema else None,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "transactions": transactions,
    }


@router.get("/transactions/{transaction_id}", summary="Get billing transaction detail", response_model=TransactionDetailResponse)
async def get_billing_transaction_detail(
    transaction_id: str = Path(..., description="Transaction/Payment Order ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get detailed information about a specific billing transaction
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Fetch payment order with relationships
    stmt = (
        select(PaymentOrder)
        .options(selectinload(PaymentOrder.payer))
        .where(PaymentOrder.payment_order_id == transaction_id, PaymentOrder.center_id == center_id)
    )
    result = await db.execute(stmt)
    po = result.scalar_one_or_none()

    if not po:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Build customer info
    customer = None
    if po.payer:
        customer = {
            "id": str(po.payer.id),
            "name": getattr(po.payer, "full_name", None) or getattr(po.payer, "username", None) or po.payer.email,
            "email": po.payer.email,
            "phone": getattr(po.payer, "mobile", None),
        }

    # Determine transaction type
    trans_type = "product"
    if po.order_type in [OrderType.center_subscription, OrderType.renewal]:
        trans_type = "membership"
    elif po.order_type == OrderType.feature_purchase:
        trans_type = "service"
    elif po.order_type == OrderType.add_on:
        trans_type = "network"

    # Fetch items based on reference
    items = []
    
    if po.reference_schema == ReferenceSchema.invoice and po.reference_id:
        # This is a sale - fetch sale items
        stmt = (
            select(SaleItem, Product)
            .join(Product, Product.id == SaleItem.product_id)
            .where(SaleItem.sale_id == po.reference_id)
        )
        result = await db.execute(stmt)
        sale_items = result.all()
        
        for sale_item, product in sale_items:
            items.append({
                "description": product.name,
                "quantity": int(sale_item.quantity),
                "unit_price": str(sale_item.unit_price),
                "tax": "0.00",  # Tax per item not stored, using total
                "total": str(sale_item.line_subtotal),
            })
    
    elif trans_type == "membership":
        # Fetch membership details
        # Find MemberMembership by looking for payment around same time or by reference_id if it's stored
        items.append({
            "description": "Membership Plan",
            "quantity": 1,
            "unit_price": str(po.subtotal_amount),
            "tax": str(po.tax_amount),
            "total": str(po.total_amount),
        })
    
    else:
        # Generic item
        items.append({
            "description": f"{trans_type.title()} Purchase",
            "quantity": 1,
            "unit_price": str(po.subtotal_amount),
            "tax": str(po.tax_amount),
            "total": str(po.total_amount),
        })

    # Payment details
    payment_details = None
    if po.status == PaymentOrderStatus.paid:
        payment_details = {
            "transaction_ref": None,  # You may want to add this field to PaymentOrder
            "paid_at": po.updated_at if po.updated_at else po.created_at,
        }

    # Generate invoice number
    invoice_number = f"INV{str(po.payment_order_id)[:8].upper()}"

    return {
        "invoice_number": invoice_number,
        "transaction_id": str(po.payment_order_id),
        "customer": customer,
        "type": trans_type,
        "source": "local",  # You may want to add source field
        "date": po.created_at,
        "items": items,
        "subtotal": str(po.subtotal_amount),
        "tax_amount": str(po.tax_amount),
        "total_amount": str(po.total_amount),
        "payment_method": po.payment_method.value if po.payment_method else None,
        "payment_details": payment_details,
        "status": po.status.value,
        "notes": None,  # You may want to add notes field to PaymentOrder
    }


@router.post("/transactions", summary="Create billing transaction", status_code=status.HTTP_201_CREATED)
async def create_billing_transaction(
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Create a generic billing transaction (for services, miscellaneous charges, etc.)
    For product sales, use the POS checkout endpoint
    For membership, use the membership enrollment/renewal endpoint
    """
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")
    
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Verify customer exists
    customer = await db.get(User, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Calculate totals
    subtotal = Decimal("0.00")
    for item in payload.items:
        line_total = Decimal(str(item.unit_price)) * Decimal(str(item.quantity))
        subtotal += line_total

    # Calculate tax if tax_category_id provided
    tax_amount = Decimal("0.00")
    if payload.tax_category_id:
        from app.settings.models.models import TaxCategory
        tax_cat = await db.get(TaxCategory, payload.tax_category_id)
        if tax_cat and tax_cat.is_active:
            tax_percentage = Decimal(str(tax_cat.tax_percentage or "0.00"))
            tax_amount = (subtotal * (tax_percentage / Decimal("100.0"))).quantize(Decimal("0.01"))

    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    # Determine order type based on transaction type
    order_type_mapping = {
        "membership": OrderType.renewal,
        "product": OrderType.stock_purchase,
        "network": OrderType.add_on,
        "service": OrderType.feature_purchase,
    }
    order_type = order_type_mapping.get(payload.type, OrderType.feature_purchase)

    # Determine payment status
    payment_status = PaymentOrderStatus.pending
    payment_method = None
    
    if payload.payment:
        if payload.payment.amount >= total_amount:
            payment_status = PaymentOrderStatus.paid
        payment_method = PaymentMethod[payload.payment.method.value]

    # Create PaymentOrder
    try:
        payment_order = PaymentOrder(
            payer_user_id=UUID(payload.customer_id),
            payer_type=getattr(customer, "role", "member"),  # Adjust based on user role
            payee_type="center",
            center_id=UUID(center_id),
            order_type=order_type,
            reference_schema=ReferenceSchema.invoice,
            reference_id=None,  # Can be set if linking to specific record
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency="INR",
            status=payment_status,
            payment_method=payment_method,
            created_by=UUID(user_id) if user_id else None,
        )

        db.add(payment_order)
        await db.flush()
        await db.commit()
        await db.refresh(payment_order)

    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create transaction: {exc}")

    invoice_number = f"INV{str(payment_order.payment_order_id)[:8].upper()}"

    return {
        "message": "Transaction created successfully",
        "transaction_id": str(payment_order.payment_order_id),
        "invoice_number": invoice_number,
        "total_amount": str(total_amount),
        "status": payment_status.value,
    }


@router.patch("/transactions/{transaction_id}", summary="Update billing transaction")
async def update_billing_transaction(
    transaction_id: str = Path(..., description="Transaction/Payment Order ID"),
    payload: TransactionUpdate = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Update billing transaction status, payment method, or notes
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Fetch payment order
    po = await db.get(PaymentOrder, transaction_id)
    if not po or str(po.center_id) != str(center_id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Update fields
    if payload.status:
        status_mapping = {
            "paid": PaymentOrderStatus.paid,
            "pending": PaymentOrderStatus.pending,
            "unpaid": PaymentOrderStatus.unpaid,
            "failed": PaymentOrderStatus.failed,
            "cancelled": PaymentOrderStatus.cancelled,
            "refunded": PaymentOrderStatus.refunded,
        }
        if payload.status.value in status_mapping:
            po.status = status_mapping[payload.status.value]

    if payload.payment_method:
        method_mapping = {
            "cash": PaymentMethod.cash,
            "card": PaymentMethod.card,
            "upi": PaymentMethod.upi,
            "bank_transfer": PaymentMethod.bank_transfer,
            "other": PaymentMethod.other,
        }
        if payload.payment_method.value in method_mapping:
            po.payment_method = method_mapping[payload.payment_method.value]

    # Note: You'll need to add a notes field to PaymentOrder model if you want to store notes

    try:
        db.add(po)
        await db.commit()
        await db.refresh(po)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update transaction: {exc}")

    return {
        "message": "Transaction updated successfully",
        "transaction_id": str(po.payment_order_id),
        "status": po.status.value,
    }


@router.get("/sales/summary/daily", summary="Get daily sales summary", response_model=DailySalesSummaryResponse)
async def get_daily_sales_summary(
    date_filter: Optional[date] = Query(None, description="Date for summary (default: today)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get daily sales summary with totals by type and payment method
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    target_date = date_filter or date.today()
    date_start = datetime.combine(target_date, datetime.min.time())
    date_end = datetime.combine(target_date, datetime.max.time())

    # Query all transactions for the day
    stmt = (
        select(PaymentOrder)
        .where(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= date_start,
            PaymentOrder.created_at <= date_end,
        )
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    # Calculate totals
    total_transactions = len(transactions)
    total_revenue = Decimal("0.00")
    by_type = {"membership": Decimal("0.00"), "product": Decimal("0.00"), "network": Decimal("0.00"), "service": Decimal("0.00")}
    by_payment_method = {"cash": Decimal("0.00"), "card": Decimal("0.00"), "upi": Decimal("0.00"), "bank_transfer": Decimal("0.00"), "other": Decimal("0.00")}
    paid_total = Decimal("0.00")
    pending_total = Decimal("0.00")

    for po in transactions:
        amount = Decimal(str(po.total_amount))
        total_revenue += amount

        # By type
        if po.order_type in [OrderType.center_subscription, OrderType.renewal]:
            by_type["membership"] += amount
        elif po.order_type == OrderType.stock_purchase:
            by_type["product"] += amount
        elif po.order_type == OrderType.add_on:
            by_type["network"] += amount
        elif po.order_type == OrderType.feature_purchase:
            by_type["service"] += amount

        # By payment method
        if po.payment_method:
            method_key = po.payment_method.value
            if method_key in by_payment_method:
                by_payment_method[method_key] += amount

        # By status
        if po.status == PaymentOrderStatus.paid:
            paid_total += amount
        elif po.status in [PaymentOrderStatus.pending, PaymentOrderStatus.unpaid]:
            pending_total += amount

    return {
        "date": target_date,
        "total_transactions": total_transactions,
        "total_revenue": str(total_revenue),
        "by_type": {k: str(v) for k, v in by_type.items()},
        "by_payment_method": {k: str(v) for k, v in by_payment_method.items()},
        "paid": str(paid_total),
        "pending": str(pending_total),
    }