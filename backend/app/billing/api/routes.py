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


# Add this to your billing routes file (or create a new billing API file)
@router.get("/billing/sales", summary="Get unified sales/billing transactions")
async def get_unified_sales_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    order_type: Optional[str] = Query(None, description="Filter by order type: membership, networking_access, stock_purchase"),
    payment_status: Optional[str] = Query(None, description="Filter by status: paid, pending, unpaid, failed"),
    payment_method_filter: Optional[str] = Query(None, description="Filter by payment method: cash, upi, card, bank_transfer, other"),
    customer_search: Optional[str] = Query(None, description="Search by customer name or mobile"),
    sort_by: str = Query("created_at", description="Sort by: created_at, total_amount"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    List all sales transactions: memberships, networking access, and product purchases.
    """
    from app.auth.models.models import CenterAdmin, Employee
    from sqlalchemy.orm import joinedload
    
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Parse dates
    date_from_parsed = None
    date_to_parsed = None

    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(400, "Invalid date_from format. Use YYYY-MM-DD")

    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
        except ValueError:
            raise HTTPException(400, "Invalid date_to format. Use YYYY-MM-DD")

    # Build WHERE clauses
    where_clauses = [PaymentOrder.center_id == center_id]

    # Only include specific order types (membership, networking, product sales)
    where_clauses.append(
        or_(
            PaymentOrder.order_type == OrderType.membership,
            PaymentOrder.order_type == OrderType.center_subscription,
            PaymentOrder.order_type == OrderType.renewal,
            PaymentOrder.order_type == OrderType.networking_access,
            PaymentOrder.order_type == OrderType.stock_purchase,
            PaymentOrder.order_type == OrderType.feature_purchase
        )
    )

    if date_from_parsed:
        where_clauses.append(PaymentOrder.created_at >= date_from_parsed)

    if date_to_parsed:
        where_clauses.append(PaymentOrder.created_at <= date_to_parsed)

    if payment_status:
        try:
            status_enum = PaymentOrderStatus[payment_status]
            where_clauses.append(PaymentOrder.status == status_enum)
        except KeyError:
            raise HTTPException(400, f"Invalid payment_status: {payment_status}")

    if payment_method_filter:
        try:
            method_enum = PaymentMethod[payment_method_filter]
            where_clauses.append(PaymentOrder.payment_method == method_enum)
        except KeyError:
            raise HTTPException(400, f"Invalid payment_method: {payment_method_filter}")

    # Filter by specific order type
    if order_type:
        if order_type == "membership":
            where_clauses.append(
                or_(
                    PaymentOrder.order_type == OrderType.membership,
                    PaymentOrder.order_type == OrderType.center_subscription,
                    PaymentOrder.order_type == OrderType.renewal
                )
            )
        elif order_type == "networking_access":
            where_clauses.append(PaymentOrder.order_type == OrderType.networking_access)
        elif order_type == "stock_purchase":
            where_clauses.append(
                or_(
                    PaymentOrder.order_type == OrderType.stock_purchase,
                    PaymentOrder.order_type == OrderType.feature_purchase
                )
            )
        else:
            raise HTTPException(400, f"Invalid order_type. Use: membership, networking_access, or stock_purchase")

    # Base query - fetch payment orders only first
    query = select(PaymentOrder).where(*where_clauses)
    
    # Apply sorting
    if sort_by == "total_amount":
        query = query.order_by(
            PaymentOrder.total_amount.desc() if sort_order == "desc" else PaymentOrder.total_amount.asc()
        )
    else:
        query = query.order_by(
            PaymentOrder.created_at.desc() if sort_order == "desc" else PaymentOrder.created_at.asc()
        )

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    payment_orders = result.scalars().all()

    # Collect all unique user IDs
    user_ids = {po.payer_user_id for po in payment_orders if po.payer_user_id}
    
    # Fetch all users in a single query
    user_map = {}
    if user_ids:
        users_result = await db.execute(
            select(User).where(User.id.in_(user_ids))
        )
        users = users_result.scalars().all()
        user_map = {user.id: user for user in users}
    
    # Fetch members, admins, and employees in separate queries
    member_map = {}
    admin_map = {}
    employee_map = {}
    
    member_ids = {uid for uid, user in user_map.items() if user.role == "member"}
    if member_ids:
        members_result = await db.execute(
            select(Member).where(Member.id.in_(member_ids))
        )
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
    
    admin_ids = {uid for uid, user in user_map.items() if user.role == "centeradmin"}
    if admin_ids:
        admins_result = await db.execute(
            select(CenterAdmin).where(CenterAdmin.id.in_(admin_ids))
        )
        admins = admins_result.scalars().all()
        admin_map = {a.id: a for a in admins}
    
    employee_ids = {uid for uid, user in user_map.items() if user.role == "employee"}
    if employee_ids:
        employees_result = await db.execute(
            select(Employee).where(Employee.id.in_(employee_ids))
        )
        employees = employees_result.scalars().all()
        employee_map = {e.id: e for e in employees}

    # Build response
    transactions = []
    for payment_order in payment_orders:
        # Get user details from maps
        customer_name = "N/A"
        customer_mobile = None
        
        if payment_order.payer_user_id and payment_order.payer_user_id in user_map:
            user = user_map[payment_order.payer_user_id]
            customer_mobile = user.mobile
            
            # Get full_name based on user role
            if user.role == "member" and payment_order.payer_user_id in member_map:
                member = member_map[payment_order.payer_user_id]
                customer_name = member.full_name if member.full_name else user.email
            elif user.role == "centeradmin" and payment_order.payer_user_id in admin_map:
                admin = admin_map[payment_order.payer_user_id]
                customer_name = admin.full_name if admin.full_name else user.email
            elif user.role == "employee" and payment_order.payer_user_id in employee_map:
                employee = employee_map[payment_order.payer_user_id]
                customer_name = employee.full_name if employee.full_name else user.email
            else:
                customer_name = user.email

        # Apply customer search filter in Python if needed
        if customer_search:
            search_lower = customer_search.lower()
            if not (
                (customer_name and search_lower in customer_name.lower()) or
                (customer_mobile and search_lower in customer_mobile.lower())
            ):
                continue

        # Determine display labels
        if payment_order.order_type in [OrderType.membership, OrderType.center_subscription, OrderType.renewal]:
            type_label = "Membership"
            source_label = "Local"
        elif payment_order.order_type == OrderType.networking_access:
            type_label = "Network"
            source_label = "Visit"
        elif payment_order.order_type in [OrderType.stock_purchase, OrderType.feature_purchase]:
            type_label = "Product"
            source_label = "POS"
        else:
            type_label = "Other"
            source_label = "Other"

        transactions.append({
            "payment_order_id": str(payment_order.payment_order_id),
            "invoice_number": f"INV{str(payment_order.payment_order_id)[:8].upper()}",
            "customer_name": customer_name,
            "customer_mobile": customer_mobile,
            "customer_id": str(payment_order.payer_user_id) if payment_order.payer_user_id else None,
            "type": type_label,
            "source": source_label,
            "order_type": payment_order.order_type.value if payment_order.order_type else None,
            "date": payment_order.created_at.date().isoformat() if payment_order.created_at else None,
            "datetime": payment_order.created_at.isoformat() if payment_order.created_at else None,
            "subtotal_amount": str(payment_order.subtotal_amount),
            "tax_amount": str(payment_order.tax_amount),
            "total_amount": str(payment_order.total_amount),
            "currency": payment_order.currency.value if payment_order.currency else "INR",
            "payment_method": payment_order.payment_method.value if payment_order.payment_method else "N/A",
            "payment_status": payment_order.status.value if payment_order.status else "unknown",
            "reference_schema": payment_order.reference_schema.value if payment_order.reference_schema else None,
            "reference_id": str(payment_order.reference_id) if payment_order.reference_id else None,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": None,
        "has_more": len(payment_orders) == page_size,
        "date_from": date_from_parsed.date().isoformat() if date_from_parsed else None,
        "date_to": date_to_parsed.date().isoformat() if date_to_parsed else None,
        "transactions": transactions,
    }




@router.get("/billing/sales/{payment_order_id}", summary="Get bill detail")
async def get_bill_detail(
    payment_order_id: str = Path(..., description="Payment Order ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get detailed information about a specific bill/payment order.
    Used for the bill detail drawer when clicking on a transaction row.
    """
    from app.billing.models.models import PaymentOrder, OrderType
    from app.auth.models.models import Member, User, CenterAdmin, Employee
    from app.inventory.models.models import Sale, SaleItem, Product
    from app.membership.models.models import MemberMembership, Membership
    from app.auth.models.models import UserCenterMembership
    from app.center.models.models import Center

    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Get payment order using select instead of get
    po_result = await db.execute(
        select(PaymentOrder).where(PaymentOrder.payment_order_id == payment_order_id)
    )
    payment_order = po_result.scalar_one_or_none()
    
    if not payment_order:
        raise HTTPException(404, "Payment order not found")
    
    if str(payment_order.center_id) != str(center_id):
        raise HTTPException(403, "Access denied")

    # Get customer details
    customer_info = None
    if payment_order.payer_user_id:
        user_result = await db.execute(
            select(User).where(User.id == payment_order.payer_user_id)
        )
        customer = user_result.scalar_one_or_none()
        
        if customer:
            customer_name = customer.email
            
            # Get full_name based on role
            if customer.role == "member":
                member_result = await db.execute(
                    select(Member).where(Member.id == payment_order.payer_user_id)
                )
                member = member_result.scalar_one_or_none()
                customer_name = member.full_name if member and member.full_name else customer.email
            elif customer.role == "centeradmin":
                admin_result = await db.execute(
                    select(CenterAdmin).where(CenterAdmin.id == payment_order.payer_user_id)
                )
                admin = admin_result.scalar_one_or_none()
                customer_name = admin.full_name if admin and admin.full_name else customer.email
            elif customer.role == "employee":
                employee_result = await db.execute(
                    select(Employee).where(Employee.id == payment_order.payer_user_id)
                )
                employee = employee_result.scalar_one_or_none()
                customer_name = employee.full_name if employee and employee.full_name else customer.email
            
            customer_info = {
                "id": str(customer.id),
                "full_name": customer_name,
                "mobile": customer.mobile,
                "email": customer.email,
            }

    # Get center details
    center_info = None
    if payment_order.center_id:
        center_result = await db.execute(
            select(Center).where(Center.id == payment_order.center_id)
        )
        center = center_result.scalar_one_or_none()
        
        if center:
            center_info = {
                "id": str(center.id),
                "name": center.center_name,
                "email": center.center_email,
                "phone": center.center_phone,
            }

    # Get line items based on order type
    line_items = []
    
    if payment_order.order_type in [OrderType.membership, OrderType.center_subscription, OrderType.renewal]:
        # Get membership details
        if payment_order.reference_id:
            mm_result = await db.execute(
                select(MemberMembership).where(MemberMembership.id == payment_order.reference_id)
            )
            member_membership = mm_result.scalar_one_or_none()
            
            if member_membership and member_membership.membership_id:
                membership_result = await db.execute(
                    select(Membership).where(Membership.id == member_membership.membership_id)
                )
                membership = membership_result.scalar_one_or_none()
                
                if membership:
                    line_items.append({
                        "description": f"{membership.membership_name} - {membership.duration_count} {membership.duration_unit.value}",
                        "quantity": 1,
                        "unit_price": str(member_membership.paid_amount),
                        "total": str(member_membership.paid_amount),
                    })

    elif payment_order.order_type == OrderType.networking_access:
        # Get networking details
        if payment_order.reference_id:
            ucm_result = await db.execute(
                select(UserCenterMembership).where(UserCenterMembership.id == payment_order.reference_id)
            )
            network_membership = ucm_result.scalar_one_or_none()
            
            if network_membership:
                network_center = None
                if network_membership.center_id:
                    nc_result = await db.execute(
                        select(Center).where(Center.id == network_membership.center_id)
                    )
                    network_center = nc_result.scalar_one_or_none()
                
                days = 1
                if network_membership.start_date and network_membership.end_date:
                    days = (network_membership.end_date - network_membership.start_date).days + 1
                
                line_items.append({
                    "description": f"Networking Access - {network_center.center_name if network_center else 'N/A'}",
                    "quantity": days,
                    "unit_price": str(payment_order.total_amount / Decimal(days)),
                    "total": str(payment_order.total_amount),
                    "period": f"{network_membership.start_date} to {network_membership.end_date}" if network_membership.start_date else None,
                })

    elif payment_order.order_type in [OrderType.stock_purchase, OrderType.feature_purchase]:
        # Get product sale details
        if payment_order.reference_id:
            sale_result = await db.execute(
                select(Sale).where(Sale.id == payment_order.reference_id)
            )
            sale = sale_result.scalar_one_or_none()
            
            if sale:
                # Get sale items
                sale_items_result = await db.execute(
                    select(SaleItem, Product)
                    .join(Product, SaleItem.product_id == Product.id)
                    .where(SaleItem.sale_id == sale.id)
                )
                sale_items = sale_items_result.all()
                
                for sale_item, product in sale_items:
                    line_items.append({
                        "description": product.name if product else "Product",
                        "quantity": int(sale_item.quantity),
                        "unit_price": str(sale_item.unit_price),
                        "total": str(sale_item.total_price),
                    })

    # Determine labels
    if payment_order.order_type in [OrderType.membership, OrderType.center_subscription, OrderType.renewal]:
        type_label = "Membership"
        source_label = "Local"
    elif payment_order.order_type == OrderType.networking_access:
        type_label = "Network"
        source_label = "Visit"
    elif payment_order.order_type in [OrderType.stock_purchase, OrderType.feature_purchase]:
        type_label = "Product"
        source_label = "POS"
    else:
        type_label = "Other"
        source_label = "Other"

    # Build response
    return {
        "payment_order_id": str(payment_order.payment_order_id),
        "invoice_number": f"INV{str(payment_order.payment_order_id)[:8].upper()}",
        "order_type": payment_order.order_type.value if payment_order.order_type else None,
        "type_label": type_label,
        "source_label": source_label,
        "customer": customer_info,
        "center": center_info,
        "date": payment_order.created_at.date().isoformat() if payment_order.created_at else None,
        "datetime": payment_order.created_at.isoformat() if payment_order.created_at else None,
        "subtotal_amount": str(payment_order.subtotal_amount),
        "tax_amount": str(payment_order.tax_amount),
        "total_amount": str(payment_order.total_amount),
        "currency": payment_order.currency.value if payment_order.currency else "INR",
        "payment_method": payment_order.payment_method.value if payment_order.payment_method else None,
        "payment_status": payment_order.status.value if payment_order.status else None,
        "line_items": line_items,
        "notes": None,
        "reference_schema": payment_order.reference_schema.value if payment_order.reference_schema else None,
        "reference_id": str(payment_order.reference_id) if payment_order.reference_id else None,
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
    payment_method_value = None
    
    if payload.payment:
        if payload.payment.amount >= total_amount:
            payment_status = PaymentOrderStatus.paid
        try:
            payment_method_value = PaymentMethod[payload.payment.method.value]
        except (KeyError, AttributeError):
            payment_method_value = None

    # Create PaymentOrder
    try:
        payment_order = PaymentOrder(
            payer_user_id=UUID(payload.customer_id),
            payer_type=getattr(customer, "role", "member"),
            payee_type="center",
            center_id=UUID(center_id),
            order_type=order_type,
            reference_schema=ReferenceSchema.invoice,
            reference_id=None,
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency="INR",
            status=payment_status,
            payment_method=payment_method_value,
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
    date_filter: Optional[str] = Query(None, description="Date for summary (YYYY-MM-DD or 'null', default: today)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get daily sales summary with totals by type and payment method
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Parse date parameter
    target_date = date.today()
    if date_filter and date_filter.lower() != "null":
        try:
            target_date = date.fromisoformat(date_filter)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or 'null'")

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