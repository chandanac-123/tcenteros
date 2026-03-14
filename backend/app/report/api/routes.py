from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal

from app.core.database import get_async_session
from app.core.dependencies import centeradmin_required
from app.auth.models.models import CenterAdmin
from app.center.models.models import Center, CenterStatus
from app.billing.models.models import PaymentOrder, PaymentOrderStatus
from app.inventory.models.models import Sale
from app.membership.models.models import MemberMembership

router = APIRouter()


def parse_date_param(date_str: Optional[str]) -> Optional[date]:
    """Convert string date or 'null' to date object or None"""
    if date_str is None or date_str.lower() == 'null':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {date_str}. Use YYYY-MM-DD or null")


async def get_center_ids_for_admin(
    admin_center_id: str,
    include_sub_branches: bool,
    db: AsyncSession
) -> List[str]:
    """
    Helper function to get list of center IDs (parent + sub-branches if requested)
    """
    center_ids = [admin_center_id]
    
    if include_sub_branches:
        # Get admin's center
        admin_center = await db.get(Center, admin_center_id)
        
        if admin_center and not admin_center.parent_center_id:
            # This is a parent center, get all active sub-branches
            sub_centers_result = await db.execute(
                select(Center.id).where(
                    Center.parent_center_id == admin_center_id,
                    Center.center_status == CenterStatus.active
                )
            )
            sub_center_ids = [str(row[0]) for row in sub_centers_result.all()]
            center_ids.extend(sub_center_ids)
    
    return center_ids


async def get_center_details_map(center_ids: List[str], db: AsyncSession) -> dict:
    """
    Get center details for all centers in the list
    """
    centers_result = await db.execute(
        select(Center).where(Center.id.in_(center_ids))
    )
    centers = centers_result.scalars().all()
    
    return {
        str(c.id): {
            "center_id": str(c.id),
            "center_name": c.center_name,
            "is_sub_branch": bool(c.parent_center_id),
            "parent_center_id": str(c.parent_center_id) if c.parent_center_id else None
        }
        for c in centers
    }


# ============================================================================
# API 1: CONSOLIDATED INCOME REPORT
# ============================================================================

@router.get("/consolidated-income")
async def get_consolidated_income_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD) or null for all time"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD) or null for all time"),
    include_sub_branches: bool = Query(True, description="Include sub-branches in report"),
    group_by: Optional[str] = Query("category", description="Group by: category, center, payment_method"),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    """
    Get consolidated income report for center and its sub-branches.
    
    Income sources:
    - Membership fees (new, renewal, upgrade)
    - Inventory sales
    - Networking access fees
    - Add-on purchases
    - Feature purchases
    - Other revenue
    """
    
    # Parse date parameters
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    # Get admin's center
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    
    admin_center_id = str(center_admin.center_id)
    
    # Get list of center IDs to include
    center_ids = await get_center_ids_for_admin(admin_center_id, include_sub_branches, db)
    center_details = await get_center_details_map(center_ids, db)
    
    # Build date filter conditions
    date_conditions = []
    if start_date_parsed and end_date_parsed:
        date_conditions.append(func.date(PaymentOrder.created_at).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        date_conditions.append(func.date(PaymentOrder.created_at) >= start_date_parsed)
    elif end_date_parsed:
        date_conditions.append(func.date(PaymentOrder.created_at) <= end_date_parsed)
    
    # ===== 1. MEMBERSHIP INCOME (from PaymentOrder) =====
    membership_query = select(
        PaymentOrder.center_id,
        PaymentOrder.order_type,
        PaymentOrder.payment_method,
        func.sum(PaymentOrder.subtotal_amount).label("subtotal"),
        func.sum(PaymentOrder.tax_amount).label("tax"),
        func.sum(PaymentOrder.total_amount).label("total"),
        func.count(PaymentOrder.payment_order_id).label("transaction_count")
    ).where(
        PaymentOrder.center_id.in_(center_ids),
        PaymentOrder.order_type.in_(['membership', 'renewal', 'upgrade']),
        PaymentOrder.status == PaymentOrderStatus.paid
    )
    
    if date_conditions:
        membership_query = membership_query.where(and_(*date_conditions))
    
    membership_query = membership_query.group_by(PaymentOrder.center_id, PaymentOrder.order_type, PaymentOrder.payment_method)
    membership_income_result = await db.execute(membership_query)
    membership_income = membership_income_result.all()
    
    # ===== 2. INVENTORY SALES INCOME =====
    sales_date_conditions = []
    if start_date_parsed and end_date_parsed:
        sales_date_conditions.append(func.date(Sale.created_at).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        sales_date_conditions.append(func.date(Sale.created_at) >= start_date_parsed)
    elif end_date_parsed:
        sales_date_conditions.append(func.date(Sale.created_at) <= end_date_parsed)
    
    sales_query = select(
        Sale.center_id,
        func.sum(Sale.total_amount).label("revenue"),
        func.count(Sale.id).label("transaction_count")
    ).where(Sale.center_id.in_(center_ids))
    
    if sales_date_conditions:
        sales_query = sales_query.where(and_(*sales_date_conditions))
    
    sales_query = sales_query.group_by(Sale.center_id)
    sales_income_result = await db.execute(sales_query)
    sales_income = sales_income_result.all()
    
    # ===== 3. OTHER INCOME (networking, add-ons, features) =====
    other_query = select(
        PaymentOrder.center_id,
        PaymentOrder.order_type,
        PaymentOrder.payment_method,
        func.sum(PaymentOrder.subtotal_amount).label("subtotal"),
        func.sum(PaymentOrder.tax_amount).label("tax"),
        func.sum(PaymentOrder.total_amount).label("total"),
        func.count(PaymentOrder.payment_order_id).label("transaction_count")
    ).where(
        PaymentOrder.center_id.in_(center_ids),
        PaymentOrder.order_type.in_(['networking_access', 'add_on', 'feature_purchase', 'center_subscription']),
        PaymentOrder.status == PaymentOrderStatus.paid
    )
    
    if date_conditions:
        other_query = other_query.where(and_(*date_conditions))
    
    other_query = other_query.group_by(PaymentOrder.center_id, PaymentOrder.order_type, PaymentOrder.payment_method)
    other_income_result = await db.execute(other_query)
    other_income = other_income_result.all()
    
    # ===== BUILD RESPONSE STRUCTURE =====
    
    # Group by center
    income_by_center = {}
    
    for center_id in center_ids:
        center_info = center_details.get(center_id, {})
        
        # Membership income for this center
        membership_data = [
            {
                "order_type": row.order_type,
                "payment_method": row.payment_method.value if hasattr(row.payment_method, 'value') else row.payment_method,
                "subtotal": float(row.subtotal or 0),
                "tax": float(row.tax or 0),
                "total": float(row.total or 0),
                "transaction_count": row.transaction_count
            }
            for row in membership_income if str(row.center_id) == center_id
        ]
        membership_total = sum(item["total"] for item in membership_data)
        
        # Sales income for this center
        sales_data = [
            {
                "revenue": float(row.revenue or 0),
                "transaction_count": row.transaction_count
            }
            for row in sales_income if str(row.center_id) == center_id
        ]
        sales_total = sum(item["revenue"] for item in sales_data)
        
        # Other income for this center
        other_data = [
            {
                "order_type": row.order_type,
                "payment_method": row.payment_method.value if hasattr(row.payment_method, 'value') else row.payment_method,
                "subtotal": float(row.subtotal or 0),
                "tax": float(row.tax or 0),
                "total": float(row.total or 0),
                "transaction_count": row.transaction_count
            }
            for row in other_income if str(row.center_id) == center_id
        ]
        other_total = sum(item["total"] for item in other_data)
        
        # Total income for this center
        total_income = membership_total + sales_total + other_total
        
        income_by_center[center_id] = {
            **center_info,
            "income_breakdown": {
                "membership": {
                    "total": membership_total,
                    "details": membership_data
                },
                "sales": {
                    "total": sales_total,
                    "details": sales_data
                },
                "other": {
                    "total": other_total,
                    "details": other_data
                }
            },
            "total_income": total_income
        }
    
    # ===== GRAND TOTALS =====
    grand_membership = sum(c["income_breakdown"]["membership"]["total"] for c in income_by_center.values())
    grand_sales = sum(c["income_breakdown"]["sales"]["total"] for c in income_by_center.values())
    grand_other = sum(c["income_breakdown"]["other"]["total"] for c in income_by_center.values())
    grand_total_income = grand_membership + grand_sales + grand_other
    
    return {
        "report_type": "consolidated_income",
        "report_period": {
            "start_date": str(start_date_parsed) if start_date_parsed else "all_time",
            "end_date": str(end_date_parsed) if end_date_parsed else "all_time"
        },
        "parent_center_id": admin_center_id,
        "includes_sub_branches": include_sub_branches,
        "total_centers_included": len(center_ids),
        "summary": {
            "total_membership_income": grand_membership,
            "total_sales_revenue": grand_sales,
            "total_other_income": grand_other,
            "grand_total_income": grand_total_income
        },
        "by_center": list(income_by_center.values()),
        "generated_at": datetime.utcnow().isoformat()
    }


# ============================================================================
# API 2: CONSOLIDATED EXPENSE REPORT
# ============================================================================

@router.get("/consolidated-expenses")
async def get_consolidated_expense_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD) or null for all time"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD) or null for all time"),
    include_sub_branches: bool = Query(True, description="Include sub-branches in report"),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    """
    Get consolidated expense report for center and its sub-branches.
    
    Expense sources:
    - Payroll (employee salaries)
    - Stock purchases (inventory)
    - Operating expenses (utilities, rent, maintenance, etc.)
    - Refunds
    """
    from app.payrole.models.models import PayrollRecord
    from app.inventory.models.models import StockTransaction
    
    # Parse date parameters
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    # Get admin's center
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    
    admin_center_id = str(center_admin.center_id)
    
    # Get list of center IDs to include
    center_ids = await get_center_ids_for_admin(admin_center_id, include_sub_branches, db)
    center_details = await get_center_details_map(center_ids, db)
    
    # ===== 1. PAYROLL EXPENSES =====
    payroll_date_conditions = []
    if start_date_parsed and end_date_parsed:
        payroll_date_conditions.append(func.date(PayrollRecord.paid_date).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        payroll_date_conditions.append(func.date(PayrollRecord.paid_date) >= start_date_parsed)
    elif end_date_parsed:
        payroll_date_conditions.append(func.date(PayrollRecord.paid_date) <= end_date_parsed)
    
    payroll_query = select(
        PayrollRecord.center_id,
        PayrollRecord.payment_method,
        func.sum(PayrollRecord.gross_salary).label("gross_salary"),
        func.sum(PayrollRecord.total_deductions).label("deductions"),
        func.sum(PayrollRecord.net_salary).label("net_salary"),
        func.count(PayrollRecord.id).label("employee_count")
    ).where(
        PayrollRecord.center_id.in_(center_ids),
        PayrollRecord.status == 'paid'
    )
    
    if payroll_date_conditions:
        payroll_query = payroll_query.where(and_(*payroll_date_conditions))
    
    payroll_query = payroll_query.group_by(PayrollRecord.center_id, PayrollRecord.payment_method)
    payroll_expenses_result = await db.execute(payroll_query)
    payroll_expenses = payroll_expenses_result.all()
    
    # ===== 2. STOCK PURCHASE EXPENSES =====
    stock_date_conditions = []
    if start_date_parsed and end_date_parsed:
        stock_date_conditions.append(func.date(StockTransaction.created_at).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        stock_date_conditions.append(func.date(StockTransaction.created_at) >= start_date_parsed)
    elif end_date_parsed:
        stock_date_conditions.append(func.date(StockTransaction.created_at) <= end_date_parsed)
    
    stock_query = select(
        StockTransaction.product_id,
        func.sum(StockTransaction.subtotal).label("total_cost"),
        func.sum(StockTransaction.quantity).label("total_quantity"),
        func.count(StockTransaction.id).label("transaction_count")
    ).where(StockTransaction.transaction_type == 'purchase')
    
    if stock_date_conditions:
        stock_query = stock_query.where(and_(*stock_date_conditions))
    
    stock_query = stock_query.group_by(StockTransaction.product_id)
    stock_expenses_result = await db.execute(stock_query)
    stock_expenses_raw = stock_expenses_result.all()
    
    # Map stock expenses to centers through products
    from app.inventory.models.models import Product
    from app.core.models.models import SKU
    
    stock_expenses_by_center = {}
    if stock_expenses_raw:
        product_ids = [row.product_id for row in stock_expenses_raw]
        products_result = await db.execute(
            select(Product.id, SKU.center_id)
            .join(SKU, Product.id == SKU.id)
            .where(Product.id.in_(product_ids))
        )
        product_center_map = {str(row[0]): str(row[1]) for row in products_result.all()}
        
        for row in stock_expenses_raw:
            center_id = product_center_map.get(str(row.product_id))
            if center_id and center_id in center_ids:
                if center_id not in stock_expenses_by_center:
                    stock_expenses_by_center[center_id] = []
                stock_expenses_by_center[center_id].append(row)
    
    # ===== 3. REFUNDS (as expense) =====
    refund_date_conditions = []
    if start_date_parsed and end_date_parsed:
        refund_date_conditions.append(func.date(PaymentOrder.created_at).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        refund_date_conditions.append(func.date(PaymentOrder.created_at) >= start_date_parsed)
    elif end_date_parsed:
        refund_date_conditions.append(func.date(PaymentOrder.created_at) <= end_date_parsed)
    
    refund_query = select(
        PaymentOrder.center_id,
        PaymentOrder.payment_method,
        func.sum(PaymentOrder.total_amount).label("total"),
        func.count(PaymentOrder.payment_order_id).label("refund_count")
    ).where(
        PaymentOrder.center_id.in_(center_ids),
        PaymentOrder.order_type == 'refund'
    )
    
    if refund_date_conditions:
        refund_query = refund_query.where(and_(*refund_date_conditions))
    
    refund_query = refund_query.group_by(PaymentOrder.center_id, PaymentOrder.payment_method)
    refund_expenses_result = await db.execute(refund_query)
    refund_expenses = refund_expenses_result.all()
    
    # ===== 4. OPERATING EXPENSES (from MiscellaneousTransaction) =====
    from app.billing.models.models import MiscellaneousTransaction
    
    operating_date_conditions = []
    if start_date_parsed and end_date_parsed:
        operating_date_conditions.append(func.date(MiscellaneousTransaction.transaction_date).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        operating_date_conditions.append(func.date(MiscellaneousTransaction.transaction_date) >= start_date_parsed)
    elif end_date_parsed:
        operating_date_conditions.append(func.date(MiscellaneousTransaction.transaction_date) <= end_date_parsed)
    
    operating_query = select(
        MiscellaneousTransaction.center_id,
        MiscellaneousTransaction.category,
        func.sum(MiscellaneousTransaction.total_amount).label("total"),
        func.count(MiscellaneousTransaction.id).label("transaction_count")
    ).where(
        MiscellaneousTransaction.center_id.in_(center_ids),
        MiscellaneousTransaction.transaction_type == 'expense',
        MiscellaneousTransaction.payment_status == PaymentOrderStatus.paid
    )
    
    if operating_date_conditions:
        operating_query = operating_query.where(and_(*operating_date_conditions))
    
    operating_query = operating_query.group_by(MiscellaneousTransaction.center_id, MiscellaneousTransaction.category)
    operating_expenses_result = await db.execute(operating_query)
    operating_expenses = operating_expenses_result.all()
    
    # ===== BUILD RESPONSE STRUCTURE =====
    
    expenses_by_center = {}
    
    for center_id in center_ids:
        center_info = center_details.get(center_id, {})
        
        # Payroll expenses for this center
        payroll_data = [
            {
                "payment_method": row.payment_method if isinstance(row.payment_method, str) else str(row.payment_method) if row.payment_method else "unknown",
                "gross_salary": float(row.gross_salary or 0),
                "deductions": float(row.deductions or 0),
                "net_salary": float(row.net_salary or 0),
                "employee_count": row.employee_count
            }
            for row in payroll_expenses if str(row.center_id) == center_id
        ]
        payroll_total = sum(item["net_salary"] for item in payroll_data)
        
        # Stock purchase expenses for this center
        stock_data = [
            {
                "total_cost": float(row.total_cost or 0),
                "total_quantity": int(row.total_quantity or 0),
                "transaction_count": row.transaction_count
            }
            for row in stock_expenses_by_center.get(center_id, [])
        ]
        stock_total = sum(item["total_cost"] for item in stock_data)
        
        # Refund expenses for this center
        refund_data = [
            {
                "payment_method": row.payment_method.value if hasattr(row.payment_method, 'value') else str(row.payment_method) if row.payment_method else "unknown",
                "total": float(row.total or 0),
                "refund_count": row.refund_count
            }
            for row in refund_expenses if str(row.center_id) == center_id
        ]
        refund_total = sum(item["total"] for item in refund_data)
        
        # Operating expenses for this center
        operating_data = [
            {
                "category": row.category,
                "total": float(row.total or 0),
                "transaction_count": row.transaction_count
            }
            for row in operating_expenses if str(row.center_id) == center_id
        ]
        operating_total = sum(item["total"] for item in operating_data)
        
        # Total expenses for this center
        total_expenses = payroll_total + stock_total + refund_total + operating_total
        
        expenses_by_center[center_id] = {
            **center_info,
            "expense_breakdown": {
                "payroll": {
                    "total": payroll_total,
                    "details": payroll_data
                },
                "stock_purchases": {
                    "total": stock_total,
                    "details": stock_data
                },
                "refunds": {
                    "total": refund_total,
                    "details": refund_data
                },
                "operating": {
                    "total": operating_total,
                    "details": operating_data
                }
            },
            "total_expenses": total_expenses
        }
    
    # ===== GRAND TOTALS =====
    grand_payroll = sum(c["expense_breakdown"]["payroll"]["total"] for c in expenses_by_center.values())
    grand_stock = sum(c["expense_breakdown"]["stock_purchases"]["total"] for c in expenses_by_center.values())
    grand_refunds = sum(c["expense_breakdown"]["refunds"]["total"] for c in expenses_by_center.values())
    grand_operating = sum(c["expense_breakdown"]["operating"]["total"] for c in expenses_by_center.values())
    grand_total_expenses = grand_payroll + grand_stock + grand_refunds + grand_operating
    
    return {
        "report_type": "consolidated_expenses",
        "report_period": {
            "start_date": str(start_date_parsed) if start_date_parsed else "all_time",
            "end_date": str(end_date_parsed) if end_date_parsed else "all_time"
        },
        "parent_center_id": admin_center_id,
        "includes_sub_branches": include_sub_branches,
        "total_centers_included": len(center_ids),
        "summary": {
            "total_payroll_expenses": grand_payroll,
            "total_stock_purchases": grand_stock,
            "total_refunds": grand_refunds,
            "total_operating_expenses": grand_operating,
            "grand_total_expenses": grand_total_expenses
        },
        "by_center": list(expenses_by_center.values()),
        "generated_at": datetime.utcnow().isoformat()
    }


# ============================================================================
# API 3: CONSOLIDATED SETTLEMENT REPORT
# ============================================================================

@router.get("/consolidated-settlements")
async def get_consolidated_settlement_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD) or null for all time"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD) or null for all time"),
    include_sub_branches: bool = Query(True, description="Include sub-branches in report"),
    settlement_status: Optional[str] = Query(None, description="Filter by: paid, unpaid, pending, all"),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    """
    Get consolidated settlement report for center and its sub-branches.
    
    Shows payment settlement status:
    - Paid (completed settlements)
    - Unpaid (pending settlements)
    - Pending (processing)
    - By payment method (cash, bank_transfer, upi, card, other)
    """
    
    # Parse date parameters
    start_date_parsed = parse_date_param(start_date)
    end_date_parsed = parse_date_param(end_date)
    
    # Get admin's center
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    
    admin_center_id = str(center_admin.center_id)
    
    # Get list of center IDs to include
    center_ids = await get_center_ids_for_admin(admin_center_id, include_sub_branches, db)
    center_details = await get_center_details_map(center_ids, db)
    
    # Build status filter
    status_filter = []
    if settlement_status and settlement_status != "all":
        try:
            status_filter = [PaymentOrderStatus(settlement_status)]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid settlement_status. Use: paid, unpaid, pending, or all")
    else:
        status_filter = [PaymentOrderStatus.paid, PaymentOrderStatus.unpaid, PaymentOrderStatus.pending]
    
    # Build date filter conditions
    date_conditions = []
    if start_date_parsed and end_date_parsed:
        date_conditions.append(func.date(PaymentOrder.created_at).between(start_date_parsed, end_date_parsed))
    elif start_date_parsed:
        date_conditions.append(func.date(PaymentOrder.created_at) >= start_date_parsed)
    elif end_date_parsed:
        date_conditions.append(func.date(PaymentOrder.created_at) <= end_date_parsed)
    
    # ===== SETTLEMENTS BY STATUS AND PAYMENT METHOD =====
    settlements_query = select(
        PaymentOrder.center_id,
        PaymentOrder.status,
        PaymentOrder.payment_method,
        PaymentOrder.order_type,
        func.sum(PaymentOrder.total_amount).label("total_amount"),
        func.sum(PaymentOrder.subtotal_amount).label("subtotal_amount"),
        func.sum(PaymentOrder.tax_amount).label("tax_amount"),
        func.count(PaymentOrder.payment_order_id).label("transaction_count")
    ).where(
        PaymentOrder.center_id.in_(center_ids),
        PaymentOrder.status.in_(status_filter)
    )
    
    if date_conditions:
        settlements_query = settlements_query.where(and_(*date_conditions))
    
    settlements_query = settlements_query.group_by(
        PaymentOrder.center_id,
        PaymentOrder.status,
        PaymentOrder.payment_method,
        PaymentOrder.order_type
    )
    settlements_result = await db.execute(settlements_query)
    settlements = settlements_result.all()
    
    # ===== BUILD RESPONSE STRUCTURE =====
    
    settlements_by_center = {}
    
    for center_id in center_ids:
        center_info = center_details.get(center_id, {})
        
        # Filter settlements for this center
        center_settlements = [row for row in settlements if str(row.center_id) == center_id]
        
        # Group by status
        paid_settlements = []
        unpaid_settlements = []
        pending_settlements = []
        
        for row in center_settlements:
            settlement_item = {
                "payment_method": row.payment_method.value if hasattr(row.payment_method, 'value') else str(row.payment_method) if row.payment_method else "unknown",
                "order_type": row.order_type,
                "subtotal": float(row.subtotal_amount or 0),
                "tax": float(row.tax_amount or 0),
                "total": float(row.total_amount or 0),
                "transaction_count": row.transaction_count
            }
            
            status = row.status.value if hasattr(row.status, 'value') else str(row.status)
            
            if status == "paid":
                paid_settlements.append(settlement_item)
            elif status == "unpaid":
                unpaid_settlements.append(settlement_item)
            elif status == "pending":
                pending_settlements.append(settlement_item)
        
        # Calculate totals
        paid_total = sum(item["total"] for item in paid_settlements)
        unpaid_total = sum(item["total"] for item in unpaid_settlements)
        pending_total = sum(item["total"] for item in pending_settlements)
        total_amount = paid_total + unpaid_total + pending_total
        
        # Settlement rate calculation
        settlement_rate = (paid_total / total_amount * 100) if total_amount > 0 else 0
        
        # Payment method breakdown (for paid settlements)
        payment_method_breakdown = {}
        for item in paid_settlements:
            method = item["payment_method"]
            if method not in payment_method_breakdown:
                payment_method_breakdown[method] = {
                    "total": 0,
                    "transaction_count": 0
                }
            payment_method_breakdown[method]["total"] += item["total"]
            payment_method_breakdown[method]["transaction_count"] += item["transaction_count"]
        
        settlements_by_center[center_id] = {
            **center_info,
            "settlement_breakdown": {
                "paid": {
                    "total": paid_total,
                    "transaction_count": sum(item["transaction_count"] for item in paid_settlements),
                    "details": paid_settlements,
                    "by_payment_method": payment_method_breakdown
                },
                "unpaid": {
                    "total": unpaid_total,
                    "transaction_count": sum(item["transaction_count"] for item in unpaid_settlements),
                    "details": unpaid_settlements
                },
                "pending": {
                    "total": pending_total,
                    "transaction_count": sum(item["transaction_count"] for item in pending_settlements),
                    "details": pending_settlements
                }
            },
            "total_amount": total_amount,
            "settlement_rate": round(settlement_rate, 2),
            "outstanding_amount": unpaid_total + pending_total
        }
    
    # ===== GRAND TOTALS =====
    grand_paid = sum(c["settlement_breakdown"]["paid"]["total"] for c in settlements_by_center.values())
    grand_unpaid = sum(c["settlement_breakdown"]["unpaid"]["total"] for c in settlements_by_center.values())
    grand_pending = sum(c["settlement_breakdown"]["pending"]["total"] for c in settlements_by_center.values())
    grand_total = grand_paid + grand_unpaid + grand_pending
    grand_settlement_rate = (grand_paid / grand_total * 100) if grand_total > 0 else 0
    grand_outstanding = grand_unpaid + grand_pending
    
    # Grand payment method breakdown
    grand_payment_methods = {}
    for center_data in settlements_by_center.values():
        for method, data in center_data["settlement_breakdown"]["paid"]["by_payment_method"].items():
            if method not in grand_payment_methods:
                grand_payment_methods[method] = {"total": 0, "transaction_count": 0}
            grand_payment_methods[method]["total"] += data["total"]
            grand_payment_methods[method]["transaction_count"] += data["transaction_count"]
    
    return {
        "report_type": "consolidated_settlements",
        "report_period": {
            "start_date": str(start_date_parsed) if start_date_parsed else "all_time",
            "end_date": str(end_date_parsed) if end_date_parsed else "all_time"
        },
        "parent_center_id": admin_center_id,
        "includes_sub_branches": include_sub_branches,
        "total_centers_included": len(center_ids),
        "summary": {
            "total_paid_settlements": grand_paid,
            "total_unpaid_settlements": grand_unpaid,
            "total_pending_settlements": grand_pending,
            "grand_total_amount": grand_total,
            "settlement_rate": round(grand_settlement_rate, 2),
            "outstanding_amount": grand_outstanding,
            "payment_method_breakdown": grand_payment_methods
        },
        "by_center": list(settlements_by_center.values()),
        "generated_at": datetime.utcnow().isoformat()
    }