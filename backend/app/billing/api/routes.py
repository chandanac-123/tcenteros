from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.core.dependencies import get_async_session, centeradmin_required
from app.billing.schema.schema import *
from app.billing.models.models import PaymentOrder, PaymentOrderStatus, ReferenceSchema, PaymentMethod, OrderType
from app.inventory.models.models import Sale, SaleItem, Product
from app.membership.models.models import MemberMembership, Membership, DurationUnitEnum
from app.auth.models.models import Member, User, UserCenterMembership, NetworkingStatusEnum, Employee
from app.settings.models.models import TaxCategory, CenterOperationalSetting, Designation
from app.center.models.models import Center, CenterWallet, WalletTransaction
from sqlalchemy.orm import selectinload
from uuid import UUID
from calendar import monthrange
from fastapi.responses import StreamingResponse
import io
import csv
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill






router = APIRouter()


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
    """
    List all memberships with renewal status for the center.
    Shows: Member | Plan | Expiry | Renewal Due | Amount | Status
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned")

    # Build query to get all member memberships for this center
    query = select(MemberMembership).where(
        MemberMembership.center_id == center_id
    )

    # Execute query
    result = await db.execute(query)
    member_memberships = result.scalars().all()

    # Collect all unique IDs for batch fetching
    member_ids = {mm.member_id for mm in member_memberships}
    membership_ids = {mm.membership_id for mm in member_memberships}

    # Batch fetch members
    member_map = {}
    if member_ids:
        members_result = await db.execute(
            select(Member).where(Member.id.in_(member_ids))
        )
        members = members_result.scalars().all()
        member_map = {m.id: m for m in members}

    # Batch fetch base users for mobile numbers
    user_map = {}
    if member_ids:
        users_result = await db.execute(
            select(User).where(User.id.in_(member_ids))
        )
        users = users_result.scalars().all()
        user_map = {u.id: u for u in users}

    # Batch fetch memberships
    membership_map = {}
    if membership_ids:
        memberships_result = await db.execute(
            select(Membership).where(Membership.membership_id.in_(membership_ids))
        )
        memberships = memberships_result.scalars().all()
        membership_map = {m.membership_id: m for m in memberships}

    # Build response data
    today = date.today()
    membership_list = []

    for mm in member_memberships:
        member = member_map.get(mm.member_id)
        user = user_map.get(mm.member_id)
        membership = membership_map.get(mm.membership_id)

        if not member or not membership:
            continue

        member_name = member.full_name if member.full_name else (user.email if user else "N/A")
        member_mobile = user.mobile if user else None

        # Calculate expiry and renewal status
        expiry_date = mm.end_date.date() if mm.end_date else None
        days_until_expiry = None
        renewal_status = "active"

        if expiry_date:
            days_until_expiry = (expiry_date - today).days
            
            if days_until_expiry < 0:
                renewal_status = "expired"
            elif days_until_expiry <= 7:  # Due if expiring within 7 days
                renewal_status = "due"
            else:
                renewal_status = "active"

        membership_list.append({
            "member_id": str(mm.member_id),
            "member_name": member_name,
            "member_mobile": member_mobile,
            "plan_name": membership.membership_name,
            "membership_id": str(mm.membership_id),
            "member_membership_id": str(mm.id),
            "start_date": mm.start_date.date().isoformat() if mm.start_date else None,
            "end_date": expiry_date.isoformat() if expiry_date else None,
            "expiry_date": expiry_date.isoformat() if expiry_date else None,
            "days_until_expiry": days_until_expiry,
            "renewal_status": renewal_status,
            "total_amount": str(mm.total_amount),
            "membership_status": mm.membership_status.value if mm.membership_status else "active",
        })

    # Apply search filter
    if search:
        search_lower = search.lower()
        membership_list = [
            item for item in membership_list
            if (search_lower in item["member_name"].lower() or
                (item["member_mobile"] and search_lower in item["member_mobile"]))
        ]

    # Apply status filter
    if status_filter:
        membership_list = [
            item for item in membership_list
            if item["renewal_status"] == status_filter
        ]

    # Sort
    reverse = (sort_order == "desc")
    if sort_by == "member_name":
        membership_list.sort(key=lambda x: x["member_name"], reverse=reverse)
    elif sort_by == "total_amount":
        membership_list.sort(key=lambda x: Decimal(x["total_amount"]), reverse=reverse)
    else:  # default to end_date
        membership_list.sort(
            key=lambda x: x["end_date"] if x["end_date"] else "9999-12-31",
            reverse=reverse
        )

    # Pagination
    total = len(membership_list)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_list = membership_list[start_idx:end_idx]

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "memberships": paginated_list,
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


#-----------REPORTS API ENDPOINTS-----------


# ============================================================================
# 1. DAILY SALES REPORT
# ============================================================================

@router.get("/billing/reports/daily-sales", summary="Get daily sales report")
async def get_daily_sales_report(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Daily sales report with breakdown by day.
    Shows total sales, count, and payment methods per day.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    try:
        date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
        date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Get all sales transactions
    query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(date_from_parsed.date(), datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(date_to_parsed.date(), datetime.max.time()),
            PaymentOrder.order_type.in_([
                OrderType.membership,
                OrderType.renewal,
                OrderType.stock_purchase,
                OrderType.networking_access
            ]),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    ).order_by(PaymentOrder.created_at)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Group by day
    daily_data = {}
    
    for payment in payments:
        day_key = payment.created_at.date().isoformat()
        
        if day_key not in daily_data:
            daily_data[day_key] = {
                "date": day_key,
                "total_sales": Decimal("0.00"),
                "transaction_count": 0,
                "cash": Decimal("0.00"),
                "upi": Decimal("0.00"),
                "card": Decimal("0.00"),
                "bank_transfer": Decimal("0.00"),
                "other": Decimal("0.00"),
                "membership_sales": Decimal("0.00"),
                "inventory_sales": Decimal("0.00"),
                "network_sales": Decimal("0.00"),
            }
        
        amount = Decimal(str(payment.total_amount))
        daily_data[day_key]["total_sales"] += amount
        daily_data[day_key]["transaction_count"] += 1
        
        # By payment method
        if payment.payment_method:
            method_key = payment.payment_method.value.lower()
            if method_key in daily_data[day_key]:
                daily_data[day_key][method_key] += amount
        
        # By order type
        if payment.order_type in [OrderType.membership, OrderType.renewal]:
            daily_data[day_key]["membership_sales"] += amount
        elif payment.order_type == OrderType.stock_purchase:
            daily_data[day_key]["inventory_sales"] += amount
        elif payment.order_type == OrderType.networking_access:
            daily_data[day_key]["network_sales"] += amount
    
    # Convert to list and sort
    daily_list = sorted(daily_data.values(), key=lambda x: x["date"])
    
    # Calculate totals
    total_sales = sum(Decimal(d["total_sales"]) for d in daily_list)
    total_transactions = sum(d["transaction_count"] for d in daily_list)
    
    return {
        "date_from": date_from,
        "date_to": date_to,
        "total_sales": str(total_sales),
        "total_transactions": total_transactions,
        "daily_breakdown": [
            {**d, "total_sales": str(d["total_sales"]), 
             "cash": str(d["cash"]), "upi": str(d["upi"]), 
             "card": str(d["card"]), "bank_transfer": str(d["bank_transfer"]), 
             "other": str(d["other"]), "membership_sales": str(d["membership_sales"]),
             "inventory_sales": str(d["inventory_sales"]), "network_sales": str(d["network_sales"])}
            for d in daily_list
        ]
    }


# ============================================================================
# 2. MEMBERSHIP REVENUE REPORT
# ============================================================================

@router.get("/billing/reports/membership-revenue", summary="Get membership revenue report")
async def get_membership_revenue_report(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Membership revenue report.
    Shows new memberships vs renewals, revenue by plan.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    try:
        date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
        date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Get membership payments
    query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(date_from_parsed.date(), datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(date_to_parsed.date(), datetime.max.time()),
            PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal]),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Get member memberships for plan details
    member_membership_ids = {p.reference_id for p in payments if p.reference_id}
    membership_map = {}
    plan_stats = {}
    
    if member_membership_ids:
        mm_query = select(MemberMembership).where(MemberMembership.id.in_(member_membership_ids))
        mm_result = await db.execute(mm_query)
        member_memberships = mm_result.scalars().all()
        
        membership_ids = {mm.membership_id for mm in member_memberships}
        if membership_ids:
            m_query = select(Membership).where(Membership.membership_id.in_(membership_ids))
            m_result = await db.execute(m_query)
            memberships = m_result.scalars().all()
            membership_map = {m.membership_id: m for m in memberships}
    
    # Calculate stats
    new_memberships = [p for p in payments if p.order_type == OrderType.membership]
    renewals = [p for p in payments if p.order_type == OrderType.renewal]
    
    new_revenue = sum(Decimal(str(p.total_amount)) for p in new_memberships)
    renewal_revenue = sum(Decimal(str(p.total_amount)) for p in renewals)
    total_revenue = new_revenue + renewal_revenue
    
    # Revenue by plan
    for payment in payments:
        if payment.reference_id and payment.reference_id in [mm.id for mm in member_memberships]:
            mm = next((mm for mm in member_memberships if mm.id == payment.reference_id), None)
            if mm and mm.membership_id in membership_map:
                plan = membership_map[mm.membership_id]
                plan_name = plan.membership_name
                
                if plan_name not in plan_stats:
                    plan_stats[plan_name] = {
                        "plan_name": plan_name,
                        "new_count": 0,
                        "renewal_count": 0,
                        "total_revenue": Decimal("0.00")
                    }
                
                if payment.order_type == OrderType.membership:
                    plan_stats[plan_name]["new_count"] += 1
                else:
                    plan_stats[plan_name]["renewal_count"] += 1
                
                plan_stats[plan_name]["total_revenue"] += Decimal(str(payment.total_amount))
    
    return {
        "date_from": date_from,
        "date_to": date_to,
        "summary": {
            "total_revenue": str(total_revenue),
            "new_memberships_revenue": str(new_revenue),
            "renewals_revenue": str(renewal_revenue),
            "new_memberships_count": len(new_memberships),
            "renewals_count": len(renewals),
            "total_count": len(payments)
        },
        "by_plan": [
            {**stats, "total_revenue": str(stats["total_revenue"])}
            for stats in plan_stats.values()
        ]
    }


# ============================================================================
# 3. INVENTORY SALES REPORT
# ============================================================================

@router.get("/billing/reports/inventory-sales", summary="Get inventory sales report")
async def get_inventory_sales_report(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Inventory/product sales report.
    Shows sales by product, quantities sold, revenue.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    try:
        date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
        date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Get inventory sales payments
    query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(date_from_parsed.date(), datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(date_to_parsed.date(), datetime.max.time()),
            PaymentOrder.order_type == OrderType.stock_purchase,
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Get sales and products
    sale_ids = {p.reference_id for p in payments if p.reference_id}
    product_stats = {}
    
    if sale_ids:
        # Get sales
        sales_query = select(Sale).where(Sale.sale_id.in_(sale_ids))
        sales_result = await db.execute(sales_query)
        sales = sales_result.scalars().all()
        
        # Get sale items
        sale_items_query = select(SaleItem).where(SaleItem.sale_id.in_(sale_ids))
        sale_items_result = await db.execute(sale_items_query)
        sale_items = sale_items_result.scalars().all()
        
        # Get products
        product_ids = {si.product_id for si in sale_items if si.product_id}
        if product_ids:
            products_query = select(Product).where(Product.id.in_(product_ids))
            products_result = await db.execute(products_query)
            products = products_result.scalars().all()
            product_map = {p.id: p for p in products}
            
            # Calculate stats by product
            for item in sale_items:
                if item.product_id in product_map:
                    product = product_map[item.product_id]
                    product_name = product.product_name
                    
                    if product_name not in product_stats:
                        product_stats[product_name] = {
                            "product_name": product_name,
                            "quantity_sold": 0,
                            "total_revenue": Decimal("0.00"),
                            "sales_count": 0
                        }
                    
                    product_stats[product_name]["quantity_sold"] += item.quantity
                    product_stats[product_name]["total_revenue"] += Decimal(str(item.unit_price)) * item.quantity
                    product_stats[product_name]["sales_count"] += 1
    
    total_revenue = sum(Decimal(str(p.total_amount)) for p in payments)
    
    return {
        "date_from": date_from,
        "date_to": date_to,
        "summary": {
            "total_revenue": str(total_revenue),
            "total_transactions": len(payments),
            "total_products_sold": sum(stats["quantity_sold"] for stats in product_stats.values())
        },
        "by_product": [
            {**stats, "total_revenue": str(stats["total_revenue"])}
            for stats in sorted(product_stats.values(), key=lambda x: x["total_revenue"], reverse=True)
        ]
    }


# ============================================================================
# 4. NETWORK EARNINGS REPORT
# ============================================================================

@router.get("/billing/reports/network-earnings", summary="Get network earnings report")
async def get_network_earnings_report(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Network visits earnings report.
    Shows incoming vs outgoing visits, platform fees, net earnings.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    try:
        date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    platform_fee_percentage = Decimal("0.15")
    
    # Incoming visits
    incoming_query = select(UserCenterMembership).where(
        and_(
            UserCenterMembership.center_id == center_id,
            UserCenterMembership.start_date >= date_from_parsed,
            UserCenterMembership.start_date <= date_to_parsed,
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
    
    # Outgoing visits
    members_query = select(Member.id).where(Member.home_center_id == center_id)
    members_result = await db.execute(members_query)
    member_ids = [m for m in members_result.scalars().all()]
    
    outgoing_visits = []
    if member_ids:
        outgoing_query = select(UserCenterMembership).where(
            and_(
                UserCenterMembership.user_id.in_(member_ids),
                UserCenterMembership.center_id != center_id,
                UserCenterMembership.start_date >= date_from_parsed,
                UserCenterMembership.start_date <= date_to_parsed,
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
    
    # Get payment orders
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
    
    # Calculate earnings
    incoming_total = Decimal("0.00")
    incoming_platform_fees = Decimal("0.00")
    
    for visit in incoming_visits:
        po = payment_orders_map.get(visit.id)
        if po:
            charge = Decimal(str(po.total_amount))
            platform_fee = (charge * platform_fee_percentage).quantize(Decimal("0.01"))
            earned = charge - platform_fee
            
            incoming_total += earned
            incoming_platform_fees += platform_fee
    
    outgoing_total = Decimal("0.00")
    for visit in outgoing_visits:
        po = payment_orders_map.get(visit.id)
        if po:
            outgoing_total += Decimal(str(po.total_amount))
    
    net_earnings = incoming_total - outgoing_total
    
    return {
        "date_from": date_from,
        "date_to": date_to,
        "incoming": {
            "visits_count": len(incoming_visits),
            "gross_revenue": str(incoming_total + incoming_platform_fees),
            "platform_fees": str(incoming_platform_fees),
            "net_revenue": str(incoming_total)
        },
        "outgoing": {
            "visits_count": len(outgoing_visits),
            "total_paid": str(outgoing_total)
        },
        "net_earnings": str(net_earnings),
        "platform_fee_percentage": "15"
    }


# ============================================================================
# 5. TAX SUMMARY REPORT
# ============================================================================

@router.get("/billing/reports/tax-summary", summary="Get tax summary report")
async def get_tax_summary_report(
    date_from: str = Query(..., description="Start date (YYYY-MM-DD)"),
    date_to: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    Tax summary report.
    Shows tax collected by category, total taxable amount, total tax.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Parse dates
    try:
        date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
        date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Get all paid transactions
    query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(date_from_parsed.date(), datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(date_to_parsed.date(), datetime.max.time()),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    )
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Get tax categories
    tax_category_ids = {p.tax_category_id for p in payments if p.tax_category_id}
    tax_category_map = {}
    
    if tax_category_ids:
        tax_query = select(TaxCategory).where(TaxCategory.id.in_(tax_category_ids))
        tax_result = await db.execute(tax_query)
        tax_categories = tax_result.scalars().all()
        tax_category_map = {tc.id: tc for tc in tax_categories}
    
    # Calculate tax stats
    tax_stats = {}
    total_taxable = Decimal("0.00")
    total_tax = Decimal("0.00")
    
    for payment in payments:
        subtotal = Decimal(str(payment.subtotal_amount))
        tax_amount = Decimal(str(payment.tax_amount))
        
        total_taxable += subtotal
        total_tax += tax_amount
        
        if payment.tax_category_id and payment.tax_category_id in tax_category_map:
            tax_cat = tax_category_map[payment.tax_category_id]
            cat_name = tax_cat.tax_name
            
            if cat_name not in tax_stats:
                tax_stats[cat_name] = {
                    "tax_category": cat_name,
                    "tax_rate": str(tax_cat.rate),
                    "taxable_amount": Decimal("0.00"),
                    "tax_collected": Decimal("0.00"),
                    "transaction_count": 0
                }
            
            tax_stats[cat_name]["taxable_amount"] += subtotal
            tax_stats[cat_name]["tax_collected"] += tax_amount
            tax_stats[cat_name]["transaction_count"] += 1
    
    return {
        "date_from": date_from,
        "date_to": date_to,
        "summary": {
            "total_taxable_amount": str(total_taxable),
            "total_tax_collected": str(total_tax),
            "total_transactions": len(payments)
        },
        "by_tax_category": [
            {**stats, "taxable_amount": str(stats["taxable_amount"]), 
             "tax_collected": str(stats["tax_collected"])}
            for stats in tax_stats.values()
        ]
    }


# ============================================================================
# 6. EXPORT EXCEL - Daily Sales
# ============================================================================

@router.get("/billing/reports/daily-sales/export-excel", summary="Export daily sales to Excel")
async def export_daily_sales_excel(
    date_from: str = Query(...),
    date_to: str = Query(...),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """Export daily sales report as Excel file."""
    
    # Get report data (reuse the daily sales logic)
    center_id = current_admin.get("center_id")
    date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
    date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
    
    query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(date_from_parsed.date(), datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(date_to_parsed.date(), datetime.max.time()),
            PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal, OrderType.stock_purchase, OrderType.networking_access]),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    ).order_by(PaymentOrder.created_at)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Create Excel workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Daily Sales Report"
    
    # Header
    headers = ["Date", "Total Sales", "Transactions", "Cash", "UPI", "Card", "Bank Transfer", "Membership", "Inventory", "Network"]
    ws.append(headers)
    
    # Style header
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)
    
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
    
    # Group data by day
    daily_data = {}
    for payment in payments:
        day_key = payment.created_at.date().isoformat()
        if day_key not in daily_data:
            daily_data[day_key] = {
                "total": Decimal("0.00"), "count": 0,
                "cash": Decimal("0.00"), "upi": Decimal("0.00"),
                "card": Decimal("0.00"), "bank_transfer": Decimal("0.00"),
                "membership": Decimal("0.00"), "inventory": Decimal("0.00"), "network": Decimal("0.00")
            }
        
        amount = Decimal(str(payment.total_amount))
        daily_data[day_key]["total"] += amount
        daily_data[day_key]["count"] += 1
        
        if payment.payment_method:
            method_key = payment.payment_method.value.lower()
            if method_key in daily_data[day_key]:
                daily_data[day_key][method_key] += amount
        
        if payment.order_type in [OrderType.membership, OrderType.renewal]:
            daily_data[day_key]["membership"] += amount
        elif payment.order_type == OrderType.stock_purchase:
            daily_data[day_key]["inventory"] += amount
        elif payment.order_type == OrderType.networking_access:
            daily_data[day_key]["network"] += amount
    
    # Add data rows
    for day in sorted(daily_data.keys()):
        d = daily_data[day]
        ws.append([
            day,
            float(d["total"]),
            d["count"],
            float(d["cash"]),
            float(d["upi"]),
            float(d["card"]),
            float(d["bank_transfer"]),
            float(d["membership"]),
            float(d["inventory"]),
            float(d["network"])
        ])
    
    # Save to bytes
    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=daily_sales_{date_from}_to_{date_to}.xlsx"}
    )


# ============================================================================
# 7. EXPORT CSV - Daily Sales
# ============================================================================

@router.get("/billing/reports/daily-sales/export-csv", summary="Export daily sales to CSV")
async def export_daily_sales_csv(
    date_from: str = Query(...),
    date_to: str = Query(...),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """Export daily sales report as CSV file."""
    
    # Get report data (same as Excel)
    center_id = current_admin.get("center_id")
    date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d")
    date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d")
    
    query = select(PaymentOrder).where(
        and_(
            PaymentOrder.center_id == center_id,
            PaymentOrder.created_at >= datetime.combine(date_from_parsed.date(), datetime.min.time()),
            PaymentOrder.created_at <= datetime.combine(date_to_parsed.date(), datetime.max.time()),
            PaymentOrder.order_type.in_([OrderType.membership, OrderType.renewal, OrderType.stock_purchase, OrderType.networking_access]),
            PaymentOrder.status == PaymentOrderStatus.paid
        )
    ).order_by(PaymentOrder.created_at)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Date", "Total Sales", "Transactions", "Cash", "UPI", "Card", "Bank Transfer", "Membership", "Inventory", "Network"])
    
    # Group data
    daily_data = {}
    for payment in payments:
        day_key = payment.created_at.date().isoformat()
        if day_key not in daily_data:
            daily_data[day_key] = {
                "total": Decimal("0.00"), "count": 0,
                "cash": Decimal("0.00"), "upi": Decimal("0.00"),
                "card": Decimal("0.00"), "bank_transfer": Decimal("0.00"),
                "membership": Decimal("0.00"), "inventory": Decimal("0.00"), "network": Decimal("0.00")
            }
        
        amount = Decimal(str(payment.total_amount))
        daily_data[day_key]["total"] += amount
        daily_data[day_key]["count"] += 1
        
        if payment.payment_method:
            method_key = payment.payment_method.value.lower()
            if method_key in daily_data[day_key]:
                daily_data[day_key][method_key] += amount
        
        if payment.order_type in [OrderType.membership, OrderType.renewal]:
            daily_data[day_key]["membership"] += amount
        elif payment.order_type == OrderType.stock_purchase:
            daily_data[day_key]["inventory"] += amount
        elif payment.order_type == OrderType.networking_access:
            daily_data[day_key]["network"] += amount
    
    # Write rows
    for day in sorted(daily_data.keys()):
        d = daily_data[day]
        writer.writerow([
            day, str(d["total"]), d["count"],
            str(d["cash"]), str(d["upi"]), str(d["card"]), str(d["bank_transfer"]),
            str(d["membership"]), str(d["inventory"]), str(d["network"])
        ])
    
    # Return CSV
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=daily_sales_{date_from}_to_{date_to}.csv"}
    )