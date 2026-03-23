from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.core.dependencies import get_async_session, centeradmin_required
from app.billing.schema.schema import *
from app.billing.models.models import Currency, PaymentOrder, PaymentOrderStatus, ReferenceSchema, PaymentMethod, OrderType, MiscellaneousTransaction, PayerType
from app.inventory.models.models import Sale, SaleItem, Product
from app.membership.models.models import MemberMembership, Membership, DurationUnitEnum
from app.auth.models.models import Member, User, UserCenterMembership, NetworkingStatusEnum, Employee
from app.settings.models.models import TaxCategory, CenterOperationalSetting, Designation
from app.center.models.models import Center, CenterWallet, WalletTransaction
from sqlalchemy.orm import selectinload
from uuid import UUID
from uuid import uuid4
from calendar import monthrange
from fastapi.responses import StreamingResponse
from app.billing.utils.reports import BillingReportGenerator
import io
import csv
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from app.accounts.other_charges_helper import post_miscellaneous_transaction_journal






router = APIRouter()


#dashboard data for billing - total revenue, pending payments, network earnings, this month total, revenue trend chart (monthly memberships, inventory sales, networking)
@router.get("/billing/dashboard", summary="Billing Dashboard")
async def get_billing_dashboard(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get comprehensive billing dashboard data.
    
    Returns:
    - Total revenue (all time)
    - Pending payments
    - Network earnings
    - This month total revenue
    - Revenue trend chart (monthly: memberships, inventory sales, networking)
    """
    from sqlalchemy import extract
    
    center_id = current_admin["center_id"]
    today = date.today()
    current_year = today.year
    
    # Current month date range
    month_start = today.replace(day=1)
    next_month = month_start.replace(day=28) + timedelta(days=4)
    month_end = next_month.replace(day=1) - timedelta(days=1)
    
    # ===== 1. TOTAL REVENUE (All Time) =====
    # Sum all paid payment orders for this center
    total_revenue_query = select(
        func.coalesce(func.sum(PaymentOrder.total_amount), 0)
    ).where(
        PaymentOrder.center_id == center_id,
        PaymentOrder.status == PaymentOrderStatus.paid
    )
    total_revenue_result = await db.execute(total_revenue_query)
    total_revenue = float(total_revenue_result.scalar_one() or 0)
    
    # ===== 2. PENDING PAYMENTS =====
    # Sum all pending/unpaid payment orders
    pending_payments_query = select(
        func.coalesce(func.sum(PaymentOrder.total_amount), 0)
    ).where(
        PaymentOrder.center_id == center_id,
        PaymentOrder.status.in_([
            PaymentOrderStatus.pending, 
            PaymentOrderStatus.unpaid,
            PaymentOrderStatus.created
        ])
    )
    pending_payments_result = await db.execute(pending_payments_query)
    pending_payments = float(pending_payments_result.scalar_one() or 0)
    
    # ===== 3. NETWORK EARNINGS =====
    # Sum all paid networking_access payment orders
    network_earnings_query = select(
        func.coalesce(func.sum(PaymentOrder.total_amount), 0)
    ).where(
        PaymentOrder.center_id == center_id,
        PaymentOrder.order_type == OrderType.networking_access,
        PaymentOrder.status == PaymentOrderStatus.paid
    )
    network_earnings_result = await db.execute(network_earnings_query)
    network_earnings = float(network_earnings_result.scalar_one() or 0)
    
    # ===== 4. THIS MONTH TOTAL =====
    # Sum all paid payments for current month
    this_month_query = select(
        func.coalesce(func.sum(PaymentOrder.total_amount), 0)
    ).where(
        PaymentOrder.center_id == center_id,
        PaymentOrder.status == PaymentOrderStatus.paid,
        PaymentOrder.created_at >= datetime.combine(month_start, datetime.min.time()),
        PaymentOrder.created_at <= datetime.combine(month_end, datetime.max.time())
    )
    this_month_result = await db.execute(this_month_query)
    this_month_total = float(this_month_result.scalar_one() or 0)
    
    # ===== 5. REVENUE TREND CHART (Monthly for current year) =====
    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    
    # A. Monthly Membership Revenue
    # membership and renewal order types
    membership_revenue_query = select(
        extract('month', PaymentOrder.created_at).label('month'),
        func.coalesce(func.sum(PaymentOrder.total_amount), 0).label('revenue')
    ).where(
        PaymentOrder.center_id == center_id,
        PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal]),
        PaymentOrder.status == PaymentOrderStatus.paid,
        extract('year', PaymentOrder.created_at) == current_year
    ).group_by('month')
    
    membership_result = await db.execute(membership_revenue_query)
    monthly_membership = {int(row.month): float(row.revenue) for row in membership_result}
    
    # B. Monthly Inventory Sales Revenue
    # Get product IDs for this center
    product_ids_query = select(Product.id).where(Product.center_id == center_id)
    product_ids_result = await db.execute(product_ids_query)
    product_ids = [str(row[0]) for row in product_ids_result.all()]
    
    monthly_inventory = {}
    if product_ids:
        # Sum completed sales for products
        inventory_revenue_query = select(
            extract('month', Sale.created_at).label('month'),
            func.coalesce(func.sum(Sale.total_amount), 0).label('revenue')
        ).where(
            Sale.center_id == center_id,
            Sale.status == "completed",
            extract('year', Sale.created_at) == current_year
        ).group_by('month')
        
        inventory_result = await db.execute(inventory_revenue_query)
        monthly_inventory = {int(row.month): float(row.revenue) for row in inventory_result}
    
    # C. Monthly Networking Revenue
    networking_revenue_query = select(
        extract('month', PaymentOrder.created_at).label('month'),
        func.coalesce(func.sum(PaymentOrder.total_amount), 0).label('revenue')
    ).where(
        PaymentOrder.center_id == center_id,
        PaymentOrder.order_type == OrderType.networking_access,
        PaymentOrder.status == PaymentOrderStatus.paid,
        extract('year', PaymentOrder.created_at) == current_year
    ).group_by('month')
    
    networking_result = await db.execute(networking_revenue_query)
    monthly_networking = {int(row.month): float(row.revenue) for row in networking_result}
    
    # Build revenue trend array for all 12 months
    revenue_trend_chart = []
    for month_num in range(1, 13):
        revenue_trend_chart.append({
            "month": month_names[month_num - 1],
            "memberships": round(monthly_membership.get(month_num, 0), 2),
            "inventory_sales": round(monthly_inventory.get(month_num, 0), 2),
            "networking": round(monthly_networking.get(month_num, 0), 2)
        })
    
    return {
        "center_id": str(center_id),
        "generated_at": datetime.now().isoformat(),
        "total_revenue": round(total_revenue, 2),
        "pending_payments": round(pending_payments, 2),
        "network_earnings": round(network_earnings, 2),
        "this_month_total": round(this_month_total, 2),
        "revenue_trend_chart": revenue_trend_chart
    }



#------------billing sales endpoints----------------

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



#------------billing membership endpoints----------------

@router.get("/billing/memberships", summary="Get membership billing list")
async def get_membership_billing_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: Optional[str] = Query(None, description="Search by member name or mobile"),
    status_filter: Optional[str] = Query(None, description="Filter by: active, due, expired"),
    sort_by: str = Query("end_date", description="Sort by: end_date, member_name, total_amount"),
    sort_order: str = Query("asc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    from sqlalchemy import or_
    from app.auth.models.models import Member
    from app.membership.models.models import MemberMembership, Membership

    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center admin required")

    # Base query: memberships for this center
    query = select(MemberMembership).options(
        selectinload(MemberMembership.member),
        selectinload(MemberMembership.membership)
    ).where(MemberMembership.center_id == center_id)

    # Search filter
    if search:
        query = query.join(Member, MemberMembership.member_id == Member.id)
        query = query.where(
            or_(
                Member.full_name.ilike(f"%{search}%"),
                Member.mobile.ilike(f"%{search}%")
            )
        )

    # Status filter
    now = datetime.utcnow()
    if status_filter == "active":
        query = query.where(
            MemberMembership.end_date >= now,
            MemberMembership.membership_status == "active"
        )
    elif status_filter == "due":
        due_date = now + timedelta(days=7)
        query = query.where(
            MemberMembership.end_date >= now,
            MemberMembership.end_date <= due_date,
            MemberMembership.membership_status == "active"
        )
    elif status_filter == "expired":
        query = query.where(
            MemberMembership.end_date < now,
            MemberMembership.membership_status == "active"
        )

    # Sorting
    sort_column = {
        "end_date": MemberMembership.end_date,
        "member_name": Member.full_name,
        "total_amount": MemberMembership.total_amount
    }.get(sort_by, MemberMembership.end_date)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    # Pagination
    total_result = await db.execute(
        query.with_only_columns(func.count()).order_by(None)
    )
    total = total_result.scalar_one()
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    memberships = result.scalars().all()

    # Build response
    data = []
    now_date = datetime.utcnow().date()
    for mm in memberships:
        member = mm.member
        membership_plan = mm.membership
        end_date = mm.end_date.date() if mm.end_date else None
        days_until_expiry = (end_date - now_date).days if end_date else None
        data.append({
            "member_membership_id": str(mm.id),
            "member_id": str(mm.member_id),
            "member_name": member.full_name if member else None,
            "member_mobile": member.mobile if member else None,
            "membership_id": str(mm.membership_id),
            "membership_name": membership_plan.membership_name if membership_plan else None,
            "start_date": mm.start_date,
            "end_date": mm.end_date,
            "total_amount": float(mm.total_amount) if mm.total_amount is not None else None,
            "status": mm.membership_status.value if hasattr(mm.membership_status, "value") else mm.membership_status,
            "action_type": mm.action_type.value if hasattr(mm.action_type, "value") else mm.action_type,
            "days_until_expiry": days_until_expiry,
        })

    return {
        "memberships": data,
        "page": page,
        "page_size": page_size,
        "total": total
    }


@router.get("/billing/memberships/{member_membership_id}/renewal-details", summary="Get renewal details")
async def get_renewal_details(
    member_membership_id: str = Path(..., description="Member Membership ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get details for renewing a membership.
    Used to populate the Renew Panel with plan details and calculate total.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Get member membership
    mm_result = await db.execute(
        select(MemberMembership).where(MemberMembership.id == member_membership_id)
    )
    member_membership = mm_result.scalar_one_or_none()

    if not member_membership:
        raise HTTPException(404, "Member membership not found")

    if str(member_membership.center_id) != str(center_id):
        raise HTTPException(403, "Access denied")

    # Get membership details
    membership_result = await db.execute(
        select(Membership).where(Membership.membership_id == member_membership.membership_id)
    )
    membership = membership_result.scalar_one_or_none()

    if not membership:
        raise HTTPException(404, "Membership plan not found")

    # Get member details
    member_result = await db.execute(
        select(Member).where(Member.id == member_membership.member_id)
    )
    member = member_result.scalar_one_or_none()

    user_result = await db.execute(
        select(User).where(User.id == member_membership.member_id)
    )
    user = user_result.scalar_one_or_none()

    member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")

    # Get tax category if exists
    tax_percentage = Decimal("0.00")
    tax_category_id = None
    if member_membership.tax_category_id:
        tax_result = await db.execute(
            select(TaxCategory).where(TaxCategory.id == member_membership.tax_category_id)
        )
        tax_category = tax_result.scalar_one_or_none()
        if tax_category and tax_category.is_active:
            tax_percentage = Decimal(str(tax_category.tax_percentage or "0.00"))
            tax_category_id = str(tax_category.id)

    # Calculate amounts
    base_price = Decimal(str(membership.default_price))
    tax_amount = (base_price * (tax_percentage / Decimal("100.0"))).quantize(Decimal("0.01"))
    total_amount = (base_price + tax_amount).quantize(Decimal("0.01"))

    return {
        "member_membership_id": str(member_membership.id),
        "member_id": str(member_membership.member_id),
        "member_name": member_name,
        "plan_name": membership.membership_name,
        "plan_code": membership.membership_code,
        "duration_count": membership.duration_count,
        "duration_unit": membership.duration_unit.value,
        "base_price": str(base_price),
        "tax_percentage": str(tax_percentage),
        "tax_amount": str(tax_amount),
        "tax_category_id": tax_category_id,
        "total_amount": str(total_amount),
        "current_end_date": member_membership.end_date.date().isoformat() if member_membership.end_date else None,
    }


@router.post("/billing/memberships/{member_membership_id}/renew", summary="Renew membership")
async def renew_membership(
    member_membership_id: str = Path(..., description="Member Membership ID"),
    payload: MembershipRenewalRequest = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Process membership renewal with payment.
    Creates a new membership period and payment order.
    """
    center_id = current_admin.get("center_id")
    admin_id = current_admin.get("id")
    
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Get existing member membership
    mm_result = await db.execute(
        select(MemberMembership).where(MemberMembership.id == member_membership_id)
    )
    member_membership = mm_result.scalar_one_or_none()

    if not member_membership:
        raise HTTPException(404, "Member membership not found")

    if str(member_membership.center_id) != str(center_id):
        raise HTTPException(403, "Access denied")

    # Get membership plan
    membership_result = await db.execute(
        select(Membership).where(Membership.membership_id == member_membership.membership_id)
    )
    membership = membership_result.scalar_one_or_none()

    if not membership:
        raise HTTPException(404, "Membership plan not found")

    # Calculate new dates
    current_end_date = member_membership.end_date or datetime.utcnow()
    
    if membership.duration_unit == DurationUnitEnum.day:
        new_end_date = current_end_date + timedelta(days=membership.duration_count)
    elif membership.duration_unit == DurationUnitEnum.month:
        new_end_date = current_end_date + timedelta(days=membership.duration_count * 30)
    elif membership.duration_unit == DurationUnitEnum.year:
        new_end_date = current_end_date + timedelta(days=membership.duration_count * 365)

    # Calculate amounts
    base_price = Decimal(str(membership.default_price))
    discount = Decimal(str(payload.discount_amount)) if payload.discount_amount else Decimal("0.00")
    subtotal = (base_price - discount).quantize(Decimal("0.01"))

    # Calculate tax
    tax_amount = Decimal("0.00")
    tax_category_id = None
    
    if payload.tax_category_id:
        tax_result = await db.execute(
            select(TaxCategory).where(TaxCategory.id == payload.tax_category_id)
        )
        tax_category = tax_result.scalar_one_or_none()
        if tax_category and tax_category.is_active:
            tax_percentage = Decimal(str(tax_category.tax_percentage or "0.00"))
            tax_amount = (subtotal * (tax_percentage / Decimal("100.0"))).quantize(Decimal("0.01"))
            tax_category_id = tax_category.id
    elif member_membership.tax_category_id:
        # Use existing tax category
        tax_result = await db.execute(
            select(TaxCategory).where(TaxCategory.id == member_membership.tax_category_id)
        )
        tax_category = tax_result.scalar_one_or_none()
        if tax_category and tax_category.is_active:
            tax_percentage = Decimal(str(tax_category.tax_percentage or "0.00"))
            tax_amount = (subtotal * (tax_percentage / Decimal("100.0"))).quantize(Decimal("0.01"))
            tax_category_id = tax_category.id

    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    # Validate payment method
    try:
        payment_method_enum = PaymentMethod[payload.payment_method]
    except KeyError:
        raise HTTPException(400, f"Invalid payment method: {payload.payment_method}")

    try:
        # Create new member membership record for renewal
        new_member_membership = MemberMembership(
            member_id=member_membership.member_id,
            membership_id=member_membership.membership_id,
            center_id=UUID(center_id),
            start_date=current_end_date,
            end_date=new_end_date,
            tax_category_id=tax_category_id,
            total_amount=total_amount,
            auto_renewal_enabled=member_membership.auto_renewal_enabled,
            membership_status=member_membership.membership_status,
            created_by=UUID(admin_id) if admin_id else None,
        )
        
        db.add(new_member_membership)
        await db.flush()

        # Create payment order
        payment_order = PaymentOrder(
            payer_user_id=member_membership.member_id,
            payer_type="user",
            payee_type="center",
            center_id=UUID(center_id),
            order_type=OrderType.renewal,
            reference_schema=ReferenceSchema.center,
            reference_id=new_member_membership.id,
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency="INR",
            status=PaymentOrderStatus.paid,
            payment_method=payment_method_enum,
            created_by=UUID(admin_id) if admin_id else None,
        )

        db.add(payment_order)
        await db.flush()
        
        # Update the old membership end date to mark it as renewed
        member_membership.membership_status = "inactive"
        db.add(member_membership)
        
        await db.commit()
        await db.refresh(new_member_membership)
        await db.refresh(payment_order)

        return {
            "message": "Membership renewed successfully",
            "member_membership_id": str(new_member_membership.id),
            "payment_order_id": str(payment_order.payment_order_id),
            "invoice_number": f"INV{str(payment_order.payment_order_id)[:8].upper()}",
            "new_start_date": new_member_membership.start_date.date().isoformat(),
            "new_end_date": new_member_membership.end_date.date().isoformat(),
            "total_amount": str(total_amount),
            "payment_status": "paid",
        }

    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to renew membership: {exc}")


@router.get("/billing/memberships/{member_membership_id}", summary="Get membership billing detail")
async def get_membership_billing_detail(
    member_membership_id: str = Path(..., description="Member Membership ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get detailed billing information for a specific membership.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Get member membership
    mm_result = await db.execute(
        select(MemberMembership).where(MemberMembership.id == member_membership_id)
    )
    member_membership = mm_result.scalar_one_or_none()

    if not member_membership:
        raise HTTPException(404, "Member membership not found")

    if str(member_membership.center_id) != str(center_id):
        raise HTTPException(403, "Access denied")

    # Get membership
    membership_result = await db.execute(
        select(Membership).where(Membership.membership_id == member_membership.membership_id)
    )
    membership = membership_result.scalar_one_or_none()

    # Get member
    member_result = await db.execute(
        select(Member).where(Member.id == member_membership.member_id)
    )
    member = member_result.scalar_one_or_none()

    user_result = await db.execute(
        select(User).where(User.id == member_membership.member_id)
    )
    user = user_result.scalar_one_or_none()

    # Get payment history for this membership
    payments_result = await db.execute(
        select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id == member_membership.id,
                PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal])
            )
        ).order_by(PaymentOrder.created_at.desc())
    )
    payments = payments_result.scalars().all()

    payment_history = [
        {
            "payment_order_id": str(p.payment_order_id),
            "invoice_number": f"INV{str(p.payment_order_id)[:8].upper()}",
            "date": p.created_at.date().isoformat() if p.created_at else None,
            "amount": str(p.total_amount),
            "payment_method": p.payment_method.value if p.payment_method else None,
            "status": p.status.value if p.status else None,
        }
        for p in payments
    ]

    return {
        "member_membership_id": str(member_membership.id),
        "member": {
            "id": str(member.id) if member else None,
            "full_name": member.full_name if member and member.full_name else (user.email if user else "N/A"),
            "mobile": user.mobile if user else None,
            "email": user.email if user else None,
        },
        "membership": {
            "id": str(membership.membership_id) if membership else None,
            "name": membership.membership_name if membership else "N/A",
            "code": membership.membership_code if membership else None,
            "duration": f"{membership.duration_count} {membership.duration_unit.value}" if membership else None,
        },
        "start_date": member_membership.start_date.date().isoformat() if member_membership.start_date else None,
        "end_date": member_membership.end_date.date().isoformat() if member_membership.end_date else None,
        "total_amount": str(member_membership.total_amount),
        "auto_renewal_enabled": member_membership.auto_renewal_enabled,
        "membership_status": member_membership.membership_status.value if member_membership.membership_status else None,
        "payment_history": payment_history,
    }




#------------billing network visits endpoints----------------

@router.get("/billing/network-visits/incoming", summary="Get incoming network visits")
async def get_incoming_network_visits(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status_filter: Optional[str] = Query(None, description="Filter by: pending, approved, paid, completed, pending_settlement"),
    search: Optional[str] = Query(None, description="Search by member name"),
    sort_by: str = Query("start_date", description="Sort by: start_date, total_charge"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get incoming network visits - members from other centers visiting this center.
    Shows: Member | Home Center | Visit Date | Charge | Fee(15%) | Earn | Status
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Parse dates
    date_from_parsed = None
    date_to_parsed = None

    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid date_from format. Use YYYY-MM-DD")

    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid date_to format. Use YYYY-MM-DD")

    # Build query - get visits TO this center (incoming)
    where_clauses = [UserCenterMembership.center_id == center_id]

    if date_from_parsed:
        where_clauses.append(UserCenterMembership.start_date >= date_from_parsed)

    if date_to_parsed:
        where_clauses.append(UserCenterMembership.start_date <= date_to_parsed)

    if status_filter:
        try:
            status_enum = NetworkingStatusEnum[status_filter]
            where_clauses.append(UserCenterMembership.network_status == status_enum)
        except KeyError:
            raise HTTPException(400, f"Invalid status: {status_filter}")

    query = select(UserCenterMembership).where(*where_clauses)
    result = await db.execute(query)
    network_memberships = result.scalars().all()

    # Collect unique IDs for batch fetching
    user_ids = {nm.user_id for nm in network_memberships}
    
    # Batch fetch members
    member_map = {}
    user_map = {}
    home_center_map = {}
    
    if user_ids:
        # Get members
        members_result = await db.execute(
            select(Member).where(Member.id.in_(user_ids))
        )
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
        
        # Get base users for mobile/email
        users_result = await db.execute(
            select(User).where(User.id.in_(user_ids))
        )
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
        
        # Get home centers
        home_center_ids = {m.home_center_id for m in members if m.home_center_id}
        if home_center_ids:
            centers_result = await db.execute(
                select(Center).where(Center.id.in_(home_center_ids))
            )
            centers = centers_result.scalars().all()
            home_center_map = {c.id: c for c in centers}

    # Get payment orders for these visits
    payment_order_map = {}
    if network_memberships:
        network_membership_ids = {nm.id for nm in network_memberships}
        payments_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(network_membership_ids),
                    PaymentOrder.order_type == OrderType.networking_access
                )
            )
        )
        payments = payments_result.scalars().all()
        payment_order_map = {p.reference_id: p for p in payments}

    # Build response
    visits_list = []
    platform_fee_percentage = Decimal("0.15")  # 15% platform fee

    for nm in network_memberships:
        member = member_map.get(nm.user_id)
        user = user_map.get(nm.user_id)
        home_center = home_center_map.get(member.home_center_id) if member else None
        payment_order = payment_order_map.get(nm.id)

        if not member:
            continue

        member_name = member.full_name if member.full_name else (user.email if user else "N/A")
        
        # Calculate charges
        total_charge = payment_order.total_amount if payment_order else Decimal("0.00")
        platform_fee = (total_charge * platform_fee_percentage).quantize(Decimal("0.01"))
        earn = (total_charge - platform_fee).quantize(Decimal("0.01"))

        # Apply search filter
        if search:
            search_lower = search.lower()
            if search_lower not in member_name.lower():
                continue

        visits_list.append({
            "network_membership_id": str(nm.id),
            "member_id": str(nm.user_id),
            "member_name": member_name,
            "member_mobile": user.mobile if user else None,
            "home_center_id": str(member.home_center_id) if member.home_center_id else None,
            "home_center_name": home_center.center_name if home_center else "N/A",
            "visit_date": nm.start_date.isoformat() if nm.start_date else None,
            "start_date": nm.start_date.isoformat() if nm.start_date else None,
            "end_date": nm.end_date.isoformat() if nm.end_date else None,
            "total_charge": str(total_charge),
            "platform_fee": str(platform_fee),
            "platform_fee_percentage": "15",
            "earn": str(earn),
            "status": nm.network_status.value if nm.network_status else "pending",
            "payment_order_id": str(payment_order.payment_order_id) if payment_order else None,
            "payment_status": payment_order.status.value if payment_order else None,
        })

    # Sort
    reverse = (sort_order == "desc")
    if sort_by == "total_charge":
        visits_list.sort(key=lambda x: Decimal(x["total_charge"]), reverse=reverse)
    else:  # default to start_date
        visits_list.sort(
            key=lambda x: x["start_date"] if x["start_date"] else "9999-12-31",
            reverse=reverse
        )

    # Pagination
    total = len(visits_list)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_list = visits_list[start_idx:end_idx]

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "visits": paginated_list,
    }


@router.get("/billing/network-visits/outgoing", summary="Get outgoing network visits")
async def get_outgoing_network_visits(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status_filter: Optional[str] = Query(None, description="Filter by: pending, approved, paid, completed, pending_settlement"),
    search: Optional[str] = Query(None, description="Search by member name"),
    sort_by: str = Query("start_date", description="Sort by: start_date, total_charge"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get outgoing network visits - this center's members visiting other centers.
    Shows: Member | Visited Center | Date | Charge | Fee | Paid | Status
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Parse dates
    date_from_parsed = None
    date_to_parsed = None

    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid date_from format. Use YYYY-MM-DD")

    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid date_to format. Use YYYY-MM-DD")

    # Get members of this center
    members_result = await db.execute(
        select(Member).where(Member.home_center_id == center_id)
    )
    center_members = members_result.scalars().all()
    center_member_ids = {m.id for m in center_members}

    if not center_member_ids:
        return {
            "page": page,
            "page_size": page_size,
            "total": 0,
            "visits": [],
        }

    # Build query - get visits BY this center's members (outgoing)
    where_clauses = [
        UserCenterMembership.user_id.in_(center_member_ids),
        UserCenterMembership.center_id != center_id  # Visiting OTHER centers
    ]

    if date_from_parsed:
        where_clauses.append(UserCenterMembership.start_date >= date_from_parsed)

    if date_to_parsed:
        where_clauses.append(UserCenterMembership.start_date <= date_to_parsed)

    if status_filter:
        try:
            status_enum = NetworkingStatusEnum[status_filter]
            where_clauses.append(UserCenterMembership.network_status == status_enum)
        except KeyError:
            raise HTTPException(400, f"Invalid status: {status_filter}")

    query = select(UserCenterMembership).where(*where_clauses)
    result = await db.execute(query)
    network_memberships = result.scalars().all()

    # Collect unique IDs for batch fetching
    user_ids = {nm.user_id for nm in network_memberships}
    visited_center_ids = {nm.center_id for nm in network_memberships}
    
    # Batch fetch members and users
    member_map = {m.id: m for m in center_members}
    
    user_map = {}
    if user_ids:
        users_result = await db.execute(
            select(User).where(User.id.in_(user_ids))
        )
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
    
    # Batch fetch visited centers
    visited_center_map = {}
    if visited_center_ids:
        centers_result = await db.execute(
            select(Center).where(Center.id.in_(visited_center_ids))
        )
        centers = centers_result.scalars().all()
        visited_center_map = {c.id: c for c in centers}

    # Get payment orders for these visits
    payment_order_map = {}
    if network_memberships:
        network_membership_ids = {nm.id for nm in network_memberships}
        payments_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(network_membership_ids),
                    PaymentOrder.order_type == OrderType.networking_access
                )
            )
        )
        payments = payments_result.scalars().all()
        payment_order_map = {p.reference_id: p for p in payments}

    # Build response
    visits_list = []
    platform_fee_percentage = Decimal("0.15")  # 15% platform fee

    for nm in network_memberships:
        member = member_map.get(nm.user_id)
        user = user_map.get(nm.user_id)
        visited_center = visited_center_map.get(nm.center_id)
        payment_order = payment_order_map.get(nm.id)

        if not member:
            continue

        member_name = member.full_name if member.full_name else (user.email if user else "N/A")
        
        # Calculate charges
        total_charge = payment_order.total_amount if payment_order else Decimal("0.00")
        platform_fee = (total_charge * platform_fee_percentage).quantize(Decimal("0.01"))
        paid = total_charge  # Total amount paid by the member

        # Apply search filter
        if search:
            search_lower = search.lower()
            if search_lower not in member_name.lower():
                continue

        visits_list.append({
            "network_membership_id": str(nm.id),
            "member_id": str(nm.user_id),
            "member_name": member_name,
            "member_mobile": user.mobile if user else None,
            "visited_center_id": str(nm.center_id),
            "visited_center_name": visited_center.center_name if visited_center else "N/A",
            "visit_date": nm.start_date.isoformat() if nm.start_date else None,
            "start_date": nm.start_date.isoformat() if nm.start_date else None,
            "end_date": nm.end_date.isoformat() if nm.end_date else None,
            "total_charge": str(total_charge),
            "platform_fee": str(platform_fee),
            "platform_fee_percentage": "15",
            "paid": str(paid),
            "status": nm.network_status.value if nm.network_status else "pending",
            "payment_order_id": str(payment_order.payment_order_id) if payment_order else None,
            "payment_status": payment_order.status.value if payment_order else None,
        })

    # Sort
    reverse = (sort_order == "desc")
    if sort_by == "total_charge":
        visits_list.sort(key=lambda x: Decimal(x["total_charge"]), reverse=reverse)
    else:  # default to start_date
        visits_list.sort(
            key=lambda x: x["start_date"] if x["start_date"] else "9999-12-31",
            reverse=reverse
        )

    # Pagination
    total = len(visits_list)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_list = visits_list[start_idx:end_idx]

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "visits": paginated_list,
    }




@router.get("/billing/network-visits/summary", summary="Get network visits summary")
async def get_network_visits_summary(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get summary of network visits: total incoming, total outgoing, earnings, payments.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Parse dates
    date_from_parsed = None
    date_to_parsed = None

    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid date_from format. Use YYYY-MM-DD")

    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Invalid date_to format. Use YYYY-MM-DD")

    platform_fee_percentage = Decimal("0.15")

    # Incoming visits
    incoming_where = [UserCenterMembership.center_id == center_id]
    if date_from_parsed:
        incoming_where.append(UserCenterMembership.start_date >= date_from_parsed)
    if date_to_parsed:
        incoming_where.append(UserCenterMembership.start_date <= date_to_parsed)

    incoming_result = await db.execute(
        select(UserCenterMembership).where(*incoming_where)
    )
    incoming_visits = incoming_result.scalars().all()

    # Get payments for incoming
    incoming_ids = {v.id for v in incoming_visits}
    incoming_payments = []
    if incoming_ids:
        incoming_pay_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(incoming_ids),
                    PaymentOrder.order_type == OrderType.networking_access
                )
            )
        )
        incoming_payments = incoming_pay_result.scalars().all()

    incoming_total = sum(Decimal(str(p.total_amount)) for p in incoming_payments)
    incoming_fee = (incoming_total * platform_fee_percentage).quantize(Decimal("0.01"))
    incoming_earn = (incoming_total - incoming_fee).quantize(Decimal("0.01"))

    # Outgoing visits
    members_result = await db.execute(
        select(Member).where(Member.home_center_id == center_id)
    )
    center_members = members_result.scalars().all()
    center_member_ids = {m.id for m in center_members}

    outgoing_where = [
        UserCenterMembership.user_id.in_(center_member_ids) if center_member_ids else UserCenterMembership.id == None,
        UserCenterMembership.center_id != center_id
    ]
    if date_from_parsed:
        outgoing_where.append(UserCenterMembership.start_date >= date_from_parsed)
    if date_to_parsed:
        outgoing_where.append(UserCenterMembership.start_date <= date_to_parsed)

    outgoing_result = await db.execute(
        select(UserCenterMembership).where(*outgoing_where)
    )
    outgoing_visits = outgoing_result.scalars().all()

    # Get payments for outgoing
    outgoing_ids = {v.id for v in outgoing_visits}
    outgoing_payments = []
    if outgoing_ids:
        outgoing_pay_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(outgoing_ids),
                    PaymentOrder.order_type == OrderType.networking_access
                )
            )
        )
        outgoing_payments = outgoing_pay_result.scalars().all()

    outgoing_total = sum(Decimal(str(p.total_amount)) for p in outgoing_payments)
    outgoing_fee = (outgoing_total * platform_fee_percentage).quantize(Decimal("0.01"))

    return {
        "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
        "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
        "incoming": {
            "total_visits": len(incoming_visits),
            "total_charge": str(incoming_total),
            "platform_fee": str(incoming_fee),
            "total_earn": str(incoming_earn),
            "pending_count": sum(1 for v in incoming_visits if v.network_status == NetworkingStatusEnum.pending),
            "completed_count": sum(1 for v in incoming_visits if v.network_status == NetworkingStatusEnum.completed),
        },
        "outgoing": {
            "total_visits": len(outgoing_visits),
            "total_charge": str(outgoing_total),
            "platform_fee": str(outgoing_fee),
            "total_paid": str(outgoing_total),
            "pending_count": sum(1 for v in outgoing_visits if v.network_status == NetworkingStatusEnum.pending),
            "completed_count": sum(1 for v in outgoing_visits if v.network_status == NetworkingStatusEnum.completed),
        },
        "net_balance": str(incoming_earn - outgoing_total),
    }




@router.get("/billing/network-visits/{network_membership_id}", summary="Get network visit detail")
async def get_network_visit_detail(
    network_membership_id: str = Path(..., description="Network Membership ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get detailed information about a specific network visit.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Get network membership
    nm_result = await db.execute(
        select(UserCenterMembership).where(UserCenterMembership.id == network_membership_id)
    )
    network_membership = nm_result.scalar_one_or_none()

    if not network_membership:
        raise HTTPException(404, "Network visit not found")

    # Get member
    member_result = await db.execute(
        select(Member).where(Member.id == network_membership.user_id)
    )
    member = member_result.scalar_one_or_none()

    user_result = await db.execute(
        select(User).where(User.id == network_membership.user_id)
    )
    user = user_result.scalar_one_or_none()

    # Get home center
    home_center = None
    if member and member.home_center_id:
        home_center_result = await db.execute(
            select(Center).where(Center.id == member.home_center_id)
        )
        home_center = home_center_result.scalar_one_or_none()

    # Get visited center
    visited_center_result = await db.execute(
        select(Center).where(Center.id == network_membership.center_id)
    )
    visited_center = visited_center_result.scalar_one_or_none()

    # Get payment order
    payment_result = await db.execute(
        select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id == network_membership.id,
                PaymentOrder.order_type == OrderType.networking_access
            )
        )
    )
    payment_order = payment_result.scalar_one_or_none()

    # Get wallet transactions if any
    wallet_transactions = []
    if payment_order:
        wallet_txn_result = await db.execute(
            select(WalletTransaction).where(
                or_(
                    WalletTransaction.from_wallet_id.in_(
                        select(CenterWallet.id).where(
                            or_(
                                CenterWallet.center_id == member.home_center_id if member and member.home_center_id else None,
                                CenterWallet.center_id == network_membership.center_id
                            )
                        )
                    ),
                    WalletTransaction.to_wallet_id.in_(
                        select(CenterWallet.id).where(
                            or_(
                                CenterWallet.center_id == member.home_center_id if member and member.home_center_id else None,
                                CenterWallet.center_id == network_membership.center_id
                            )
                        )
                    )
                )
            ).order_by(WalletTransaction.created_at.desc())
        )
        wallet_txns = wallet_txn_result.scalars().all()
        
        wallet_transactions = [
            {
                "txn_id": str(wt.txn_id),
                "amount": str(wt.amount),
                "type": wt.type,
                "transaction_type": wt.transaction_type,
                "status": wt.status,
                "created_at": wt.created_at.isoformat() if wt.created_at else None,
            }
            for wt in wallet_txns
        ]

    # Calculate charges
    platform_fee_percentage = Decimal("0.15")
    total_charge = payment_order.total_amount if payment_order else Decimal("0.00")
    platform_fee = (total_charge * platform_fee_percentage).quantize(Decimal("0.01"))
    earn = (total_charge - platform_fee).quantize(Decimal("0.01"))

    # Determine if this is incoming or outgoing for the current center
    visit_type = "incoming" if str(network_membership.center_id) == str(center_id) else "outgoing"

    return {
        "network_membership_id": str(network_membership.id),
        "visit_type": visit_type,
        "member": {
            "id": str(member.id) if member else None,
            "full_name": member.full_name if member and member.full_name else (user.email if user else "N/A"),
            "mobile": user.mobile if user else None,
            "email": user.email if user else None,
        },
        "home_center": {
            "id": str(home_center.id) if home_center else None,
            "name": home_center.center_name if home_center else "N/A",
        } if home_center else None,
        "visited_center": {
            "id": str(visited_center.id) if visited_center else None,
            "name": visited_center.center_name if visited_center else "N/A",
        } if visited_center else None,
        "visit_date": network_membership.start_date.isoformat() if network_membership.start_date else None,
        "start_date": network_membership.start_date.isoformat() if network_membership.start_date else None,
        "end_date": network_membership.end_date.isoformat() if network_membership.end_date else None,
        "total_charge": str(total_charge),
        "platform_fee": str(platform_fee),
        "platform_fee_percentage": "15",
        "earn": str(earn) if visit_type == "incoming" else str(total_charge),
        "status": network_membership.network_status.value if network_membership.network_status else "pending",
        "payment_order": {
            "payment_order_id": str(payment_order.payment_order_id) if payment_order else None,
            "invoice_number": f"INV{str(payment_order.payment_order_id)[:8].upper()}" if payment_order else None,
            "payment_method": payment_order.payment_method.value if payment_order and payment_order.payment_method else None,
            "payment_status": payment_order.status.value if payment_order else None,
            "created_at": payment_order.created_at.isoformat() if payment_order and payment_order.created_at else None,
        } if payment_order else None,
        "wallet_transactions": wallet_transactions,
    }



#--------------Settlement APIs for Billing Module------------


# ============================================================================
# HELPER FUNCTIONS FOR SETTLEMENT
# ============================================================================

def get_period_key(date_obj: date, period_type: str) -> str:
    """Generate period key for grouping."""
    if period_type == "weekly":
        year, week, _ = date_obj.isocalendar()
        return f"{year}-W{week:02d}"
    elif period_type == "monthly":
        return f"{date_obj.year}-{date_obj.month:02d}"
    else:
        return date_obj.isoformat()


def parse_period_key(period_key: str, period_type: str) -> tuple:
    """Parse period key back to start/end dates."""
    if period_type == "weekly":
        year, week = period_key.split("-W")
        year = int(year)
        week = int(week)
        
        jan4 = date(year, 1, 4)
        week_one_monday = jan4 - timedelta(days=jan4.weekday())
        period_start = week_one_monday + timedelta(weeks=week - 1)
        period_end = period_start + timedelta(days=6)
        
        return period_start, period_end
    elif period_type == "monthly":
        year, month = period_key.split("-")
        year = int(year)
        month = int(month)
        
        period_start = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        period_end = date(year, month, last_day)
        
        return period_start, period_end
    else:
        d = datetime.strptime(period_key, "%Y-%m-%d").date()
        return d, d


def format_period_label(start: date, end: date) -> str:
    """Format period label for display."""
    if start.month == end.month:
        return f"{start.strftime('%b')} {start.day}–{end.day}"
    else:
        return f"{start.strftime('%b %d')}–{end.strftime('%b %d')}"


async def get_payroll_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Calculate employee payroll expenses for the period.
    Based on center's payroll_cycle_day setting.
    """
    ops_settings_query = select(CenterOperationalSetting).where(
        CenterOperationalSetting.center_id == center_id
    )
    ops_result = await db.execute(ops_settings_query)
    ops_settings = ops_result.scalar_one_or_none()
    
    payroll_cycle_day = ops_settings.payroll_cycle_day if ops_settings else 1
    
    employees_query = select(Employee).where(
        and_(
            Employee.center_id == center_id,
            Employee.status == "active",
            Employee.salary.isnot(None)
        )
    )
    employees_result = await db.execute(employees_query)
    employees = employees_result.scalars().all()
    
    designation_ids = {e.designation_id for e in employees if e.designation_id}
    designation_map = {}
    if designation_ids:
        designations_query = select(Designation).where(Designation.id.in_(designation_ids))
        designations_result = await db.execute(designations_query)
        designations = designations_result.scalars().all()
        designation_map = {d.id: d for d in designations}
    
    payroll_list = []
    total_payroll = Decimal("0.00")
    
    current_date = period_start
    payroll_dates_in_period = []
    
    while current_date <= period_end:
        try:
            payroll_date = date(current_date.year, current_date.month, payroll_cycle_day)
        except ValueError:
            # Handle invalid dates like Feb 30
            payroll_date = date(current_date.year, current_date.month, 28)
        
        if period_start <= payroll_date <= period_end:
            payroll_dates_in_period.append(payroll_date)
        
        if current_date.month == 12:
            current_date = date(current_date.year + 1, 1, 1)
        else:
            current_date = date(current_date.year, current_date.month + 1, 1)
    
    for payroll_date in payroll_dates_in_period:
        for employee in employees:
            # Skip if employee joined after this payroll date
            # FIX: Remove .date() call since joining_date is already a date object
            if employee.joining_date and employee.joining_date > payroll_date:
                continue
            
            designation = designation_map.get(employee.designation_id)
            
            payroll_list.append({
                "employee_id": str(employee.id),
                "employee_name": employee.full_name if employee.full_name else "N/A",
                "designation": designation.designation_name if designation else "N/A",
                "salary": str(employee.salary),
                "payroll_date": payroll_date.isoformat()
            })
            
            total_payroll += Decimal(str(employee.salary))
    
    return {
        "payroll_transactions": payroll_list,
        "total_payroll_expenses": str(total_payroll),
        "employee_count": len(set(p["employee_id"] for p in payroll_list)),
        "payment_count": len(payroll_list)
    }


async def get_branching_expenses_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get branching expenses - payments for creating sub-branches.
    OrderType.add_on payments.
    """
    branching_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type == OrderType.add_on,
            PaymentOrder.created_at >= datetime.combine(period_start, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(period_end, datetime.max.time()),
            PaymentOrder.status.in_([PaymentOrderStatus.paid, PaymentOrderStatus.processing])
        )
    )
    branching_result = await db.execute(branching_query)
    branching_payments = branching_result.scalars().all()
    
    branch_ids = {bp.reference_id for bp in branching_payments if bp.reference_id}
    branch_map = {}
    if branch_ids:
        branches_query = select(Center).where(Center.id.in_(branch_ids))
        branches_result = await db.execute(branches_query)
        branches = branches_result.scalars().all()
        branch_map = {b.id: b for b in branches}
    
    branching_list = []
    total_branching = Decimal("0.00")
    
    for payment in branching_payments:
        branch = branch_map.get(payment.reference_id) if payment.reference_id else None
        
        branching_list.append({
            "payment_order_id": str(payment.payment_order_id),
            "branch_name": branch.center_name if branch else "Branch Creation",
            "amount": str(payment.total_amount),
            "payment_date": payment.created_at.date().isoformat() if payment.created_at else None,
        })
        
        total_branching += Decimal(str(payment.total_amount))
    
    return {
        "branching_expenses": branching_list,
        "total_branching_expenses": str(total_branching),
        "branch_count": len(branching_list)
    }


async def get_membership_income_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get membership income - new memberships and renewals.
    OrderType.membership and OrderType.renewal payments.
    """
    membership_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal]),
            PaymentOrder.created_at >= datetime.combine(period_start, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(period_end, datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    membership_result = await db.execute(membership_query)
    membership_payments = membership_result.scalars().all()
    
    # Fetch member details
    member_membership_ids = {mp.reference_id for mp in membership_payments if mp.reference_id}
    member_map = {}
    if member_membership_ids:
        mm_query = select(MemberMembership).where(MemberMembership.id.in_(member_membership_ids))
        mm_result = await db.execute(mm_query)
        member_memberships = mm_result.scalars().all()
        
        user_ids = {mm.member_id for mm in member_memberships}
        if user_ids:
            users_query = select(User).where(User.id.in_(user_ids))
            users_result = await db.execute(users_query)
            users = users_result.scalars().all()
            user_map = {u.id: u for u in users}
            
            members_query = select(Member).where(Member.id.in_(user_ids))
            members_result = await db.execute(members_query)
            members = members_result.scalars().all()
            member_map = {m.id: (m, user_map.get(m.id)) for m in members}
    
    membership_list = []
    total_membership = Decimal("0.00")
    
    for payment in membership_payments:
        member_info = member_map.get(payment.payer_user_id)
        member_name = "Unknown"
        if member_info:
            member, user = member_info
            member_name = member.full_name if member.full_name else (user.email if user else "Unknown")
        
        membership_list.append({
            "payment_order_id": str(payment.payment_order_id),
            "member_name": member_name,
            "order_type": payment.order_type.value,
            "amount": str(payment.total_amount),
            "payment_date": payment.created_at.date().isoformat() if payment.created_at else None,
        })
        
        total_membership += Decimal(str(payment.total_amount))
    
    return {
        "membership_sales": membership_list,
        "total_membership_income": str(total_membership),
        "membership_count": len(membership_list)
    }


async def get_inventory_transactions_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get inventory sales and purchases.
    - Sales: OrderType.stock_purchase payments (sales to members)
    - Purchases: Need to track separately (you may need a Purchase model or negative Sale quantities)
    """
    # INVENTORY SALES (to members)
    sales_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type == OrderType.stock_purchase,
            PaymentOrder.created_at >= datetime.combine(period_start, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(period_end, datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    sales_result = await db.execute(sales_query)
    sales_payments = sales_result.scalars().all()
    
    # Fetch sale details
    sale_ids = {sp.reference_id for sp in sales_payments if sp.reference_id}
    sale_map = {}
    if sale_ids:
        sales_detail_query = select(Sale).where(Sale.sale_id.in_(sale_ids))
        sales_detail_result = await db.execute(sales_detail_query)
        sales_details = sales_detail_result.scalars().all()
        sale_map = {s.sale_id: s for s in sales_details}
    
    sales_list = []
    total_sales = Decimal("0.00")
    
    for payment in sales_payments:
        sale = sale_map.get(payment.reference_id)
        
        sales_list.append({
            "payment_order_id": str(payment.payment_order_id),
            "sale_id": str(payment.reference_id) if payment.reference_id else None,
            "invoice_number": sale.invoice_number if sale else "N/A",
            "amount": str(payment.total_amount),
            "sale_date": payment.created_at.date().isoformat() if payment.created_at else None,
        })
        
        total_sales += Decimal(str(payment.total_amount))
    
    # INVENTORY PURCHASES (stock bought by center)
    # Note: You may need to create a Purchase model or track this differently
    # For now, we'll look for Sales with negative quantities or specific transaction types
    # This is a placeholder - adjust based on your actual purchase tracking
    
    purchases_list = []
    total_purchases = Decimal("0.00")
    
    # If you track purchases via Sale table with transaction_type or negative quantities:
    # purchase_query = select(Sale).where(
    #     and_(
    #         Sale.center_id == center_id,
    #         Sale.transaction_type == "purchase",  # if you have this field
    #         Sale.created_at >= datetime.combine(period_start, datetime.min.time()),
    #         Sale.created_at <= datetime.combine(period_end, datetime.max.time())
    #     )
    # )
    # Or track via separate Purchase table/PaymentOrder type
    
    return {
        "inventory_sales": sales_list,
        "total_inventory_sales": str(total_sales),
        "sales_count": len(sales_list),
        "inventory_purchases": purchases_list,
        "total_inventory_purchases": str(total_purchases),
        "purchase_count": len(purchases_list)
    }


# ============================================================================
# API 1: GET SETTLEMENT PERIODS LIST (COMPREHENSIVE)
# ============================================================================

# Add to /app/billing/api/routes.py

from app.auth.models.models import Employee
from app.center.models.models import Center
from app.settings.models.models import CenterOperationalSetting, Designation
from app.inventory.models.models import Sale, SaleItem, Product
from app.membership.models.models import MemberMembership
from calendar import monthrange


# ============================================================================
# HELPER FUNCTIONS FOR SETTLEMENT
# ============================================================================

def get_period_key(date_obj: date, period_type: str) -> str:
    """Generate period key for grouping."""
    if period_type == "weekly":
        year, week, _ = date_obj.isocalendar()
        return f"{year}-W{week:02d}"
    elif period_type == "monthly":
        return f"{date_obj.year}-{date_obj.month:02d}"
    else:
        return date_obj.isoformat()


def parse_period_key(period_key: str, period_type: str) -> tuple:
    """Parse period key back to start/end dates."""
    if period_type == "weekly":
        year, week = period_key.split("-W")
        year = int(year)
        week = int(week)
        
        jan4 = date(year, 1, 4)
        week_one_monday = jan4 - timedelta(days=jan4.weekday())
        period_start = week_one_monday + timedelta(weeks=week - 1)
        period_end = period_start + timedelta(days=6)
        
        return period_start, period_end
    elif period_type == "monthly":
        year, month = period_key.split("-")
        year = int(year)
        month = int(month)
        
        period_start = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        period_end = date(year, month, last_day)
        
        return period_start, period_end
    else:
        d = datetime.strptime(period_key, "%Y-%m-%d").date()
        return d, d


def format_period_label(start: date, end: date) -> str:
    """Format period label for display."""
    if start.month == end.month:
        return f"{start.strftime('%b')} {start.day}–{end.day}"
    else:
        return f"{start.strftime('%b %d')}–{end.strftime('%b %d')}"


async def get_payroll_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Calculate employee payroll expenses for the period.
    Based on center's payroll_cycle_day setting.
    """
    ops_settings_query = select(CenterOperationalSetting).where(
        CenterOperationalSetting.center_id == center_id
    )
    ops_result = await db.execute(ops_settings_query)
    ops_settings = ops_result.scalar_one_or_none()
    
    payroll_cycle_day = ops_settings.payroll_cycle_day if ops_settings else 1
    
    employees_query = select(Employee).where(
        and_(
            Employee.center_id == center_id,
            Employee.status == "active",
            Employee.salary.isnot(None)
        )
    )
    employees_result = await db.execute(employees_query)
    employees = employees_result.scalars().all()
    
    designation_ids = {e.designation_id for e in employees if e.designation_id}
    designation_map = {}
    if designation_ids:
        designations_query = select(Designation).where(Designation.id.in_(designation_ids))
        designations_result = await db.execute(designations_query)
        designations = designations_result.scalars().all()
        designation_map = {d.id: d for d in designations}
    
    payroll_list = []
    total_payroll = Decimal("0.00")
    
    current_date = period_start
    payroll_dates_in_period = []
    
    while current_date <= period_end:
        try:
            payroll_date = date(current_date.year, current_date.month, payroll_cycle_day)
        except ValueError:
            last_day = monthrange(current_date.year, current_date.month)[1]
            payroll_date = date(current_date.year, current_date.month, last_day)
        
        if period_start <= payroll_date <= period_end:
            payroll_dates_in_period.append(payroll_date)
        
        if current_date.month == 12:
            current_date = date(current_date.year + 1, 1, 1)
        else:
            current_date = date(current_date.year, current_date.month + 1, 1)
    
    for payroll_date in payroll_dates_in_period:
        for employee in employees:
            if not employee.salary:
                continue
            
            if employee.joining_date and employee.joining_date > payroll_date:
                continue
            
            designation = designation_map.get(employee.designation_id)
            salary = Decimal(str(employee.salary))
            
            payroll_list.append({
                "employee_id": str(employee.id),
                "employee_name": employee.full_name if employee.full_name else "Unknown",
                "designation": designation.name if designation else "N/A",
                "gross_salary": str(salary),
                "net_salary": str(salary),
                "payroll_date": payroll_date.isoformat(),
            })
            
            total_payroll += salary
    
    return {
        "payroll_transactions": payroll_list,
        "total_payroll_expenses": str(total_payroll),
        "employee_count": len(set(p["employee_id"] for p in payroll_list)),
        "payment_count": len(payroll_list)
    }


async def get_branching_expenses_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get branching expenses - payments for creating sub-branches.
    OrderType.add_on payments.
    """
    branching_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type == OrderType.add_on,
            PaymentOrder.created_at >= datetime.combine(period_start, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(period_end, datetime.max.time()),
            PaymentOrder.status.in_([PaymentOrderStatus.paid, PaymentOrderStatus.processing])
        )
    )
    branching_result = await db.execute(branching_query)
    branching_payments = branching_result.scalars().all()
    
    branch_ids = {bp.reference_id for bp in branching_payments if bp.reference_id}
    branch_map = {}
    if branch_ids:
        branches_query = select(Center).where(Center.id.in_(branch_ids))
        branches_result = await db.execute(branches_query)
        branches = branches_result.scalars().all()
        branch_map = {b.id: b for b in branches}
    
    branching_list = []
    total_branching = Decimal("0.00")
    
    for payment in branching_payments:
        branch = branch_map.get(payment.reference_id) if payment.reference_id else None
        
        branching_list.append({
            "payment_order_id": str(payment.payment_order_id),
            "branch_name": branch.center_name if branch else "Branch Creation",
            "amount": str(payment.total_amount),
            "payment_date": payment.created_at.date().isoformat() if payment.created_at else None,
        })
        
        total_branching += Decimal(str(payment.total_amount))
    
    return {
        "branching_expenses": branching_list,
        "total_branching_expenses": str(total_branching),
        "branch_count": len(branching_list)
    }


async def get_membership_income_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get membership income - new memberships and renewals.
    OrderType.membership and OrderType.renewal payments.
    """
    membership_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal]),
            PaymentOrder.created_at >= datetime.combine(period_start, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(period_end, datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    membership_result = await db.execute(membership_query)
    membership_payments = membership_result.scalars().all()
    
    # Fetch member details
    member_membership_ids = {mp.reference_id for mp in membership_payments if mp.reference_id}
    member_map = {}
    if member_membership_ids:
        mm_query = select(MemberMembership).where(MemberMembership.id.in_(member_membership_ids))
        mm_result = await db.execute(mm_query)
        member_memberships = mm_result.scalars().all()
        
        user_ids = {mm.member_id for mm in member_memberships}
        if user_ids:
            users_query = select(User).where(User.id.in_(user_ids))
            users_result = await db.execute(users_query)
            users = users_result.scalars().all()
            user_map = {u.id: u for u in users}
            
            members_query = select(Member).where(Member.id.in_(user_ids))
            members_result = await db.execute(members_query)
            members = members_result.scalars().all()
            member_map = {m.id: (m, user_map.get(m.id)) for m in members}
    
    membership_list = []
    total_membership = Decimal("0.00")
    
    for payment in membership_payments:
        member_info = member_map.get(payment.payer_user_id)
        member_name = "Unknown"
        if member_info:
            member, user = member_info
            member_name = member.full_name if member.full_name else (user.email if user else "Unknown")
        
        membership_list.append({
            "payment_order_id": str(payment.payment_order_id),
            "member_name": member_name,
            "order_type": payment.order_type.value,
            "amount": str(payment.total_amount),
            "payment_date": payment.created_at.date().isoformat() if payment.created_at else None,
        })
        
        total_membership += Decimal(str(payment.total_amount))
    
    return {
        "membership_sales": membership_list,
        "total_membership_income": str(total_membership),
        "membership_count": len(membership_list)
    }


async def get_inventory_transactions_for_period(center_id: UUID, period_start: date, period_end: date, db: AsyncSession):
    """
    Get inventory sales and purchases.
    - Sales: OrderType.stock_purchase payments (sales to members)
    - Purchases: Need to track separately (you may need a Purchase model or negative Sale quantities)
    """
    # INVENTORY SALES (to members)
    sales_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type == OrderType.stock_purchase,
            PaymentOrder.created_at >= datetime.combine(period_start, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(period_end, datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    sales_result = await db.execute(sales_query)
    sales_payments = sales_result.scalars().all()
    
    # Fetch sale details
    sale_ids = {sp.reference_id for sp in sales_payments if sp.reference_id}
    sale_map = {}
    if sale_ids:
        sales_detail_query = select(Sale).where(Sale.id.in_(sale_ids))
        sales_detail_result = await db.execute(sales_detail_query)
        sales_details = sales_detail_result.scalars().all()
        sale_map = {s.id: s for s in sales_details}
    
    sales_list = []
    total_sales = Decimal("0.00")
    
    for payment in sales_payments:
        sale = sale_map.get(payment.reference_id)
        
        sales_list.append({
            "payment_order_id": str(payment.payment_order_id),
            "sale_id": str(payment.reference_id) if payment.reference_id else None,
            "invoice_number": sale.invoice_number if sale else "N/A",
            "amount": str(payment.total_amount),
            "sale_date": payment.created_at.date().isoformat() if payment.created_at else None,
        })
        
        total_sales += Decimal(str(payment.total_amount))
    
    # INVENTORY PURCHASES (stock bought by center)
    # Note: You may need to create a Purchase model or track this differently
    # For now, we'll look for Sales with negative quantities or specific transaction types
    # This is a placeholder - adjust based on your actual purchase tracking
    
    purchases_list = []
    total_purchases = Decimal("0.00")
    
    # If you track purchases via Sale table with transaction_type or negative quantities:
    # purchase_query = select(Sale).where(
    #     and_(
    #         Sale.center_id == center_id,
    #         Sale.transaction_type == "purchase",  # if you have this field
    #         Sale.created_at >= datetime.combine(period_start, datetime.min.time()),
    #         Sale.created_at <= datetime.combine(period_end, datetime.max.time())
    #     )
    # )
    # Or track via separate Purchase table/PaymentOrder type
    
    return {
        "inventory_sales": sales_list,
        "total_inventory_sales": str(total_sales),
        "sales_count": len(sales_list),
        "inventory_purchases": purchases_list,
        "total_inventory_purchases": str(total_purchases),
        "purchase_count": len(purchases_list)
    }


# ============================================================================
# API 1: GET SETTLEMENT PERIODS LIST (COMPREHENSIVE)
# ============================================================================

@router.get("/billing/settlements", summary="Get comprehensive settlement periods")
async def get_settlements_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status_filter: Optional[str] = Query(None, description="Filter by: pending, processing, completed"),
    period_type: str = Query("monthly", description="Period grouping: weekly, monthly"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Comprehensive settlement periods including:
    
    INCOME:
    - Network visits (incoming)
    - Membership sales (new + renewals)
    - Inventory sales (products sold)
    
    EXPENSES:
    - Network visits (outgoing)
    - Employee payroll
    - Branching expenses
    - Inventory purchases (stock bought)
    
    Net = Total Income - Total Expenses
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format")
    
    if not date_to_parsed:
        date_to_parsed = datetime.now()
    if not date_from_parsed:
        date_from_parsed = date_to_parsed - timedelta(days=90)
    
    # ========== FETCH NETWORK VISITS ==========
    
    incoming_query = select(UserCenterMembership).where(
        and_(
            UserCenterMembership.center_id == center_id,
            UserCenterMembership.start_date >= date_from_parsed.date(),
            UserCenterMembership.start_date <= date_to_parsed.date(),
            UserCenterMembership.network_status.in_([
                NetworkingStatusEnum.approved,
                NetworkingStatusEnum.paid,
                NetworkingStatusEnum.completed,
                NetworkingStatusEnum.pending_settlement
            ])
        )
    )
    incoming_result = await db.execute(incoming_query)
    incoming_visits = incoming_result.scalars().all()
    
    members_query = select(Member.id).where(Member.home_center_id == center_id)
    members_result = await db.execute(members_query)
    member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if member_ids:
        outgoing_query = select(UserCenterMembership).where(
            and_(
                UserCenterMembership.user_id.in_(member_ids),
                UserCenterMembership.center_id != center_id,
                UserCenterMembership.start_date >= date_from_parsed.date(),
                UserCenterMembership.start_date <= date_to_parsed.date(),
                UserCenterMembership.network_status.in_([
                    NetworkingStatusEnum.approved,
                    NetworkingStatusEnum.paid,
                    NetworkingStatusEnum.completed,
                    NetworkingStatusEnum.pending_settlement
                ])
            )
        )
        outgoing_result = await db.execute(outgoing_query)
        outgoing_visits = outgoing_result.scalars().all()
    
    all_visit_ids = [v.id for v in incoming_visits] + [v.id for v in outgoing_visits]
    payment_orders_map = {}
    if all_visit_ids:
        po_query = select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id.in_(all_visit_ids),
                PaymentOrder.order_type == OrderType.networking_access,
                PaymentOrder.status.in_([PaymentOrderStatus.paid, PaymentOrderStatus.processing])
            )
        )
        po_result = await db.execute(po_query)
        payment_orders = po_result.scalars().all()
        payment_orders_map = {po.reference_id: po for po in payment_orders}
    
    # ========== GROUP BY PERIOD ==========
    
    period_groups = {}
    platform_fee_percentage = Decimal("0.15")
    
    # Process incoming visits
    for visit in incoming_visits:
        if visit.start_date:
            period_key = get_period_key(visit.start_date, period_type)
            if period_key not in period_groups:
                period_groups[period_key] = {
                    # INCOME
                    "incoming_visits_total": Decimal("0.00"),
                    "incoming_visits_count": 0,
                    "membership_income_total": Decimal("0.00"),
                    "membership_count": 0,
                    "inventory_sales_total": Decimal("0.00"),
                    "inventory_sales_count": 0,
                    # EXPENSES
                    "outgoing_visits_total": Decimal("0.00"),
                    "outgoing_visits_count": 0,
                    "payroll_total": Decimal("0.00"),
                    "payroll_count": 0,
                    "branching_total": Decimal("0.00"),
                    "branching_count": 0,
                    "inventory_purchases_total": Decimal("0.00"),
                    "inventory_purchases_count": 0,
                    # FEES
                    "platform_fee_total": Decimal("0.00"),
                }
            
            po = payment_orders_map.get(visit.id)
            if po:
                charge = Decimal(str(po.total_amount))
                platform_fee = (charge * platform_fee_percentage).quantize(Decimal("0.01"))
                earned = charge - platform_fee
                
                period_groups[period_key]["incoming_visits_total"] += earned
                period_groups[period_key]["platform_fee_total"] += platform_fee
                period_groups[period_key]["incoming_visits_count"] += 1
    
    # Process outgoing visits
    for visit in outgoing_visits:
        if visit.start_date:
            period_key = get_period_key(visit.start_date, period_type)
            if period_key not in period_groups:
                period_groups[period_key] = {
                    "incoming_visits_total": Decimal("0.00"),
                    "incoming_visits_count": 0,
                    "membership_income_total": Decimal("0.00"),
                    "membership_count": 0,
                    "inventory_sales_total": Decimal("0.00"),
                    "inventory_sales_count": 0,
                    "outgoing_visits_total": Decimal("0.00"),
                    "outgoing_visits_count": 0,
                    "payroll_total": Decimal("0.00"),
                    "payroll_count": 0,
                    "branching_total": Decimal("0.00"),
                    "branching_count": 0,
                    "inventory_purchases_total": Decimal("0.00"),
                    "inventory_purchases_count": 0,
                    "platform_fee_total": Decimal("0.00"),
                }
            
            po = payment_orders_map.get(visit.id)
            if po:
                charge = Decimal(str(po.total_amount))
                period_groups[period_key]["outgoing_visits_total"] += charge
                period_groups[period_key]["outgoing_visits_count"] += 1
    
    # ========== ADD OTHER INCOME/EXPENSES TO EACH PERIOD ==========
    
    for period_key in list(period_groups.keys()):
        period_start, period_end = parse_period_key(period_key, period_type)
        
        # Payroll
        payroll_data = await get_payroll_for_period(UUID(center_id), period_start, period_end, db)
        period_groups[period_key]["payroll_total"] = Decimal(payroll_data["total_payroll_expenses"])
        period_groups[period_key]["payroll_count"] = payroll_data["payment_count"]
        
        # Branching
        branching_data = await get_branching_expenses_for_period(UUID(center_id), period_start, period_end, db)
        period_groups[period_key]["branching_total"] = Decimal(branching_data["total_branching_expenses"])
        period_groups[period_key]["branching_count"] = branching_data["branch_count"]
        
        # Membership income
        membership_data = await get_membership_income_for_period(UUID(center_id), period_start, period_end, db)
        period_groups[period_key]["membership_income_total"] = Decimal(membership_data["total_membership_income"])
        period_groups[period_key]["membership_count"] = membership_data["membership_count"]
        
        # Inventory transactions
        inventory_data = await get_inventory_transactions_for_period(UUID(center_id), period_start, period_end, db)
        period_groups[period_key]["inventory_sales_total"] = Decimal(inventory_data["total_inventory_sales"])
        period_groups[period_key]["inventory_sales_count"] = inventory_data["sales_count"]
        period_groups[period_key]["inventory_purchases_total"] = Decimal(inventory_data["total_inventory_purchases"])
        period_groups[period_key]["inventory_purchases_count"] = inventory_data["purchase_count"]
    
    # ========== BUILD SETTLEMENT LIST ==========
    
    settlements = []
    for period_key, data in period_groups.items():
        # Calculate totals
        total_income = (
            data["incoming_visits_total"] + 
            data["membership_income_total"] + 
            data["inventory_sales_total"]
        )
        
        total_expenses = (
            data["outgoing_visits_total"] + 
            data["payroll_total"] + 
            data["branching_total"] + 
            data["inventory_purchases_total"]
        )
        
        net_amount = total_income - total_expenses
        
        # Determine status based on whether all network visits are completed
        all_visits_in_period = [v for v in incoming_visits if v.start_date and get_period_key(v.start_date, period_type) == period_key]
        all_visits_in_period += [v for v in outgoing_visits if v.start_date and get_period_key(v.start_date, period_type) == period_key]
        
        if all_visits_in_period:
            # Check if all visits are completed
            all_completed = all(
                v.network_status == NetworkingStatusEnum.completed 
                for v in all_visits_in_period
            )
            status = "completed" if all_completed else "processing"
        else:
            # No network visits - check if there are any other transactions
            has_transactions = (
                data["membership_count"] > 0 or 
                data["inventory_sales_count"] > 0 or
                data["payroll_count"] > 0 or
                data["branching_count"] > 0
            )
            status = "processing" if has_transactions else "pending"
        
        period_start, period_end = parse_period_key(period_key, period_type)
        
        settlements.append({
            "period_key": period_key,
            "period_label": format_period_label(period_start, period_end),
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            
            # INCOME
            "incoming_visits_total": str(data["incoming_visits_total"]),
            "incoming_visits_count": data["incoming_visits_count"],
            "membership_income_total": str(data["membership_income_total"]),
            "membership_count": data["membership_count"],
            "inventory_sales_total": str(data["inventory_sales_total"]),
            "inventory_sales_count": data["inventory_sales_count"],
            "total_income": str(total_income),
            
            # EXPENSES
            "outgoing_visits_total": str(data["outgoing_visits_total"]),
            "outgoing_visits_count": data["outgoing_visits_count"],
            "payroll_total": str(data["payroll_total"]),
            "payroll_count": data["payroll_count"],
            "branching_total": str(data["branching_total"]),
            "branching_count": data["branching_count"],
            "inventory_purchases_total": str(data["inventory_purchases_total"]),
            "inventory_purchases_count": data["inventory_purchases_count"],
            "total_expenses": str(total_expenses),
            
            # NET
            "platform_fee_total": str(data["platform_fee_total"]),
            "net_amount": str(net_amount),
            "status": status
        })
    
    if status_filter:
        settlements = [s for s in settlements if s["status"] == status_filter]
    
    settlements.sort(key=lambda x: x["period_start"], reverse=True)
    
    total = len(settlements)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated = settlements[start_idx:end_idx]
    
    summary = {
        "total_income_all_periods": str(sum(Decimal(s["total_income"]) for s in settlements)),
        "total_expenses_all_periods": str(sum(Decimal(s["total_expenses"]) for s in settlements)),
        "net_all_periods": str(sum(Decimal(s["net_amount"]) for s in settlements)),
        "platform_fees_all_periods": str(sum(Decimal(s["platform_fee_total"]) for s in settlements))
    }
    
    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "period_type": period_type,
        "date_from": date_from_parsed.date().isoformat(),
        "date_to": date_to_parsed.date().isoformat(),
        "settlements": paginated,
        "summary": summary
    }


# ============================================================================
# API 2: GET SETTLEMENT PERIOD DETAIL (COMPREHENSIVE)
# ============================================================================

@router.get("/billing/settlements/{period_key}", summary="Get comprehensive settlement detail")
async def get_settlement_detail(
    period_key: str = Path(..., description="Period key (e.g., 2026-02)"),
    period_type: str = Query("monthly", description="Period type: weekly, monthly"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Detailed breakdown of a settlement period with all income and expense line items.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    try:
        period_start, period_end = parse_period_key(period_key, period_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid period_key: {str(e)}")
    
    # Fetch all data for the period
    incoming_query = select(UserCenterMembership).where(
        and_(
            UserCenterMembership.center_id == center_id,
            UserCenterMembership.start_date >= period_start,
            UserCenterMembership.start_date <= period_end,
            UserCenterMembership.network_status.in_([
                NetworkingStatusEnum.approved, NetworkingStatusEnum.paid,
                NetworkingStatusEnum.completed, NetworkingStatusEnum.pending_settlement
            ])
        )
    )
    incoming_result = await db.execute(incoming_query)
    incoming_visits = incoming_result.scalars().all()
    
    members_query = select(Member.id).where(Member.home_center_id == center_id)
    members_result = await db.execute(members_query)
    member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if member_ids:
        outgoing_query = select(UserCenterMembership).where(
            and_(
                UserCenterMembership.user_id.in_(member_ids),
                UserCenterMembership.center_id != center_id,
                UserCenterMembership.start_date >= period_start,
                UserCenterMembership.start_date <= period_end,
                UserCenterMembership.network_status.in_([
                    NetworkingStatusEnum.approved, NetworkingStatusEnum.paid,
                    NetworkingStatusEnum.completed, NetworkingStatusEnum.pending_settlement
                ])
            )
        )
        outgoing_result = await db.execute(outgoing_query)
        outgoing_visits = outgoing_result.scalars().all()
    
    # Fetch payment orders
    all_visit_ids = [v.id for v in incoming_visits + outgoing_visits]
    payment_orders_map = {}
    if all_visit_ids:
        po_query = select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id.in_(all_visit_ids),
                PaymentOrder.order_type == OrderType.networking_access
            )
        )
        po_result = await db.execute(po_query)
        payment_orders = po_result.scalars().all()
        payment_orders_map = {po.reference_id: po for po in payment_orders}
    
    # Batch fetch users/members/centers for visits
    user_ids = {v.user_id for v in incoming_visits + outgoing_visits}
    user_map = {}
    member_map = {}
    if user_ids:
        users_query = select(User).where(User.id.in_(user_ids))
        users_result = await db.execute(users_query)
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
        
        members_query = select(Member).where(Member.id.in_(user_ids))
        members_result = await db.execute(members_query)
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
    
    center_ids = {v.center_id for v in outgoing_visits} | {member_map[v.user_id].home_center_id for v in incoming_visits if v.user_id in member_map and member_map[v.user_id].home_center_id}
    center_map = {}
    if center_ids:
        centers_query = select(Center).where(Center.id.in_(center_ids))
        centers_result = await db.execute(centers_query)
        centers = centers_result.scalars().all()
        center_map = {c.id: c for c in centers}
    
    # Build lists
    platform_fee_percentage = Decimal("0.15")
    
    incoming_list = []
    incoming_total = Decimal("0.00")
    platform_fee_total = Decimal("0.00")
    
    for visit in incoming_visits:
        po = payment_orders_map.get(visit.id)
        charge = Decimal(str(po.total_amount)) if po else Decimal("0.00")
        platform_fee = (charge * platform_fee_percentage).quantize(Decimal("0.01"))
        earned = charge - platform_fee
        
        user = user_map.get(visit.user_id)
        member = member_map.get(visit.user_id)
        member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")
        home_center = center_map.get(member.home_center_id) if member and member.home_center_id else None
        
        incoming_list.append({
            "member_name": member_name,
            "home_center_name": home_center.center_name if home_center else "N/A",
            "visit_date": visit.start_date.isoformat(),
            "charge": str(charge),
            "platform_fee": str(platform_fee),
            "earned": str(earned),
        })
        
        incoming_total += earned
        platform_fee_total += platform_fee
    
    outgoing_list = []
    outgoing_total = Decimal("0.00")
    
    for visit in outgoing_visits:
        po = payment_orders_map.get(visit.id)
        charge = Decimal(str(po.total_amount)) if po else Decimal("0.00")
        
        user = user_map.get(visit.user_id)
        member = member_map.get(visit.user_id)
        member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")
        visited_center = center_map.get(visit.center_id)
        
        outgoing_list.append({
            "member_name": member_name,
            "visited_center_name": visited_center.center_name if visited_center else "Unknown",
            "visit_date": visit.start_date.isoformat(),
            "charge": str(charge),
        })
        
        outgoing_total += charge
    
    # Get other data
    payroll_data = await get_payroll_for_period(UUID(center_id), period_start, period_end, db)
    branching_data = await get_branching_expenses_for_period(UUID(center_id), period_start, period_end, db)
    membership_data = await get_membership_income_for_period(UUID(center_id), period_start, period_end, db)
    inventory_data = await get_inventory_transactions_for_period(UUID(center_id), period_start, period_end, db)
    
    payroll_total = Decimal(payroll_data["total_payroll_expenses"])
    branching_total = Decimal(branching_data["total_branching_expenses"])
    membership_total = Decimal(membership_data["total_membership_income"])
    inventory_sales_total = Decimal(inventory_data["total_inventory_sales"])
    inventory_purchases_total = Decimal(inventory_data["total_inventory_purchases"])
    
    total_income = incoming_total + membership_total + inventory_sales_total
    total_expenses = outgoing_total + payroll_total + branching_total + inventory_purchases_total
    net_amount = total_income - total_expenses
    
    return {
        "period_key": period_key,
        "period_label": format_period_label(period_start, period_end),
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        
        "summary": {
            "total_income": str(total_income),
            "total_expenses": str(total_expenses),
            "net_amount": str(net_amount),
            "platform_fee_total": str(platform_fee_total),
        },
        
        "income_breakdown": {
            "incoming_visits": {"total": str(incoming_total), "count": len(incoming_list), "items": incoming_list},
            "membership_sales": {"total": str(membership_total), "count": len(membership_data["membership_sales"]), "items": membership_data["membership_sales"]},
            "inventory_sales": {"total": str(inventory_sales_total), "count": len(inventory_data["inventory_sales"]), "items": inventory_data["inventory_sales"]},
        },
        
        "expenses_breakdown": {
            "outgoing_visits": {"total": str(outgoing_total), "count": len(outgoing_list), "items": outgoing_list},
            "employee_payroll": {"total": str(payroll_total), "count": len(payroll_data["payroll_transactions"]), "items": payroll_data["payroll_transactions"]},
            "branching_expenses": {"total": str(branching_total), "count": len(branching_data["branching_expenses"]), "items": branching_data["branching_expenses"]},
            "inventory_purchases": {"total": str(inventory_purchases_total), "count": len(inventory_data["inventory_purchases"]), "items": inventory_data["inventory_purchases"]},
        }
    }


# ============================================================================
# API 3: MARK SETTLEMENT AS COMPLETED
# ============================================================================

@router.post("/billing/settlements/{period_key}/mark-completed")
async def mark_settlement_completed(
    period_key: str = Path(...),
    period_type: str = Query("monthly"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """Mark settlement period as completed."""
    from sqlalchemy import update
    
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    try:
        period_start, period_end = parse_period_key(period_key, period_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid period_key: {str(e)}")
    
    # Update network visits to completed
    await db.execute(
        update(UserCenterMembership)
        .where(
            and_(
                UserCenterMembership.center_id == center_id,
                UserCenterMembership.start_date >= period_start,
                UserCenterMembership.start_date <= period_end,
                UserCenterMembership.network_status.in_([NetworkingStatusEnum.pending_settlement, NetworkingStatusEnum.paid])
            )
        )
        .values(network_status=NetworkingStatusEnum.completed)
    )
    
    await db.commit()
    
    return {
        "success": True,
        "message": f"Settlement for {period_key} marked as completed",
        "period_key": period_key
    }




#---------add charges ---------------------------------------------


@router.post("/billing/miscellaneous-transactions", status_code=201, summary="Create miscellaneous transaction")
async def create_miscellaneous_transaction(
    payload: MiscellaneousTransactionCreate,
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Create a new miscellaneous transaction (income/expense).
    Examples: rent, electricity, maintenance, office supplies, etc.
    """
    from app.center.models.models import Center

    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found in session.")

    # Validate center exists
    center_result = await db.execute(
        select(Center).where(Center.id == center_id)
    )
    center = center_result.scalar_one_or_none()
    if not center:
        raise HTTPException(status_code=404, detail="Center not found.")

    # Set defaults
    tax_amount = Decimal("0.00")
    total_amount = Decimal(str(payload.amount))
    transaction_date = date.today()

    # Create PaymentOrder (always create for tracking)
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        payer_user_id=current_admin.get("user_id"),
        payer_type=PayerType.center_admin,
        payee_type=PayerType.platform if payload.transaction_type == "expense" else PayerType.center,
        center_id=center_id,
        order_type=OrderType.add_on,
        reference_schema=ReferenceSchema.invoice,
        subtotal_amount=payload.amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        currency=Currency.INR,
        status=PaymentOrderStatus.paid,
        payment_method=PaymentMethod[payload.payment_method],
        created_by=current_admin.get("user_id"),
        updated_by=current_admin.get("user_id"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(payment_order)
    await db.flush()  # Get payment_order_id

    # Create MiscellaneousTransaction
    misc_transaction = MiscellaneousTransaction(
        id=uuid4(),
        center_id=center_id,
        transaction_type=payload.transaction_type,
        category=payload.category,
        title=payload.title,
        description=getattr(payload, "description", None),
        amount=payload.amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        tax_category_id=None,
        payment_order_id=payment_order.payment_order_id,
        payment_method=payload.payment_method,
        payment_status=PaymentOrderStatus.paid,
        transaction_date=transaction_date,
        party_name=getattr(payload, "party_name", None),
        party_contact=getattr(payload, "party_contact", None),
        invoice_number=getattr(payload, "invoice_number", None),
        receipt_number=getattr(payload, "receipt_number", None),
        attachment_urls=getattr(payload, "attachment_urls", None),
        notes=getattr(payload, "notes", None),
        created_by=current_admin.get("user_id"),
        updated_by=current_admin.get("user_id"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(misc_transaction)
    await db.commit()
    await db.refresh(misc_transaction)

    # --- ACCOUNTING INTEGRATION ---
    await post_miscellaneous_transaction_journal(
        session=db,
        misc_txn=misc_transaction,
        created_by=current_admin.get("user_id")
    )

    # Prepare response
    response = {
        "id": str(misc_transaction.id),
        "center_id": str(misc_transaction.center_id),
        "transaction_type": misc_transaction.transaction_type,
        "category": misc_transaction.category,
        "title": misc_transaction.title,
        "amount": str(misc_transaction.amount),
        "tax_amount": str(misc_transaction.tax_amount),
        "total_amount": str(misc_transaction.total_amount),
        "payment_order_id": str(misc_transaction.payment_order_id),
        "payment_method": misc_transaction.payment_method,
        "payment_status": "paid",
        "transaction_date": misc_transaction.transaction_date.isoformat(),
        "created_at": misc_transaction.created_at.isoformat() if misc_transaction.created_at else None,
        "created_by": str(misc_transaction.created_by) if misc_transaction.created_by else None
    }
    return response








# @router.post("/billing/miscellaneous-transactions", status_code=201, summary="Create miscellaneous transaction")
# async def create_miscellaneous_transaction(
#     payload: MiscellaneousTransactionCreate,
#     db: AsyncSession = Depends(get_async_session),
#     current_admin: dict = Depends(centeradmin_required)
# ):
#     """
#     Create a new miscellaneous transaction (income/expense).
#     Examples: rent, electricity, maintenance, office supplies, etc.
    
#     Required fields only:
#     - transaction_type: "income" or "expense"
#     - category: Category name (e.g., "Office Rent")
#     - title: Transaction title
#     - amount: Transaction amount
#     - payment_method: cash, bank_transfer, upi, card, other
#     """
#     from app.center.models.models import Center
    
#     center_id = current_admin.get("center_id")
#     if not center_id:
#         raise HTTPException(status_code=403, detail="Center admin required")
    
#     # Validate center exists
#     center_result = await db.execute(
#         select(Center).where(Center.id == center_id)
#     )
#     center = center_result.scalar_one_or_none()
#     if not center:
#         raise HTTPException(status_code=404, detail="Center not found")
    
#     # Set defaults
#     tax_amount = Decimal("0.00")
#     total_amount = Decimal(str(payload.amount))
#     transaction_date = date.today()
    
#     # Create PaymentOrder (always create for tracking)
#     payment_order = PaymentOrder(
#         payment_order_id=uuid4(),
#         payer_user_id=current_admin.get("user_id"),
#         payer_type="center_admin",
#         payee_type="platform" if payload.transaction_type == "expense" else "center",
#         center_id=center_id,
#         order_type=OrderType.add_on,
#         reference_schema=ReferenceSchema.invoice,
#         subtotal_amount=payload.amount,
#         tax_amount=tax_amount,
#         total_amount=total_amount,
#         currency=Currency.INR,
#         status=PaymentOrderStatus.paid,  # Always mark as paid
#         payment_method=PaymentMethod[payload.payment_method],  # Convert string to enum
#         created_by=current_admin.get("user_id"),
#         updated_by=current_admin.get("user_id")
#     )
#     db.add(payment_order)
#     await db.flush()  # Get payment_order_id
    
#     # Create MiscellaneousTransaction
#     misc_transaction = MiscellaneousTransaction(
#         id=uuid4(),
#         center_id=center_id,
#         transaction_type=payload.transaction_type,
#         category=payload.category,
#         title=payload.title,
#         description=None,
#         amount=payload.amount,
#         tax_amount=tax_amount,
#         total_amount=total_amount,
#         tax_category_id=None,
#         payment_order_id=payment_order.payment_order_id,
#         payment_method=payload.payment_method,  # Store as string directly
#         payment_status=PaymentOrderStatus.paid,
#         transaction_date=transaction_date,
#         party_name=None,
#         party_contact=None,
#         invoice_number=None,
#         receipt_number=None,
#         attachment_urls=None,
#         notes=None,
#         created_by=current_admin.get("user_id"),
#         updated_by=current_admin.get("user_id")
#     )
    
#     db.add(misc_transaction)
#     await db.commit()
#     await db.refresh(misc_transaction)
    
#     # Prepare response
#     response = {
#         "id": str(misc_transaction.id),
#         "center_id": str(misc_transaction.center_id),
#         "transaction_type": misc_transaction.transaction_type,
#         "category": misc_transaction.category,
#         "title": misc_transaction.title,
#         "amount": str(misc_transaction.amount),
#         "tax_amount": str(misc_transaction.tax_amount),
#         "total_amount": str(misc_transaction.total_amount),
#         "payment_order_id": str(misc_transaction.payment_order_id),
#         "payment_method": misc_transaction.payment_method,  # Already a string, no .value needed
#         "payment_status": "paid",
#         "transaction_date": misc_transaction.transaction_date.isoformat(),
#         "created_at": misc_transaction.created_at.isoformat() if misc_transaction.created_at else None,
#         "created_by": str(misc_transaction.created_by) if misc_transaction.created_by else None
#     }
    
#     return {
#         "message": "Miscellaneous transaction created successfully",
#         "data": response
#     }




#-----------REPORTS API ENDPOINTS-----------

#-----------BILLING SALES REPORTS API ENDPOINTS-----------

def parse_date_param(date_str: Optional[str]) -> Optional[date]:
    """Convert string date or 'null' to date object or None"""
    if date_str is None or date_str.lower() == 'null':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {date_str}. Use YYYY-MM-DD or null")


@router.get("/billing/reports/sales", summary="Get Sales Report Data for UI Table")
async def get_billing_sales_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    order_type: Optional[str] = Query(None, description="Filter by order type: membership, renewal, stock_purchase, networking_access, etc."),
    payment_status: Optional[str] = Query(None, description="Filter by status: paid, unpaid, pending"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method: cash, upi, card, bank_transfer"),
    sort_by: str = Query("created_at", description="Sort by: created_at, total_amount, order_type"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get billing sales report data in JSON format for UI table display.
    Supports pagination, filtering, and sorting.
    """
    from app.auth.models.models import CenterAdmin, Member, User
    
    # Get center_id from current_admin (injected by centeradmin_required)
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    # Build base query
    query = select(PaymentOrder).where(PaymentOrder.center_id == center_id)
    
    # Apply date filters
    if start_date_parsed:
        query = query.where(func.date(PaymentOrder.created_at) >= start_date_parsed)
    if end_date_parsed:
        query = query.where(func.date(PaymentOrder.created_at) <= end_date_parsed)
    
    # Apply filters
    if order_type:
        try:
            query = query.where(PaymentOrder.order_type == OrderType(order_type))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid order_type: {order_type}")
    
    if payment_status:
        try:
            query = query.where(PaymentOrder.status == PaymentOrderStatus(payment_status))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid payment_status: {payment_status}")
    
    if payment_method:
        try:
            query = query.where(PaymentOrder.payment_method == PaymentMethod(payment_method))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid payment_method: {payment_method}")
    
    # Count total records
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_records = total_result.scalar()
    
    # Apply sorting
    if sort_by == "created_at":
        order_col = PaymentOrder.created_at
    elif sort_by == "total_amount":
        order_col = PaymentOrder.total_amount
    elif sort_by == "order_type":
        order_col = PaymentOrder.order_type
    else:
        order_col = PaymentOrder.created_at
    
    if sort_order == "desc":
        query = query.order_by(desc(order_col))
    else:
        query = query.order_by(order_col)
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    payment_orders = result.scalars().all()
    
    # Fetch customer names - collect payer_user_ids
    payer_user_ids = set()
    for po in payment_orders:
        if po.payer_user_id:
            payer_user_ids.add(po.payer_user_id)
    
    # Fetch users and members
    user_map = {}
    member_map = {}
    
    if payer_user_ids:
        # Fetch all users
        users_query = select(User).where(User.id.in_(payer_user_ids))
        users_result = await db.execute(users_query)
        users = users_result.scalars().all()
        user_map = {str(u.id): u for u in users}
        
        # Fetch members (Member.id is the same as User.id for member users)
        members_query = select(Member).where(Member.id.in_(payer_user_ids))
        members_result = await db.execute(members_query)
        members = members_result.scalars().all()
        member_map = {str(m.id): m for m in members}
    
    # Build response
    sales_data = []
    total_revenue = Decimal("0.00")
    total_tax = Decimal("0.00")
    total_subtotal = Decimal("0.00")
    
    for po in payment_orders:
        customer_name = "N/A"
        
        # Get customer name based on payer_user_id
        if po.payer_user_id:
            user = user_map.get(str(po.payer_user_id))
            member = member_map.get(str(po.payer_user_id))
            
            if member and hasattr(member, 'full_name') and member.full_name:
                customer_name = member.full_name
            elif user:
                # Try to construct name from user
                if user.username:
                    customer_name = user.username
                elif user.email:
                    customer_name = user.email.split('@')[0]
                elif user.mobile:
                    customer_name = user.mobile
        
        sales_data.append({
            "payment_order_id": str(po.payment_order_id),
            "created_at": po.created_at.isoformat() if po.created_at else None,
            "order_type": po.order_type.value if hasattr(po.order_type, 'value') else str(po.order_type),
            "customer_name": customer_name,
            "payment_method": po.payment_method.value if hasattr(po.payment_method, 'value') else str(po.payment_method) if po.payment_method else "N/A",
            "subtotal_amount": float(po.subtotal_amount or 0),
            "tax_amount": float(po.tax_amount or 0),
            "total_amount": float(po.total_amount or 0),
            "status": po.status.value if hasattr(po.status, 'value') else str(po.status),
            "reference_id": str(po.reference_id) if po.reference_id else None,
            "currency": po.currency.value if hasattr(po.currency, 'value') else str(po.currency) if po.currency else "INR"
        })
        
        if po.status == PaymentOrderStatus.paid:
            total_revenue += po.total_amount or Decimal("0.00")
            total_tax += po.tax_amount or Decimal("0.00")
            total_subtotal += po.subtotal_amount or Decimal("0.00")
    
    # Calculate pagination info
    total_pages = (total_records + page_size - 1) // page_size
    
    return {
        "report_type": "billing_sales",
        "report_period": {
            "start_date": str(start_date_parsed) if start_date_parsed else "all_time",
            "end_date": str(end_date_parsed) if end_date_parsed else "all_time"
        },
        "summary": {
            "total_transactions": total_records,
            "paid_transactions": len([s for s in sales_data if s['status'] == 'paid']),
            "total_subtotal": float(total_subtotal),
            "total_tax": float(total_tax),
            "total_revenue": float(total_revenue)
        },
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": total_pages
        },
        "data": sales_data,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.post("/billing/reports/generate/sales", summary="Generate and Download Sales Report")
async def generate_billing_sales_report(
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    format: str = Query("pdf", description="Output format: json, pdf, csv"),
    order_type: Optional[str] = Query(None, description="Filter by order type"),
    payment_status: Optional[str] = Query(None, description="Filter by status: paid, unpaid, pending"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Generate and download billing sales report in PDF or CSV format.
    Returns file download response.
    """
    from app.auth.models.models import CenterAdmin, Member, User
    import io
    
    # Get center_id from current_admin
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Get center details
    center_query = select(Center).where(Center.id == center_id)
    center_result = await db.execute(center_query)
    center = center_result.scalar_one_or_none()
    center_name = center.center_name if center else "Center"
    
    # Parse dates
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    # Build query (same as above but without pagination)
    query = select(PaymentOrder).where(PaymentOrder.center_id == center_id)
    
    if start_date_parsed:
        query = query.where(func.date(PaymentOrder.created_at) >= start_date_parsed)
    if end_date_parsed:
        query = query.where(func.date(PaymentOrder.created_at) <= end_date_parsed)
    
    if order_type:
        try:
            query = query.where(PaymentOrder.order_type == OrderType(order_type))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid order_type: {order_type}")
    
    if payment_status:
        try:
            query = query.where(PaymentOrder.status == PaymentOrderStatus(payment_status))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid payment_status: {payment_status}")
    
    if payment_method:
        try:
            query = query.where(PaymentOrder.payment_method == PaymentMethod(payment_method))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid payment_method: {payment_method}")
    
    query = query.order_by(desc(PaymentOrder.created_at))
    
    # Execute query
    result = await db.execute(query)
    payment_orders = result.scalars().all()
    
    # Fetch customer names
    payer_user_ids = set()
    for po in payment_orders:
        if po.payer_user_id:
            payer_user_ids.add(po.payer_user_id)
    
    user_map = {}
    member_map = {}
    
    if payer_user_ids:
        users_query = select(User).where(User.id.in_(payer_user_ids))
        users_result = await db.execute(users_query)
        users = users_result.scalars().all()
        user_map = {str(u.id): u for u in users}
        
        members_query = select(Member).where(Member.id.in_(payer_user_ids))
        members_result = await db.execute(members_query)
        members = members_result.scalars().all()
        member_map = {str(m.id): m for m in members}
    
    # Build sales data
    sales_data = []
    for po in payment_orders:
        customer_name = "N/A"
        
        if po.payer_user_id:
            user = user_map.get(str(po.payer_user_id))
            member = member_map.get(str(po.payer_user_id))
            
            if member and hasattr(member, 'full_name') and member.full_name:
                customer_name = member.full_name
            elif user:
                if user.username:
                    customer_name = user.username
                elif user.email:
                    customer_name = user.email.split('@')[0]
                elif user.mobile:
                    customer_name = user.mobile
        
        sales_data.append({
            "payment_order_id": str(po.payment_order_id),
            "created_at": po.created_at.isoformat() if po.created_at else None,
            "order_type": po.order_type.value if hasattr(po.order_type, 'value') else str(po.order_type),
            "customer_name": customer_name,
            "payment_method": po.payment_method.value if hasattr(po.payment_method, 'value') else str(po.payment_method) if po.payment_method else "N/A",
            "subtotal_amount": float(po.subtotal_amount or 0),
            "tax_amount": float(po.tax_amount or 0),
            "total_amount": float(po.total_amount or 0),
            "status": po.status.value if hasattr(po.status, 'value') else str(po.status),
            "reference_id": str(po.reference_id) if po.reference_id else None,
            "currency": po.currency.value if hasattr(po.currency, 'value') else str(po.currency) if po.currency else "INR"
        })
    
    # Format dates for display
    date_from_str = str(start_date_parsed) if start_date_parsed else "all_time"
    date_to_str = str(end_date_parsed) if end_date_parsed else "all_time"
    
    # Generate report based on format
    if format == "pdf":
        pdf_content = BillingReportGenerator.generate_sales_pdf(
            sales_data=sales_data,
            center_name=center_name,
            date_from=date_from_str,
            date_to=date_to_str
        )
        
        filename = f"billing_sales_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif format == "csv":
        csv_content = BillingReportGenerator.generate_sales_csv(sales_data=sales_data)
        
        filename = f"billing_sales_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            io.BytesIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif format == "json":
        return {
            "report_type": "billing_sales",
            "report_period": {
                "start_date": date_from_str,
                "end_date": date_to_str
            },
            "center_name": center_name,
            "data": sales_data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use: json, pdf, or csv")



#-----------BILLING MEMBERSHIP REPORTS API ENDPOINTS-----------

#-----------BILLING MEMBERSHIP REPORTS API ENDPOINTS-----------

@router.get("/billing/reports/memberships", summary="Get Membership Report Data for UI Table")
async def get_billing_membership_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    membership_status: Optional[str] = Query(None, description="Filter by status: active, expired, cancelled"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status: paid, unpaid, pending"),
    membership_type: Optional[str] = Query(None, description="Filter by membership type/plan name"),
    sort_by: str = Query("start_date", description="Sort by: start_date, end_date, total_amount, member_name"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get membership report data for UI table with pagination and filters.
    Shows: Member | Plan | Start Date | End Date | Amount | Status | Payment Status
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found")
    
    # Parse dates
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    # Build query
    where_clauses = [MemberMembership.center_id == center_id]
    
    if start_date_parsed:
        where_clauses.append(MemberMembership.start_date >= start_date_parsed)
    
    if end_date_parsed:
        where_clauses.append(MemberMembership.end_date <= end_date_parsed)
    
    if membership_status:
        try:
            from app.membership.models.models import MembershipStatusEnum
            status_enum = MembershipStatusEnum[membership_status.lower()]
            where_clauses.append(MemberMembership.membership_status == status_enum)
        except KeyError:
            pass
    
    # Base query
    query = select(MemberMembership).where(*where_clauses)
    result = await db.execute(query)
    member_memberships = result.scalars().all()
    
    # Collect IDs for batch fetching
    member_ids = {mm.member_id for mm in member_memberships}
    membership_ids = {mm.membership_id for mm in member_memberships}
    mm_ids = {mm.id for mm in member_memberships}
    
    # Batch fetch members
    member_map = {}
    user_map = {}
    if member_ids:
        members_result = await db.execute(select(Member).where(Member.id.in_(member_ids)))
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
        
        users_result = await db.execute(select(User).where(User.id.in_(member_ids)))
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
    
    # Batch fetch memberships
    membership_map = {}
    if membership_ids:
        memberships_result = await db.execute(select(Membership).where(Membership.membership_id.in_(membership_ids)))
        memberships = memberships_result.scalars().all()
        membership_map = {m.membership_id: m for m in memberships}
    
    # Batch fetch payment orders
    payment_map = {}
    if mm_ids:
        payments_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(mm_ids),
                    PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal])
                )
            )
        )
        payments = payments_result.scalars().all()
        for payment in payments:
            if payment.reference_id not in payment_map:
                payment_map[payment.reference_id] = []
            payment_map[payment.reference_id].append(payment)
    
    # Build response
    memberships_list = []
    today = date.today()
    
    for mm in member_memberships:
        member = member_map.get(mm.member_id)
        user = user_map.get(mm.member_id)
        membership = membership_map.get(mm.membership_id)
        payments = payment_map.get(mm.id, [])
        
        member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")
        member_mobile = user.mobile if user else None
        
        plan_name = membership.membership_name if membership else "N/A"
        plan_duration = f"{membership.duration_count} {membership.duration_unit.value}" if membership else "N/A"
        
        # Calculate payment status
        total_paid = sum(Decimal(str(p.total_amount)) for p in payments if p.status == PaymentOrderStatus.paid)
        total_expected = Decimal(str(mm.total_amount))
        payment_status_calc = "paid" if total_paid >= total_expected else ("partial" if total_paid > 0 else "unpaid")
        
        # Calculate membership status
        if mm.end_date and mm.end_date.date() < today:
            status_label = "expired"
        elif mm.membership_status:
            status_label = mm.membership_status.value
        else:
            status_label = "active"
        
        memberships_list.append({
            "member_membership_id": str(mm.id),
            "member_id": str(mm.member_id),
            "member_name": member_name,
            "member_mobile": member_mobile,
            "plan_name": plan_name,
            "plan_duration": plan_duration,
            "start_date": mm.start_date.date().isoformat() if mm.start_date else None,
            "end_date": mm.end_date.date().isoformat() if mm.end_date else None,
            "total_amount": str(mm.total_amount),
            "paid_amount": str(total_paid),
            "payment_status": payment_status_calc,
            "membership_status": status_label,
            "auto_renewal": mm.auto_renewal_enabled,
        })
    
    # Apply additional filters
    if payment_status:
        memberships_list = [m for m in memberships_list if m["payment_status"] == payment_status]
    
    if membership_type:
        memberships_list = [m for m in memberships_list if membership_type.lower() in m["plan_name"].lower()]
    
    # Sort
    reverse = (sort_order == "desc")
    if sort_by == "member_name":
        memberships_list.sort(key=lambda x: x["member_name"], reverse=reverse)
    elif sort_by == "total_amount":
        memberships_list.sort(key=lambda x: Decimal(x["total_amount"]), reverse=reverse)
    elif sort_by == "end_date":
        memberships_list.sort(key=lambda x: x["end_date"] or "", reverse=reverse)
    else:  # start_date
        memberships_list.sort(key=lambda x: x["start_date"] or "", reverse=reverse)
    
    # Calculate summary
    total_memberships = len(memberships_list)
    total_revenue = sum(Decimal(m["total_amount"]) for m in memberships_list)
    total_paid = sum(Decimal(m["paid_amount"]) for m in memberships_list)
    active_count = sum(1 for m in memberships_list if m["membership_status"] == "active")
    expired_count = sum(1 for m in memberships_list if m["membership_status"] == "expired")
    
    # Pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated = memberships_list[start_idx:end_idx]
    
    return {
        "page": page,
        "page_size": page_size,
        "total": total_memberships,
        "start_date": start_date_parsed.isoformat() if start_date_parsed else None,
        "end_date": end_date_parsed.isoformat() if end_date_parsed else None,
        "summary": {
            "total_memberships": total_memberships,
            "total_revenue": str(total_revenue),
            "total_paid": str(total_paid),
            "active_memberships": active_count,
            "expired_memberships": expired_count,
        },
        "memberships": paginated,
    }


@router.post("/billing/reports/generate/memberships", summary="Generate and Download Membership Report")
async def generate_billing_membership_report(
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    format: str = Query("pdf", description="Output format: pdf, csv"),
    membership_status: Optional[str] = Query(None, description="Filter by status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Generate and download membership report in PDF or CSV format.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found")
    
    # Get center details
    center_result = await db.execute(select(Center).where(Center.id == center_id))
    center = center_result.scalar_one_or_none()
    
    # Extract center details immediately
    center_name = center.center_name if center else "Center"
    center_address = ""  # Center model uses address relationship, not direct field
    
    # Fetch data (reuse logic from above)
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    where_clauses = [MemberMembership.center_id == center_id]
    
    if start_date_parsed:
        where_clauses.append(MemberMembership.start_date >= start_date_parsed)
    if end_date_parsed:
        where_clauses.append(MemberMembership.end_date <= end_date_parsed)
    if membership_status:
        try:
            from app.membership.models.models import MembershipStatusEnum
            status_enum = MembershipStatusEnum[membership_status.lower()]
            where_clauses.append(MemberMembership.membership_status == status_enum)
        except KeyError:
            pass
    
    query = select(MemberMembership).where(*where_clauses)
    result = await db.execute(query)
    member_memberships = result.scalars().all()
    
    # Batch fetch related data
    member_ids = {mm.member_id for mm in member_memberships}
    membership_ids = {mm.membership_id for mm in member_memberships}
    mm_ids = {mm.id for mm in member_memberships}
    
    member_map = {}
    user_map = {}
    if member_ids:
        members_result = await db.execute(select(Member).where(Member.id.in_(member_ids)))
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
        
        users_result = await db.execute(select(User).where(User.id.in_(member_ids)))
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
    
    membership_map = {}
    if membership_ids:
        memberships_result = await db.execute(select(Membership).where(Membership.membership_id.in_(membership_ids)))
        memberships = memberships_result.scalars().all()
        membership_map = {m.membership_id: m for m in memberships}
    
    payment_map = {}
    if mm_ids:
        payments_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(mm_ids),
                    PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal])
                )
            )
        )
        payments = payments_result.scalars().all()
        for payment in payments:
            if payment.reference_id not in payment_map:
                payment_map[payment.reference_id] = []
            payment_map[payment.reference_id].append(payment)
    
    # Build report data
    report_data = []
    today = date.today()
    
    for mm in member_memberships:
        member = member_map.get(mm.member_id)
        user = user_map.get(mm.member_id)
        membership = membership_map.get(mm.membership_id)
        payments = payment_map.get(mm.id, [])
        
        member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")
        member_mobile = user.mobile if user else "N/A"
        
        plan_name = membership.membership_name if membership else "N/A"
        
        total_paid = sum(Decimal(str(p.total_amount)) for p in payments if p.status == PaymentOrderStatus.paid)
        total_expected = Decimal(str(mm.total_amount))
        payment_status_value = "Paid" if total_paid >= total_expected else ("Partial" if total_paid > 0 else "Unpaid")
        
        if mm.end_date and mm.end_date.date() < today:
            status_label = "Expired"
        elif mm.membership_status:
            status_label = mm.membership_status.value.title()
        else:
            status_label = "Active"
        
        report_data.append({
            "Member Name": member_name,
            "Mobile": member_mobile,
            "Plan Name": plan_name,
            "Start Date": mm.start_date.date().isoformat() if mm.start_date else "N/A",
            "End Date": mm.end_date.date().isoformat() if mm.end_date else "N/A",
            "Amount": str(mm.total_amount),
            "Paid": str(total_paid),
            "Payment Status": payment_status_value,
            "Status": status_label,
        })
    
    # Apply payment status filter if provided
    if payment_status:
        report_data = [r for r in report_data if r["Payment Status"].lower() == payment_status.lower()]
    
    # Generate report
    report_generator = BillingReportGenerator(
        center_name=center_name,
        center_address=center_address,
        report_type="Membership Report",
        start_date=start_date_parsed,
        end_date=end_date_parsed
    )
    
    if format.lower() == "csv":
        csv_content = report_generator.generate_csv(report_data)
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=membership_report_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    else:  # PDF
        pdf_content = report_generator.generate_pdf(report_data)
        return StreamingResponse(
            iter([pdf_content]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=membership_report_{datetime.now().strftime('%Y%m%d')}.pdf"}
        )


#-----------BILLING NETWORKING REPORTS API ENDPOINTS-----------

@router.get("/billing/reports/networking", summary="Get Networking Report Data for UI Table")
async def get_billing_networking_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    visit_type: Optional[str] = Query(None, description="Filter by: incoming, outgoing"),
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, approved, paid, completed"),
    sort_by: str = Query("start_date", description="Sort by: start_date, total_charge, member_name"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get networking visits report data for UI table with pagination and filters.
    Shows: Member | Home Center | Visited Center | Date | Charge | Fee | Net | Status
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found")
    
    # Parse dates
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    platform_fee_percentage = Decimal("0.15")
    
    # Fetch incoming visits (members from other centers visiting this center)
    incoming_where = [UserCenterMembership.center_id == center_id]
    if start_date_parsed:
        incoming_where.append(UserCenterMembership.start_date >= start_date_parsed)
    if end_date_parsed:
        incoming_where.append(UserCenterMembership.start_date <= end_date_parsed)
    if status_filter:
        try:
            status_enum = NetworkingStatusEnum[status_filter.lower()]
            incoming_where.append(UserCenterMembership.network_status == status_enum)
        except KeyError:
            pass
    
    incoming_query = select(UserCenterMembership).where(*incoming_where)
    incoming_result = await db.execute(incoming_query)
    incoming_visits = incoming_result.scalars().all()
    
    # Fetch outgoing visits (this center's members visiting other centers)
    members_result = await db.execute(select(Member.id).where(Member.home_center_id == center_id))
    center_member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if center_member_ids:
        outgoing_where = [
            UserCenterMembership.user_id.in_(center_member_ids),
            UserCenterMembership.center_id != center_id
        ]
        if start_date_parsed:
            outgoing_where.append(UserCenterMembership.start_date >= start_date_parsed)
        if end_date_parsed:
            outgoing_where.append(UserCenterMembership.start_date <= end_date_parsed)
        if status_filter:
            try:
                status_enum = NetworkingStatusEnum[status_filter.lower()]
                outgoing_where.append(UserCenterMembership.network_status == status_enum)
            except KeyError:
                pass
        
        outgoing_query = select(UserCenterMembership).where(*outgoing_where)
        outgoing_result = await db.execute(outgoing_query)
        outgoing_visits = outgoing_result.scalars().all()
    
    # Apply visit_type filter
    if visit_type == "incoming":
        all_visits = incoming_visits
    elif visit_type == "outgoing":
        all_visits = outgoing_visits
    else:
        all_visits = list(incoming_visits) + list(outgoing_visits)
    
    # Batch fetch related data
    user_ids = {v.user_id for v in all_visits}
    center_ids = {v.center_id for v in all_visits}
    visit_ids = {v.id for v in all_visits}
    
    # Fetch users and members
    user_map = {}
    member_map = {}
    if user_ids:
        users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
        
        members_result = await db.execute(select(Member).where(Member.id.in_(user_ids)))
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
    
    # Fetch centers
    center_map = {}
    if center_ids:
        centers_result = await db.execute(select(Center).where(Center.id.in_(center_ids)))
        centers = centers_result.scalars().all()
        center_map = {c.id: c for c in centers}
    
    # Fetch payment orders
    payment_map = {}
    if visit_ids:
        payments_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(visit_ids),
                    PaymentOrder.order_type == OrderType.networking_access
                )
            )
        )
        payments = payments_result.scalars().all()
        payment_map = {p.reference_id: p for p in payments}
    
    # Build response
    visits_list = []
    
    for visit in all_visits:
        member = member_map.get(visit.user_id)
        user = user_map.get(visit.user_id)
        visited_center = center_map.get(visit.center_id)
        payment = payment_map.get(visit.id)
        
        member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")
        member_mobile = user.mobile if user else None
        
        home_center = None
        if member and member.home_center_id:
            home_center = center_map.get(member.home_center_id)
        
        total_charge = Decimal(str(payment.total_amount)) if payment else Decimal("0.00")
        platform_fee = (total_charge * platform_fee_percentage).quantize(Decimal("0.01"))
        
        # Determine if incoming or outgoing
        is_incoming = str(visit.center_id) == str(center_id)
        net_amount = (total_charge - platform_fee).quantize(Decimal("0.01")) if is_incoming else total_charge
        
        visits_list.append({
            "network_membership_id": str(visit.id),
            "visit_type": "incoming" if is_incoming else "outgoing",
            "member_name": member_name,
            "member_mobile": member_mobile,
            "home_center": home_center.center_name if home_center else "N/A",
            "visited_center": visited_center.center_name if visited_center else "N/A",
            "visit_date": visit.start_date.isoformat() if visit.start_date else None,
            "total_charge": str(total_charge),
            "platform_fee": str(platform_fee),
            "net_amount": str(net_amount),
            "status": visit.network_status.value if visit.network_status else "pending",
            "payment_status": payment.status.value if payment else "unpaid",
        })
    
    # Sort
    reverse = (sort_order == "desc")
    if sort_by == "member_name":
        visits_list.sort(key=lambda x: x["member_name"], reverse=reverse)
    elif sort_by == "total_charge":
        visits_list.sort(key=lambda x: Decimal(x["total_charge"]), reverse=reverse)
    else:  # start_date
        visits_list.sort(key=lambda x: x["visit_date"] or "", reverse=reverse)
    
    # Calculate summary
    total_visits = len(visits_list)
    total_revenue = sum(Decimal(v["total_charge"]) for v in visits_list)
    total_fees = sum(Decimal(v["platform_fee"]) for v in visits_list)
    total_net = sum(Decimal(v["net_amount"]) for v in visits_list)
    incoming_count = sum(1 for v in visits_list if v["visit_type"] == "incoming")
    outgoing_count = sum(1 for v in visits_list if v["visit_type"] == "outgoing")
    
    # Pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated = visits_list[start_idx:end_idx]
    
    return {
        "page": page,
        "page_size": page_size,
        "total": total_visits,
        "start_date": start_date_parsed.isoformat() if start_date_parsed else None,
        "end_date": end_date_parsed.isoformat() if end_date_parsed else None,
        "summary": {
            "total_visits": total_visits,
            "total_revenue": str(total_revenue),
            "total_platform_fees": str(total_fees),
            "total_net": str(total_net),
            "incoming_visits": incoming_count,
            "outgoing_visits": outgoing_count,
        },
        "visits": paginated,
    }


@router.post("/billing/reports/generate/networking", summary="Generate and Download Networking Report")
async def generate_billing_networking_report(
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    format: str = Query("pdf", description="Output format: pdf, csv"),
    visit_type: Optional[str] = Query(None, description="Filter by: incoming, outgoing"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Generate and download networking visits report in PDF or CSV format.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found")
    
    # Get center details
    center_result = await db.execute(select(Center).where(Center.id == center_id))
    center = center_result.scalar_one_or_none()
    
    # Extract center details immediately
    center_name = center.center_name if center else "Center"
    center_address = ""  # Center model uses address relationship, not direct field
    
    # Fetch data (reuse logic from above)
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    platform_fee_percentage = Decimal("0.15")
    
    # Fetch incoming visits
    incoming_where = [UserCenterMembership.center_id == center_id]
    if start_date_parsed:
        incoming_where.append(UserCenterMembership.start_date >= start_date_parsed)
    if end_date_parsed:
        incoming_where.append(UserCenterMembership.start_date <= end_date_parsed)
    if status_filter:
        try:
            status_enum = NetworkingStatusEnum[status_filter.lower()]
            incoming_where.append(UserCenterMembership.network_status == status_enum)
        except KeyError:
            pass
    
    incoming_query = select(UserCenterMembership).where(*incoming_where)
    incoming_result = await db.execute(incoming_query)
    incoming_visits = incoming_result.scalars().all()
    
    # Fetch outgoing visits
    members_result = await db.execute(select(Member.id).where(Member.home_center_id == center_id))
    center_member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if center_member_ids:
        outgoing_where = [
            UserCenterMembership.user_id.in_(center_member_ids),
            UserCenterMembership.center_id != center_id
        ]
        if start_date_parsed:
            outgoing_where.append(UserCenterMembership.start_date >= start_date_parsed)
        if end_date_parsed:
            outgoing_where.append(UserCenterMembership.start_date <= end_date_parsed)
        if status_filter:
            try:
                status_enum = NetworkingStatusEnum[status_filter.lower()]
                outgoing_where.append(UserCenterMembership.network_status == status_enum)
            except KeyError:
                pass
        
        outgoing_query = select(UserCenterMembership).where(*outgoing_where)
        outgoing_result = await db.execute(outgoing_query)
        outgoing_visits = outgoing_result.scalars().all()
    
    # Apply visit_type filter
    if visit_type == "incoming":
        all_visits = incoming_visits
    elif visit_type == "outgoing":
        all_visits = outgoing_visits
    else:
        all_visits = list(incoming_visits) + list(outgoing_visits)
    
    # Batch fetch related data
    user_ids = {v.user_id for v in all_visits}
    center_ids = {v.center_id for v in all_visits}
    visit_ids = {v.id for v in all_visits}
    
    user_map = {}
    member_map = {}
    if user_ids:
        users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}
        
        members_result = await db.execute(select(Member).where(Member.id.in_(user_ids)))
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}
    
    center_map = {}
    if center_ids:
        centers_result = await db.execute(select(Center).where(Center.id.in_(center_ids)))
        centers = centers_result.scalars().all()
        center_map = {c.id: c for c in centers}
    
    payment_map = {}
    if visit_ids:
        payments_result = await db.execute(
            select(PaymentOrder).where(
                and_(
                    PaymentOrder.reference_id.in_(visit_ids),
                    PaymentOrder.order_type == OrderType.networking_access
                )
            )
        )
        payments = payments_result.scalars().all()
        payment_map = {p.reference_id: p for p in payments}
    
    # Build report data
    report_data = []
    
    for visit in all_visits:
        member = member_map.get(visit.user_id)
        user = user_map.get(visit.user_id)
        visited_center = center_map.get(visit.center_id)
        payment = payment_map.get(visit.id)
        
        member_name = member.full_name if member and member.full_name else (user.email if user else "N/A")
        
        home_center = None
        if member and member.home_center_id:
            home_center = center_map.get(member.home_center_id)
        
        total_charge = Decimal(str(payment.total_amount)) if payment else Decimal("0.00")
        platform_fee = (total_charge * platform_fee_percentage).quantize(Decimal("0.01"))
        
        is_incoming = str(visit.center_id) == str(center_id)
        net_amount = (total_charge - platform_fee).quantize(Decimal("0.01")) if is_incoming else total_charge
        
        # Handle visit.start_date - it's already a date object, no need to call .date()
        visit_date_str = visit.start_date.isoformat() if visit.start_date else "N/A"
        
        report_data.append({
            "Type": "Incoming" if is_incoming else "Outgoing",
            "Member": member_name,
            "Home Center": home_center.center_name if home_center else "N/A",
            "Visited Center": visited_center.center_name if visited_center else "N/A",
            "Visit Date": visit_date_str,  # Fixed: no .date() call
            "Charge": str(total_charge),
            "Platform Fee (15%)": str(platform_fee),
            "Net Amount": str(net_amount),
            "Status": visit.network_status.value.title() if visit.network_status else "Pending",
        })
    
    # Generate report
    report_generator = BillingReportGenerator(
        center_name=center_name,
        center_address=center_address,
        report_type="Networking Visits Report",
        start_date=start_date_parsed,
        end_date=end_date_parsed
    )
    
    if format.lower() == "csv":
        csv_content = report_generator.generate_csv(report_data)
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=networking_report_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    else:  # PDF
        pdf_content = report_generator.generate_pdf(report_data)
        return StreamingResponse(
            iter([pdf_content]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=networking_report_{datetime.now().strftime('%Y%m%d')}.pdf"}
        )


#-----------BILLING SETTLEMENTS REPORTS API ENDPOINTS-----------

@router.get("/billing/reports/settlements", summary="Get Settlements Report Data for UI Table")
async def get_billing_settlements_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    period_type: str = Query("monthly", description="Period grouping: weekly, monthly"),
    status_filter: Optional[str] = Query(None, description="Filter by: pending, completed"),
    sort_by: str = Query("period_start", description="Sort by: period_start, net_amount, total_income"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Get settlements report data for UI table with pagination and filters.
    Shows: Period | Income | Expenses | Platform Fees | Net Amount | Status
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found")
    
    # Parse dates
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    if not end_date_parsed:
        end_date_parsed = datetime.utcnow().date()
    if not start_date_parsed:
        start_date_parsed = end_date_parsed - timedelta(days=90)
    
    platform_fee_percentage = Decimal("0.15")
    
    # Fetch all income sources
    income_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(start_date_parsed, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(end_date_parsed, datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid,
            PaymentOrder.order_type.in_([
                OrderType.membership,
                OrderType.renewal,
                OrderType.stock_purchase,
                OrderType.networking_access
            ])
        )
    )
    income_result = await db.execute(income_query)
    income_payments = income_result.scalars().all()
    
    # Fetch networking visits for platform fees
    incoming_visits_query = select(UserCenterMembership).where(
        and_(
            UserCenterMembership.center_id == center_id,
            UserCenterMembership.start_date >= start_date_parsed,
            UserCenterMembership.start_date <= end_date_parsed
        )
    )
    incoming_result = await db.execute(incoming_visits_query)
    incoming_visits = incoming_result.scalars().all()
    
    # Fetch outgoing visits for expenses
    members_result = await db.execute(select(Member.id).where(Member.home_center_id == center_id))
    center_member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if center_member_ids:
        outgoing_visits_query = select(UserCenterMembership).where(
            and_(
                UserCenterMembership.user_id.in_(center_member_ids),
                UserCenterMembership.center_id != center_id,
                UserCenterMembership.start_date >= start_date_parsed,
                UserCenterMembership.start_date <= end_date_parsed
            )
        )
        outgoing_result = await db.execute(outgoing_visits_query)
        outgoing_visits = outgoing_result.scalars().all()
    
    # Group by period
    period_groups = {}
    
    for payment in income_payments:
        payment_date = payment.created_at.date()
        period_key = get_period_key(payment_date, period_type)
        
        if period_key not in period_groups:
            period_groups[period_key] = {
                "membership_income": Decimal("0.00"),
                "inventory_income": Decimal("0.00"),
                "networking_income": Decimal("0.00"),
                "networking_expenses": Decimal("0.00"),
                "platform_fees": Decimal("0.00"),
            }
        
        amount = Decimal(str(payment.total_amount))
        
        if payment.order_type in [OrderType.membership, OrderType.renewal]:
            period_groups[period_key]["membership_income"] += amount
        elif payment.order_type == OrderType.stock_purchase:
            period_groups[period_key]["inventory_income"] += amount
        elif payment.order_type == OrderType.networking_access:
            period_groups[period_key]["networking_income"] += amount
    
    # Add networking visits
    for visit in incoming_visits:
        visit_date = visit.start_date if isinstance(visit.start_date, date) else visit.start_date.date()
        period_key = get_period_key(visit_date, period_type)
        
        if period_key not in period_groups:
            period_groups[period_key] = {
                "membership_income": Decimal("0.00"),
                "inventory_income": Decimal("0.00"),
                "networking_income": Decimal("0.00"),
                "networking_expenses": Decimal("0.00"),
                "platform_fees": Decimal("0.00"),
            }
        
        # Platform fee on incoming visits
        visit_payment_query = select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id == visit.id,
                PaymentOrder.order_type == OrderType.networking_access
            )
        )
        visit_payment_result = await db.execute(visit_payment_query)
        visit_payment = visit_payment_result.scalar_one_or_none()
        
        if visit_payment:
            visit_amount = Decimal(str(visit_payment.total_amount))
            platform_fee = (visit_amount * platform_fee_percentage).quantize(Decimal("0.01"))
            period_groups[period_key]["platform_fees"] += platform_fee
    
    for visit in outgoing_visits:
        visit_date = visit.start_date if isinstance(visit.start_date, date) else visit.start_date.date()
        period_key = get_period_key(visit_date, period_type)
        
        if period_key not in period_groups:
            period_groups[period_key] = {
                "membership_income": Decimal("0.00"),
                "inventory_income": Decimal("0.00"),
                "networking_income": Decimal("0.00"),
                "networking_expenses": Decimal("0.00"),
                "platform_fees": Decimal("0.00"),
            }
        
        # Outgoing visit expense
        visit_payment_query = select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id == visit.id,
                PaymentOrder.order_type == OrderType.networking_access
            )
        )
        visit_payment_result = await db.execute(visit_payment_query)
        visit_payment = visit_payment_result.scalar_one_or_none()
        
        if visit_payment:
            visit_amount = Decimal(str(visit_payment.total_amount))
            period_groups[period_key]["networking_expenses"] += visit_amount
    
    # Build settlements list
    settlements_list = []
    
    for period_key, data in period_groups.items():
        period_start, period_end = parse_period_key(period_key, period_type)
        
        total_income = (
            data["membership_income"] + 
            data["inventory_income"] + 
            data["networking_income"]
        )
        
        total_expenses = data["networking_expenses"]
        
        net_amount = (total_income - data["platform_fees"] - total_expenses).quantize(Decimal("0.01"))
        
        # Determine status (you may want to track this in database)
        status = "completed" if period_end < date.today() else "pending"
        
        settlements_list.append({
            "period_key": period_key,
            "period_label": format_period_label(period_start, period_end),
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "membership_income": str(data["membership_income"]),
            "inventory_income": str(data["inventory_income"]),
            "networking_income": str(data["networking_income"]),
            "total_income": str(total_income),
            "networking_expenses": str(data["networking_expenses"]),
            "total_expenses": str(total_expenses),
            "platform_fees": str(data["platform_fees"]),
            "net_amount": str(net_amount),
            "status": status,
        })
    
    # Apply status filter
    if status_filter:
        settlements_list = [s for s in settlements_list if s["status"] == status_filter]
    
    # Sort
    reverse = (sort_order == "desc")
    if sort_by == "net_amount":
        settlements_list.sort(key=lambda x: Decimal(x["net_amount"]), reverse=reverse)
    elif sort_by == "total_income":
        settlements_list.sort(key=lambda x: Decimal(x["total_income"]), reverse=reverse)
    else:  # period_start
        settlements_list.sort(key=lambda x: x["period_start"], reverse=reverse)
    
    # Calculate summary
    total_periods = len(settlements_list)
    total_income_all = sum(Decimal(s["total_income"]) for s in settlements_list)
    total_expenses_all = sum(Decimal(s["total_expenses"]) for s in settlements_list)
    total_fees_all = sum(Decimal(s["platform_fees"]) for s in settlements_list)
    total_net_all = sum(Decimal(s["net_amount"]) for s in settlements_list)
    
    # Pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated = settlements_list[start_idx:end_idx]
    
    return {
        "page": page,
        "page_size": page_size,
        "total": total_periods,
        "period_type": period_type,
        "start_date": start_date_parsed.isoformat(),
        "end_date": end_date_parsed.isoformat(),
        "summary": {
            "total_periods": total_periods,
            "total_income": str(total_income_all),
            "total_expenses": str(total_expenses_all),
            "total_platform_fees": str(total_fees_all),
            "total_net": str(total_net_all),
        },
        "settlements": paginated,
    }


@router.post("/billing/reports/generate/settlements", summary="Generate and Download Settlements Report")
async def generate_billing_settlements_report(
    start_date: Optional[str] = Query(None, description="Start date for report (YYYY-MM-DD or null for all time)"),
    end_date: Optional[str] = Query(None, description="End date for report (YYYY-MM-DD or null for all time)"),
    format: str = Query("pdf", description="Output format: pdf, csv"),
    period_type: str = Query("monthly", description="Period grouping: weekly, monthly"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Generate and download settlements report in PDF or CSV format.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="Center ID not found")
    
    # Get center details
    center_result = await db.execute(select(Center).where(Center.id == center_id))
    center = center_result.scalar_one_or_none()
    
    # Extract center details immediately
    center_name = center.center_name if center else "Center"
    center_address = ""  # Center model uses address relationship, not direct field
    
    # Fetch data (reuse logic from above - simplified here)
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    if not end_date_parsed:
        end_date_parsed = datetime.utcnow().date()
    if not start_date_parsed:
        start_date_parsed = end_date_parsed - timedelta(days=90)
    
    platform_fee_percentage = Decimal("0.15")
    
    # Fetch income
    income_query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(start_date_parsed, datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(end_date_parsed, datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid,
            PaymentOrder.order_type.in_([
                OrderType.membership,
                OrderType.renewal,
                OrderType.stock_purchase,
                OrderType.networking_access
            ])
        )
    )
    income_result = await db.execute(income_query)
    income_payments = income_result.scalars().all()
    
    # Fetch networking visits
    incoming_visits_query = select(UserCenterMembership).where(
        and_(
            UserCenterMembership.center_id == center_id,
            UserCenterMembership.start_date >= start_date_parsed,
            UserCenterMembership.start_date <= end_date_parsed
        )
    )
    incoming_result = await db.execute(incoming_visits_query)
    incoming_visits = incoming_result.scalars().all()
    
    members_result = await db.execute(select(Member.id).where(Member.home_center_id == center_id))
    center_member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if center_member_ids:
        outgoing_visits_query = select(UserCenterMembership).where(
            and_(
                UserCenterMembership.user_id.in_(center_member_ids),
                UserCenterMembership.center_id != center_id,
                UserCenterMembership.start_date >= start_date_parsed,
                UserCenterMembership.start_date <= end_date_parsed
            )
        )
        outgoing_result = await db.execute(outgoing_visits_query)
        outgoing_visits = outgoing_result.scalars().all()
    
    # Group by period (same logic as above)
    period_groups = {}
    
    for payment in income_payments:
        payment_date = payment.created_at.date()
        period_key = get_period_key(payment_date, period_type)
        
        if period_key not in period_groups:
            period_groups[period_key] = {
                "membership_income": Decimal("0.00"),
                "inventory_income": Decimal("0.00"),
                "networking_income": Decimal("0.00"),
                "networking_expenses": Decimal("0.00"),
                "platform_fees": Decimal("0.00"),
            }
        
        amount = Decimal(str(payment.total_amount))
        
        if payment.order_type in [OrderType.membership, OrderType.renewal]:
            period_groups[period_key]["membership_income"] += amount
        elif payment.order_type == OrderType.stock_purchase:
            period_groups[period_key]["inventory_income"] += amount
        elif payment.order_type == OrderType.networking_access:
            period_groups[period_key]["networking_income"] += amount
    
    for visit in incoming_visits:
        visit_date = visit.start_date if isinstance(visit.start_date, date) else visit.start_date.date()
        period_key = get_period_key(visit_date, period_type)
        
        if period_key not in period_groups:
            period_groups[period_key] = {
                "membership_income": Decimal("0.00"),
                "inventory_income": Decimal("0.00"),
                "networking_income": Decimal("0.00"),
                "networking_expenses": Decimal("0.00"),
                "platform_fees": Decimal("0.00"),
            }
        
        visit_payment_query = select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id == visit.id,
                PaymentOrder.order_type == OrderType.networking_access
            )
        )
        visit_payment_result = await db.execute(visit_payment_query)
        visit_payment = visit_payment_result.scalar_one_or_none()
        
        if visit_payment:
            visit_amount = Decimal(str(visit_payment.total_amount))
            platform_fee = (visit_amount * platform_fee_percentage).quantize(Decimal("0.01"))
            period_groups[period_key]["platform_fees"] += platform_fee
    
    for visit in outgoing_visits:
        visit_date = visit.start_date if isinstance(visit.start_date, date) else visit.start_date.date()
        period_key = get_period_key(visit_date, period_type)
        
        if period_key not in period_groups:
            period_groups[period_key] = {
                "membership_income": Decimal("0.00"),
                "inventory_income": Decimal("0.00"),
                "networking_income": Decimal("0.00"),
                "networking_expenses": Decimal("0.00"),
                "platform_fees": Decimal("0.00"),
            }
        
        visit_payment_query = select(PaymentOrder).where(
            and_(
                PaymentOrder.reference_id == visit.id,
                PaymentOrder.order_type == OrderType.networking_access
            )
        )
        visit_payment_result = await db.execute(visit_payment_query)
        visit_payment = visit_payment_result.scalar_one_or_none()
        
        if visit_payment:
            visit_amount = Decimal(str(visit_payment.total_amount))
            period_groups[period_key]["networking_expenses"] += visit_amount
    
    # Build report data
    report_data = []
    
    for period_key, data in sorted(period_groups.items()):
        period_start, period_end = parse_period_key(period_key, period_type)
        
        total_income = (
            data["membership_income"] + 
            data["inventory_income"] + 
            data["networking_income"]
        )
        
        total_expenses = data["networking_expenses"]
        net_amount = (total_income - data["platform_fees"] - total_expenses).quantize(Decimal("0.01"))
        
        status = "Completed" if period_end < date.today() else "Pending"
        
        # Apply status filter
        if status_filter and status.lower() != status_filter.lower():
            continue
        
        report_data.append({
            "Period": format_period_label(period_start, period_end),
            "Start Date": period_start.isoformat(),
            "End Date": period_end.isoformat(),
            "Membership Income": str(data["membership_income"]),
            "Inventory Income": str(data["inventory_income"]),
            "Networking Income": str(data["networking_income"]),
            "Total Income": str(total_income),
            "Networking Expenses": str(data["networking_expenses"]),
            "Platform Fees": str(data["platform_fees"]),
            "Net Amount": str(net_amount),
            "Status": status,
        })
    
    # Generate report
    report_generator = BillingReportGenerator(
        center_name=center_name,
        center_address=center_address,
        report_type="Settlements Report",
        start_date=start_date_parsed,
        end_date=end_date_parsed
    )
    
    if format.lower() == "csv":
        csv_content = report_generator.generate_csv(report_data)
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=settlements_report_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    else:  # PDF
        pdf_content = report_generator.generate_pdf(report_data)
        return StreamingResponse(
            iter([pdf_content]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=settlements_report_{datetime.now().strftime('%Y%m%d')}.pdf"}
        )