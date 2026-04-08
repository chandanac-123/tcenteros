from unittest import result
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
from app.accounts.models.models import JournalEntry
from fastapi.responses import StreamingResponse
import io
from app.report.utils.reports import ConsolidatedReportGenerator 

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


async def get_all_center_ids_async(center_id, db) -> List:
    ids = [center_id]
    queue = [center_id]

    while queue:
        current_id = queue.pop(0)

        result = await db.execute(
            select(Center.id).where(Center.parent_center_id == current_id)
        )
        children = result.scalars().all()

        for child_id in children:
            if child_id not in ids:
                ids.append(child_id)
                queue.append(child_id)

    return ids

async def normalize_date(date_str: Optional[str]):
    if not date_str or str(date_str).lower() == "null":
        return None

    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        raise ValueError(f"Invalid date format: {date_str}. Expected YYYY-MM-DD")


# ============================================================================
# API 1: CONSOLIDATED INCOME REPORT
# ============================================================================

from sqlalchemy import select, literal
from fastapi import HTTPException, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/consolidated-income")
async def get_consolidated_income(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_sub_branches: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    try:
        start_date = await normalize_date(start_date)
        end_date = await normalize_date(end_date)

        center_id = current_user.get("center_id")

        if not center_id:
            raise HTTPException(status_code=400, detail="Center ID missing")

        center_ids = await get_all_center_ids_async(center_id, db) if include_sub_branches else [center_id]

        offset = (page - 1) * page_size

        # ==============================
        # MEMBERSHIP QUERY
        # ==============================
        membership_query = select(
            MemberMembership.center_id,
            Center.center_name,
            MemberMembership.total_amount.label("amount"),
            MemberMembership.created_at.label("date"),
            literal("membership").label("type")
        ).join(
            Center, Center.id == MemberMembership.center_id
        ).where(
            MemberMembership.center_id.in_(center_ids)
        )

        if start_date:
            membership_query = membership_query.where(MemberMembership.created_at >= start_date)
        if end_date:
            membership_query = membership_query.where(MemberMembership.created_at <= end_date)

        membership_result = await db.execute(membership_query)
        membership_data = membership_result.all()

        # ==============================
        # PAYMENT ORDER QUERY
        # ==============================
        payment_query = select(
            PaymentOrder.center_id,
            Center.center_name,
            PaymentOrder.total_amount.label("amount"),
            PaymentOrder.created_at.label("date"),
            PaymentOrder.order_type
        ).join(
            Center, Center.id == PaymentOrder.center_id
        ).where(
            PaymentOrder.center_id.in_(center_ids)
        )

        if start_date:
            payment_query = payment_query.where(PaymentOrder.created_at >= start_date)
        if end_date:
            payment_query = payment_query.where(PaymentOrder.created_at <= end_date)

        payment_result = await db.execute(payment_query)
        payment_data = payment_result.all()

        # ==============================
        # MERGE DATA
        # ==============================
        combined = []

        # Membership
        for m in membership_data:
            combined.append({
                "type": m.type,
                "amount": float(m.amount or 0),
                "center_id": str(m.center_id),
                "center_name": m.center_name,
                "date": m.date
            })

        # Payment Orders
        for p in payment_data:
            order_type = p.order_type.value

            # ❌ REMOVED network_in

            if order_type == "inventory_sale":
                category = "inventory_sale"
            elif order_type == "other_charges":
                category = "other_income"
            else:
                continue

            combined.append({
                "type": category,
                "amount": float(p.amount or 0),
                "center_id": str(p.center_id),
                "center_name": p.center_name,
                "date": p.date
            })

        # ==============================
        # SORT
        # ==============================
        combined.sort(key=lambda x: x["date"], reverse=True)

        total_count = len(combined)

        # ==============================
        # PAGINATION
        # ==============================
        paginated_data = combined[offset: offset + page_size]

        # ==============================
        # SUMMARY
        # ==============================
        total_income = sum(item["amount"] for item in combined)

        scenario_summary = {
            "membership": 0,
            "inventory_sale": 0,
            "other_income": 0
        }

        for item in combined:
            scenario_summary[item["type"]] += item["amount"]

        return {
            "total_income": total_income,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "scenario_summary": scenario_summary,
            "data": paginated_data
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    





# ============================================================================
# API 2: CONSOLIDATED EXPENSE REPORT
# ============================================================================

from app.billing.models.models import MiscellaneousTransaction

from sqlalchemy import select
from fastapi import HTTPException, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/consolidated-expense")
async def get_consolidated_expense(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_sub_branches: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    try:
        start_date = await normalize_date(start_date)
        end_date = await normalize_date(end_date)

        center_id = current_user.get("center_id")

        if not center_id:
            raise HTTPException(status_code=400, detail="Center ID missing")

        center_ids = await get_all_center_ids_async(center_id, db) if include_sub_branches else [center_id]

        offset = (page - 1) * page_size

        # ==============================
        # PAYMENT ORDER QUERY
        # ==============================
        payment_query = select(
            PaymentOrder.center_id,
            Center.center_name,
            PaymentOrder.total_amount.label("amount"),
            PaymentOrder.created_at.label("date"),
            PaymentOrder.order_type
        ).join(
            Center, Center.id == PaymentOrder.center_id
        ).where(
            PaymentOrder.center_id.in_(center_ids)
        )

        if start_date:
            payment_query = payment_query.where(PaymentOrder.created_at >= start_date)
        if end_date:
            payment_query = payment_query.where(PaymentOrder.created_at <= end_date)

        payment_result = await db.execute(payment_query)
        payments = payment_result.all()

        # ==============================
        # MISC TRANSACTIONS QUERY
        # ==============================
        misc_query = select(
            MiscellaneousTransaction.center_id,
            Center.center_name,
            MiscellaneousTransaction.amount,
            MiscellaneousTransaction.created_at.label("date"),
            MiscellaneousTransaction.category
        ).join(
            Center, Center.id == MiscellaneousTransaction.center_id
        ).where(
            MiscellaneousTransaction.center_id.in_(center_ids)
        )

        if start_date:
            misc_query = misc_query.where(MiscellaneousTransaction.created_at >= start_date)
        if end_date:
            misc_query = misc_query.where(MiscellaneousTransaction.created_at <= end_date)

        misc_result = await db.execute(misc_query)
        misc_data = misc_result.all()

        # ==============================
        # MERGE DATA
        # ==============================
        combined = []

        # Payment Orders
        for p in payments:
            amount = float(p.amount or 0)
            order_type = p.order_type.value

            if order_type == "branch_purchase":
                category = "branch_purchase"

            # ❌ REMOVED network_out

            else:
                continue

            combined.append({
                "type": category,
                "amount": amount,
                "center_id": str(p.center_id),
                "center_name": p.center_name,
                "date": p.date
            })

        # Misc Transactions
        for m in misc_data:
            amount = float(m.amount or 0)
            category = m.category

            if category == "inventory_purchase":
                type_ = "inventory_purchase"
            elif category == "salary_payroll":
                type_ = "salary"
            elif category == "other_expense":
                type_ = "other_expense"
            else:
                continue

            combined.append({
                "type": type_,
                "amount": amount,
                "center_id": str(m.center_id),
                "center_name": m.center_name,
                "date": m.date
            })

        # ==============================
        # SORT
        # ==============================
        combined.sort(key=lambda x: x["date"], reverse=True)

        total_count = len(combined)

        # ==============================
        # PAGINATION
        # ==============================
        paginated_data = combined[offset: offset + page_size]

        # ==============================
        # SUMMARY
        # ==============================
        total_expense = sum(item["amount"] for item in combined)

        scenario_summary = {
            "branch_purchase": 0,
            "inventory_purchase": 0,
            "salary": 0,
            "other_expense": 0
        }

        for item in combined:
            scenario_summary[item["type"]] += item["amount"]

        return {
            "total_expense": total_expense,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "scenario_summary": scenario_summary,
            "data": paginated_data
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# API 3: CONSOLIDATED SETTLEMENT REPORT
# ============================================================================

from sqlalchemy import select
from fastapi import HTTPException, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/consolidated-settlement")
async def get_consolidated_settlement(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_sub_branches: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    try:
        start_date = await normalize_date(start_date)
        end_date = await normalize_date(end_date)

        center_id = current_user.get("center_id")

        if not center_id:
            raise HTTPException(status_code=400, detail="Center ID missing")

        center_ids = await get_all_center_ids_async(center_id, db) if include_sub_branches else [center_id]

        offset = (page - 1) * page_size

        # ==============================
        # PAYMENT ORDERS
        # ==============================
        payment_query = select(
            PaymentOrder.center_id,
            PaymentOrder.total_amount.label("amount"),
            PaymentOrder.created_at.label("date"),
            PaymentOrder.order_type
        ).where(
            PaymentOrder.center_id.in_(center_ids)
        )

        if start_date:
            payment_query = payment_query.where(PaymentOrder.created_at >= start_date)
        if end_date:
            payment_query = payment_query.where(PaymentOrder.created_at <= end_date)

        payment_result = await db.execute(payment_query)
        payments = payment_result.all()

        # ==============================
        # MISC TRANSACTIONS
        # ==============================
        misc_query = select(
            MiscellaneousTransaction.center_id,
            MiscellaneousTransaction.amount,
            MiscellaneousTransaction.created_at.label("date"),
            MiscellaneousTransaction.category
        ).where(
            MiscellaneousTransaction.center_id.in_(center_ids)
        )

        if start_date:
            misc_query = misc_query.where(MiscellaneousTransaction.created_at >= start_date)
        if end_date:
            misc_query = misc_query.where(MiscellaneousTransaction.created_at <= end_date)

        misc_result = await db.execute(misc_query)
        misc_data = misc_result.all()

        # ==============================
        # PROCESS DATA
        # ==============================
        combined = []
        total_incoming = 0
        total_outgoing = 0

        scenario_summary = {}

        # ---------------- PAYMENT ORDERS ----------------
        for p in payments:
            amount = float(p.amount or 0)
            order_type = p.order_type.value

            # 🔴 BRANCH PURCHASE
            if order_type == "branch_purchase":
                total_outgoing += amount

                scenario_summary.setdefault("branch_purchase", {"incoming": 0, "outgoing": 0})
                scenario_summary["branch_purchase"]["outgoing"] += amount

                combined.append({
                    "scenario": "Purchase branch from platform",
                    "type": "outgoing",
                    "amount": amount,
                    "center_id": str(p.center_id),
                    "date": p.date
                })

            # 🟡 NETWORK IN
            elif order_type == "network_in":
                total_incoming += amount

                scenario_summary.setdefault("networking_in", {"incoming": 0, "outgoing": 0})
                scenario_summary["networking_in"]["incoming"] += amount

                combined.append({
                    "scenario": "Networking In (Receive from home center)",
                    "type": "incoming",
                    "amount": amount,
                    "center_id": str(p.center_id),
                    "date": p.date
                })

                # 🔴 PLATFORM SHARE (10%)
                platform_share = amount * 0.1
                total_outgoing += platform_share
                scenario_summary["networking_in"]["outgoing"] += platform_share

                combined.append({
                    "scenario": "Networking In - Platform Share",
                    "type": "outgoing",
                    "amount": platform_share,
                    "center_id": str(p.center_id),
                    "date": p.date
                })

            # 🔴 NETWORK OUT
            elif order_type == "network_out":
                total_outgoing += amount

                scenario_summary.setdefault("networking_out", {"incoming": 0, "outgoing": 0})
                scenario_summary["networking_out"]["outgoing"] += amount

                combined.append({
                    "scenario": "Networking Out (Pay networking center)",
                    "type": "outgoing",
                    "amount": amount,
                    "center_id": str(p.center_id),
                    "date": p.date
                })

            # 🔴 OTHER CHARGES
            elif order_type == "other_charges":
                total_outgoing += amount

                scenario_summary.setdefault("other_charges", {"incoming": 0, "outgoing": 0})
                scenario_summary["other_charges"]["outgoing"] += amount

                combined.append({
                    "scenario": "Other Charges (Pay vendors/services)",
                    "type": "outgoing",
                    "amount": amount,
                    "center_id": str(p.center_id),
                    "date": p.date
                })

        # ---------------- MISC TRANSACTIONS ----------------
        for m in misc_data:
            amount = float(m.amount or 0)

            if m.category == "inventory_purchase":
                total_outgoing += amount

                scenario_summary.setdefault("inventory_purchase", {"incoming": 0, "outgoing": 0})
                scenario_summary["inventory_purchase"]["outgoing"] += amount

                combined.append({
                    "scenario": "Inventory Purchase (Pay supplier)",
                    "type": "outgoing",
                    "amount": amount,
                    "center_id": str(m.center_id),
                    "date": m.date
                })

            elif m.category == "salary_payroll":
                total_outgoing += amount

                scenario_summary.setdefault("salary_payroll", {"incoming": 0, "outgoing": 0})
                scenario_summary["salary_payroll"]["outgoing"] += amount

                combined.append({
                    "scenario": "Salary Payroll (Pay employees)",
                    "type": "outgoing",
                    "amount": amount,
                    "center_id": str(m.center_id),
                    "date": m.date
                })

        # ==============================
        # SORT + PAGINATION
        # ==============================
        combined.sort(key=lambda x: x["date"], reverse=True)

        total_count = len(combined)
        paginated_data = combined[offset: offset + page_size]

        return {
            "total_incoming": total_incoming,
            "total_outgoing": total_outgoing,
            "net_settlement": total_incoming - total_outgoing,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "scenario_summary": scenario_summary,
            "data": paginated_data
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))



# ============================================================================
# CONSOLIDATED INCOME REPORT - PDF/CSV GENERATION
# ============================================================================

@router.post("/reports/generate/consolidated-income")
async def generate_consolidated_income_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_sub_branches: bool = Query(True),
    format: str = Query("pdf"),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    try:
        # ---------------- DATE PARSE ----------------
        start_date_parsed = parse_date_param(start_date)
        end_date_parsed = parse_date_param(end_date)

        center_id = current_user.get("center_id")
        if not center_id:
            raise HTTPException(status_code=400, detail="Center ID missing")

        center_ids = await get_all_center_ids_async(center_id, db) if include_sub_branches else [center_id]

        # ---------------- GET CENTER NAME ----------------
        center = await db.get(Center, center_id)
        center_name = center.center_name if center else "Center"

        report_data = []

        # ================= MEMBERSHIP =================
        q = select(
            MemberMembership.center_id,
            Center.center_name,
            MemberMembership.total_amount,
            MemberMembership.created_at
        ).join(Center, Center.id == MemberMembership.center_id).where(
            MemberMembership.center_id.in_(center_ids)
        )

        if start_date_parsed:
            q = q.where(MemberMembership.created_at >= start_date_parsed)
        if end_date_parsed:
            q = q.where(MemberMembership.created_at <= end_date_parsed)

        res = await db.execute(q)
        memberships = res.all()

        for m in memberships:
            report_data.append({
                "Date": str(m.created_at.date()),
                "Center": m.center_name,
                "Category": "membership",
                "Type": "membership",
                "Total": float(m.total_amount or 0),
                "Transactions": 1,
                "Tax": 0
            })

        # ================= PAYMENT ORDERS =================
        q = select(
            PaymentOrder.center_id,
            Center.center_name,
            PaymentOrder.total_amount,
            PaymentOrder.order_type,
            PaymentOrder.created_at
        ).join(Center, Center.id == PaymentOrder.center_id).where(
            PaymentOrder.center_id.in_(center_ids)
        )

        if start_date_parsed:
            q = q.where(PaymentOrder.created_at >= start_date_parsed)
        if end_date_parsed:
            q = q.where(PaymentOrder.created_at <= end_date_parsed)

        res = await db.execute(q)
        payments = res.all()

        for p in payments:
            amount = float(p.total_amount or 0)
            order_type = p.order_type.value

            if order_type == "network_in":
                category = "networking_in"
            elif order_type == "inventory_sale":
                category = "inventory_sale"
            elif order_type == "other_charges":
                category = "other_income"
            else:
                continue

            report_data.append({
                "Date": str(p.created_at.date()),
                "Center": p.center_name,
                "Category": category,
                "Type": order_type,
                "Total": amount,
                "Transactions": 1,
                "Tax": 0
            })

        # ================= GENERATE FILE =================
        if format.lower() == "pdf":
            file_bytes = ConsolidatedReportGenerator.generate_income_pdf(
                report_data,
                center_name,
                str(start_date_parsed) if start_date_parsed else "All Time",
                str(end_date_parsed) if end_date_parsed else "All Time",
                include_sub_branches
            )
            media_type = "application/pdf"
            filename = "income_report.pdf"

        elif format.lower() == "csv":
            file_bytes = ConsolidatedReportGenerator.generate_income_csv(report_data)
            media_type = "text/csv"
            filename = "income_report.csv"

        else:
            raise HTTPException(status_code=400, detail="Invalid format")

        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CONSOLIDATED EXPENSE REPORT - PDF/CSV GENERATION
# ============================================================================

@router.post("/reports/generate/consolidated-expenses")
async def generate_consolidated_expense_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_sub_branches: bool = Query(True),
    format: str = Query("pdf"),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    try:
        start_date_parsed = parse_date_param(start_date)
        end_date_parsed = parse_date_param(end_date)

        center_id = current_user.get("center_id")
        if not center_id:
            raise HTTPException(status_code=400, detail="Center ID missing")

        center_ids = await get_all_center_ids_async(center_id, db) if include_sub_branches else [center_id]

        # center name
        center = await db.get(Center, center_id)
        center_name = center.center_name if center else "Center"

        report_data = []

        # ================= PAYMENT ORDERS =================
        q = select(
            PaymentOrder.center_id,
            Center.center_name,
            PaymentOrder.total_amount,
            PaymentOrder.order_type,
            PaymentOrder.created_at
        ).join(Center, Center.id == PaymentOrder.center_id).where(
            PaymentOrder.center_id.in_(center_ids)
        )

        if start_date_parsed:
            q = q.where(PaymentOrder.created_at >= start_date_parsed)
        if end_date_parsed:
            q = q.where(PaymentOrder.created_at <= end_date_parsed)

        res = await db.execute(q)
        payments = res.all()

        for p in payments:
            amount = float(p.total_amount or 0)
            order_type = p.order_type.value

            if order_type == "branch_purchase":
                category = "branch_purchase"
            elif order_type == "network_out":
                category = "networking_out"
            else:
                continue

            report_data.append({
                "Date": str(p.created_at.date()),
                "Center": p.center_name,
                "Category": category,
                "Gross Amount": amount,
                "Deductions": 0,
                "Net Amount": amount,
                "Count": 1
            })

        # ================= MISC EXPENSE =================
        q = select(
            MiscellaneousTransaction.center_id,
            Center.center_name,
            MiscellaneousTransaction.total_amount,
            MiscellaneousTransaction.category,
            MiscellaneousTransaction.transaction_date
        ).join(Center, Center.id == MiscellaneousTransaction.center_id).where(
            MiscellaneousTransaction.center_id.in_(center_ids),
            MiscellaneousTransaction.transaction_type == "expense"
        )

        if start_date_parsed:
            q = q.where(MiscellaneousTransaction.transaction_date >= start_date_parsed)
        if end_date_parsed:
            q = q.where(MiscellaneousTransaction.transaction_date <= end_date_parsed)

        res = await db.execute(q)
        misc = res.all()

        for m in misc:
            report_data.append({
                "Date": str(m.transaction_date),
                "Center": m.center_name,
                "Category": m.category,
                "Gross Amount": float(m.total_amount or 0),
                "Deductions": 0,
                "Net Amount": float(m.total_amount or 0),
                "Count": 1
            })

        # ================= GENERATE FILE =================
        if format.lower() == "pdf":
            file_bytes = ConsolidatedReportGenerator.generate_expense_pdf(
                report_data,
                center_name,
                str(start_date_parsed) if start_date_parsed else "All Time",
                str(end_date_parsed) if end_date_parsed else "All Time",
                include_sub_branches
            )
            media_type = "application/pdf"
            filename = "expense_report.pdf"

        elif format.lower() == "csv":
            file_bytes = ConsolidatedReportGenerator.generate_expense_csv(report_data)
            media_type = "text/csv"
            filename = "expense_report.csv"

        else:
            raise HTTPException(status_code=400, detail="Invalid format")

        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CONSOLIDATED SETTLEMENT REPORT - PDF/CSV GENERATION
# ============================================================================

@router.post("/reports/generate/consolidated-settlements")
async def generate_consolidated_settlement_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    include_sub_branches: bool = Query(True),
    format: str = Query("pdf"),
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(centeradmin_required)
):
    try:
        start_date_parsed = parse_date_param(start_date)
        end_date_parsed = parse_date_param(end_date)

        center_id = current_user.get("center_id")
        center_ids = await get_all_center_ids_async(center_id, db)

        center = await db.get(Center, center_id)
        center_name = center.center_name if center else "Center"

        report_data = []

        q = select(
            PaymentOrder.center_id,
            Center.center_name,
            PaymentOrder.total_amount,
            PaymentOrder.order_type,
            PaymentOrder.created_at
        ).join(Center, Center.id == PaymentOrder.center_id).where(
            PaymentOrder.center_id.in_(center_ids)
        )

        if start_date_parsed:
            q = q.where(PaymentOrder.created_at >= start_date_parsed)
        if end_date_parsed:
            q = q.where(PaymentOrder.created_at <= end_date_parsed)

        res = await db.execute(q)
        payments = res.all()

        for p in payments:
            amount = float(p.total_amount or 0)
            order_type = p.order_type.value

            # ---------------- NETWORK IN ----------------
            if order_type == "network_in":
                platform = amount * 0.1
                center_share = amount * 0.9

                report_data.append({
                    "Date": str(p.created_at.date()),
                    "Center": p.center_name,
                    "Order Type": "networking_in",
                    "Total Amount": amount,
                    "Platform Commission (10%)": platform,
                    "Center Share (90%)": center_share,
                    "Settlement Status": "incoming"
                })

            # ---------------- OUTGOING ----------------
            elif order_type in ["network_out", "branch_purchase", "other_charges"]:
                report_data.append({
                    "Date": str(p.created_at.date()),
                    "Center": p.center_name,
                    "Order Type": order_type,
                    "Total Amount": amount,
                    "Platform Commission (10%)": 0,
                    "Center Share (90%)": amount,
                    "Settlement Status": "outgoing"
                })

        # ================= GENERATE FILE =================
        if format.lower() == "pdf":
            file_bytes = ConsolidatedReportGenerator.generate_settlement_pdf(
                report_data,
                center_name,
                str(start_date_parsed) if start_date_parsed else "All Time",
                str(end_date_parsed) if end_date_parsed else "All Time",
                include_sub_branches
            )
            media_type = "application/pdf"
            filename = "settlement_report.pdf"

        elif format.lower() == "csv":
            file_bytes = ConsolidatedReportGenerator.generate_settlement_csv(report_data)
            media_type = "text/csv"
            filename = "settlement_report.csv"

        else:
            raise HTTPException(status_code=400, detail="Invalid format")

        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))