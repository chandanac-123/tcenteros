# app/center/api/routes.py
import email
from sqlite3 import IntegrityError
from fastapi import APIRouter, Body, HTTPException, Depends, Query, Path, UploadFile, File, Form
from typing import List, Optional, Set
import uuid
import json
import traceback
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.membership.models.models import Membership
from app.center.models.models import CenterOnboardingTemp, Center, CenterTimeSlot, CenterWallet, WalletTransaction, CenterGalleryImage, CenterStatus, ApprovalStatus
from app.settings.models.models import CenterCategory,Designation, Address, TaxCategory, CenterOperationalSetting
from app.platforms.models.models import PlatformFeature, CenterFeatureSubscription, PlatformWallet
from app.billing.models.models import PaymentOrder
from app.auth.models.models import CenterAdmin, Member, User, Employee
from app.core.models.models import StatusEnum, SuperadminInfo
from app.center.schema.schema import *
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_async_session
from uuid import uuid4
from app.core.dependencies import centeradmin_required, get_db, get_current_user, member_required
from app.core.security import get_password_hash
from app.s3.service import upload_file, get_file_url
from fastapi.concurrency import run_in_threadpool
from math import radians, cos, sin, asin, sqrt
from sqlalchemy import or_, and_, func
import sqlalchemy as sa


router = APIRouter()


def haversine(lat1, lon1, lat2, lon2):
    # Calculate the great circle distance between two points on the earth (in km)
    # All args must be float
    lon1, lat1, lon2, lat2 = map(float, [lon1, lat1, lon2, lat2])
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km

def calculate_subscription_price(yearly_base: float, duration: str) -> dict:
    """
    Calculate pricing based on subscription duration.
    Monthly: (yearly/12) * 1.25
    Yearly: base price
    
    Returns dict with: base_price, pricing_type, yearly_equivalent, monthly_equivalent, note
    """
    if duration == "monthly":
        monthly_price = (yearly_base / 12) * 1.25
        yearly_equivalent = monthly_price * 12
        savings = yearly_base - yearly_equivalent
        savings_percent = (savings / yearly_equivalent) * 100
        return {
            "base_price": monthly_price,
            "pricing_type": "monthly",
            "yearly_equivalent": yearly_equivalent,
            "monthly_equivalent": monthly_price,
            "note": f"Monthly: ₹{monthly_price:.2f}/month (₹{yearly_equivalent:.2f} for 12 months). Save ₹{abs(savings):.2f} ({savings_percent:.0f}%) with yearly plan!"
        }
    else:
        monthly_equiv = yearly_base / 12
        monthly_plan_yearly_cost = (monthly_equiv * 1.25) * 12
        savings = monthly_plan_yearly_cost - yearly_base
        savings_percent = (savings / monthly_plan_yearly_cost) * 100
        return {
            "base_price": yearly_base,
            "pricing_type": "yearly",
            "yearly_equivalent": yearly_base,
            "monthly_equivalent": monthly_equiv,
            "note": f"Yearly: ₹{yearly_base:.2f} (₹{monthly_equiv:.2f}/month equivalent). You're saving ₹{savings:.2f} ({savings_percent:.0f}%) compared to monthly billing!"
        }


@router.get("/center/dashboard", summary="Get Center Dashboard Data")
async def get_center_dashboard(
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    from app.auth.models.models import CenterAdmin, Employee, Member
    from app.membership.models.models import MemberMembership
    from app.attendance.models.models import Attendance, AttendanceStatus
    from app.billing.models.models import (
        PaymentOrder, PaymentOrderStatus, OrderType, MiscellaneousTransaction
    )
    from app.payrole.models.models import PayrollRecord
    from app.inventory.models.models import Sale, StockTransaction, Product
    from datetime import date as date_type
    from sqlalchemy import cast, Text, extract
    from calendar import monthrange
    from decimal import Decimal
    from datetime import datetime

    # ========================
    # GET CENTER
    # ========================
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    center_id = center_admin.center_id
    today = date_type.today()
    current_year = today.year

    # ========================
    # BASIC COUNTS
    # ========================
    total_employees = (await db.execute(
        select(func.count(Employee.id)).where(
            Employee.center_id == center_id,
            Employee.status == "active"
        )
    )).scalar() or 0

    total_members = (await db.execute(
        select(func.count(Member.id)).where(
            Member.home_center_id == center_id,
            Member.status == "active",
            cast(Member.member_status, Text) == "member"
        )
    )).scalar() or 0

    active_memberships = (await db.execute(
        select(func.count(MemberMembership.id)).where(
            MemberMembership.center_id == center_id,
            cast(MemberMembership.membership_status, Text) == "active"
        )
    )).scalar() or 0

    total_guests = (await db.execute(
        select(func.count(Member.id)).where(
            Member.home_center_id == center_id,
            cast(Member.member_status, Text) == "guest"
        )
    )).scalar() or 0

    today_attendance = (await db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.center_id == center_id,
            func.date(Attendance.check_in_time) == today
        )
    )).scalar() or 0

    # ========================
    # TOTAL REVENUE
    # ========================
    payment_revenue = (await db.execute(
        select(func.coalesce(func.sum(PaymentOrder.total_amount), 0)).where(
            PaymentOrder.center_id == center_id,
            PaymentOrder.status == PaymentOrderStatus.paid,
            PaymentOrder.order_type.in_([
                OrderType.membership,
                OrderType.membership_renewal,
                OrderType.membership_upgrade,
                OrderType.network_in
            ])
        )
    )).scalar() or Decimal("0")

    sales_revenue = (await db.execute(
        select(func.coalesce(func.sum(Sale.total_amount), 0)).where(
            Sale.center_id == center_id,
            Sale.status == "completed"
        )
    )).scalar() or Decimal("0")

    other_income = (await db.execute(
        select(func.coalesce(func.sum(MiscellaneousTransaction.total_amount), 0)).where(
            MiscellaneousTransaction.center_id == center_id,
            MiscellaneousTransaction.transaction_type == "income"
        )
    )).scalar() or Decimal("0")

    total_revenue = float(payment_revenue + sales_revenue + other_income)

    # ========================
    # TOTAL EXPENSES
    # ========================
    payroll = (await db.execute(
        select(func.coalesce(func.sum(PayrollRecord.net_salary), 0)).where(
            PayrollRecord.center_id == center_id,
            PayrollRecord.status == "paid"
        )
    )).scalar() or 0

    payment_expense = (await db.execute(
        select(func.coalesce(func.sum(PaymentOrder.total_amount), 0)).where(
            PaymentOrder.center_id == center_id,
            PaymentOrder.status == PaymentOrderStatus.paid,
            PaymentOrder.order_type.in_([
                OrderType.network_out,
                OrderType.branch_purchase
            ])
        )
    )).scalar() or 0

    inventory_expense = (await db.execute(
        select(func.coalesce(func.sum(StockTransaction.subtotal), 0))
        .join(Product, Product.id == StockTransaction.product_id)
        .where(
            Product.center_id == center_id,
            StockTransaction.transaction_type == "purchase"
        )
    )).scalar() or 0

    other_expense = (await db.execute(
        select(func.coalesce(func.sum(MiscellaneousTransaction.total_amount), 0)).where(
            MiscellaneousTransaction.center_id == center_id,
            MiscellaneousTransaction.transaction_type == "expense"
        )
    )).scalar() or 0

    total_expenses = float(payroll + payment_expense + inventory_expense + other_expense)

    net_profit = total_revenue - total_expenses

    # ========================
    # REVENUE TREND CHART
    # ========================
    monthly_income = {}
    monthly_expense = {}

    month_expr_po = extract('month', PaymentOrder.created_at)

    # Income (PaymentOrder)
    res = await db.execute(
        select(
            extract('month', PaymentOrder.created_at),
            func.sum(PaymentOrder.total_amount)
        ).where(
            PaymentOrder.center_id == center_id,
            PaymentOrder.status == PaymentOrderStatus.paid,
            PaymentOrder.order_type.in_([
                OrderType.membership,
                OrderType.membership_renewal,
                OrderType.membership_upgrade,
                OrderType.network_in
            ]),
            extract('year', PaymentOrder.created_at) == current_year
        ).group_by(month_expr_po)
    )
    for m, v in res:
        monthly_income[int(m)] = float(v)

    # Inventory sales
    month_expr_sale = extract('month', Sale.created_at) 

    res = await db.execute(
        select(
            extract('month', Sale.created_at),
            func.sum(Sale.total_amount)
        ).where(
            Sale.center_id == center_id,
            Sale.status == "completed",
            extract('year', Sale.created_at) == current_year
        ).group_by(month_expr_sale)
    )
    for m, v in res:
        monthly_income[int(m)] = monthly_income.get(int(m), 0) + float(v)

    # Other income
    month_expr_misc_income = extract('month', MiscellaneousTransaction.transaction_date)    
    res = await db.execute(
        select(
            extract('month', MiscellaneousTransaction.transaction_date),
            func.sum(MiscellaneousTransaction.total_amount)
        ).where(
            MiscellaneousTransaction.center_id == center_id,
            MiscellaneousTransaction.transaction_type == "income",
            extract('year', MiscellaneousTransaction.transaction_date) == current_year
        ).group_by(month_expr_misc_income)
    )

    for m, v in res:
        monthly_income[int(m)] = monthly_income.get(int(m), 0) + float(v)

    # Expenses (PaymentOrder)
    res = await db.execute(
        select(
            extract('month', PaymentOrder.created_at),
            func.sum(PaymentOrder.total_amount)
        ).where(
            PaymentOrder.center_id == center_id,
            PaymentOrder.order_type.in_([
                OrderType.network_out,
                OrderType.branch_purchase
            ]),
            extract('year', PaymentOrder.created_at) == current_year
        ).group_by(month_expr_po)
    )
    for m, v in res:
        monthly_expense[int(m)] = float(v)

    # Payroll
    payroll_month_expr = extract('month', PayrollRecord.created_at)
    res = await db.execute(
        select(
            extract('month', PayrollRecord.created_at),
            func.sum(PayrollRecord.net_salary)
        ).where(
            PayrollRecord.center_id == center_id,
            PayrollRecord.status == "paid",
            extract('year', PayrollRecord.created_at) == current_year
        ).group_by(payroll_month_expr)
    )
    for m, v in res:
        monthly_expense[int(m)] = monthly_expense.get(int(m), 0) + float(v)

    # Inventory purchase
    month_expr_stock = extract('month', StockTransaction.created_at)
    res = await db.execute(
        select(
            extract('month', StockTransaction.created_at),
            func.sum(StockTransaction.subtotal)
        ).join(Product).where(
            Product.center_id == center_id,
            StockTransaction.transaction_type == "purchase",
            extract('year', StockTransaction.created_at) == current_year
        ).group_by(month_expr_stock)
    )
    for m, v in res:
        monthly_expense[int(m)] = monthly_expense.get(int(m), 0) + float(v)

    # Other expense
    month_expr_misc_expense = extract('month', MiscellaneousTransaction.transaction_date)
    res = await db.execute(
        select(
            extract('month', MiscellaneousTransaction.transaction_date),
            func.sum(MiscellaneousTransaction.total_amount)
        ).where(
            MiscellaneousTransaction.center_id == center_id,
            MiscellaneousTransaction.transaction_type == "expense",
            extract('year', MiscellaneousTransaction.transaction_date) == current_year
        ).group_by(month_expr_misc_expense)
    )
    for m, v in res:
        monthly_expense[int(m)] = monthly_expense.get(int(m), 0) + float(v)

    # Final chart
    month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    revenue_trend = []
    for i in range(1, 13):
        revenue_trend.append({
            "month": month_names[i-1],
            "income": round(monthly_income.get(i, 0), 2),
            "expense": round(monthly_expense.get(i, 0), 2)
        })

    # ========================
    # ATTENDANCE CHART
    # ========================
    total_users = total_employees + total_members

    attendance_chart = []

    for month_num in range(1, 13):
        days_in_month = monthrange(current_year, month_num)[1]

        present_count = (await db.execute(
            select(func.count(Attendance.id)).where(
                Attendance.center_id == center_id,
                extract('year', Attendance.date) == current_year,
                extract('month', Attendance.date) == month_num,
                Attendance.status == AttendanceStatus.present
            )
        )).scalar() or 0

        if month_num == today.month:
            working_days = today.day
        elif month_num > today.month:
            working_days = 0
        else:
            working_days = days_in_month

        expected = total_users * working_days

        percentage = (present_count / expected * 100) if expected > 0 else 0

        attendance_chart.append({
            "month": month_names[month_num - 1],
            "attendance_percentage": round(percentage, 2)
        })

    # ========================
    # RESPONSE
    # ========================
    return {
        "center_id": str(center_id),
        "generated_at": datetime.now().isoformat(),
        "total_employees": int(total_employees),
        "total_members": int(total_members),
        "active_memberships": int(active_memberships),
        "total_guests": int(total_guests),
        "today_attendance": int(today_attendance),
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "revenue_trend": revenue_trend,
        "attendance_chart": attendance_chart
    }


# 1. POST /center/onboarding/temp
@router.post("/onboarding/temp", response_model=CenterOnboardingTempOut)
async def create_onboarding_temp(
    data: CenterOnboardingTempCreate,
    db: AsyncSession = Depends(get_async_session)
):
    """
    Create temporary onboarding record with pricing calculation.
    Supports monthly and yearly subscriptions.
    Checks for duplicate email in onboarding and user tables.
    """
    # Validate subscription_duration
    if data.subscription_duration not in ["monthly", "yearly"]:
        raise HTTPException(
            status_code=400,
            detail="subscription_duration must be 'monthly' or 'yearly'"
        )

    # Check for duplicate email in onboarding temp table
    existing_temp = await db.execute(
        select(CenterOnboardingTemp).where(CenterOnboardingTemp.center_email == data.center_email)
    )
    if existing_temp.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A center onboarding with this email already exists"
        )

    # Check for duplicate email in user table
    existing_user = await db.execute(
        select(User).where(User.email == data.center_email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists"
        )

    # Convert UUIDs to strings for JSON storage
    feature_ids = [str(fid) for fid in data.platform_feature_ids]

    # Calculate yearly base price from all selected features
    yearly_base = 0.0
    for feature_id in data.platform_feature_ids:
        feature = await db.get(PlatformFeature, feature_id)
        if not feature:
            raise HTTPException(
                status_code=404,
                detail=f"Feature {feature_id} not found"
            )
        yearly_base += float(feature.base_price)

    # Apply pricing logic based on subscription duration
    pricing_info = calculate_subscription_price(yearly_base, data.subscription_duration)
    calculated_amount = pricing_info["base_price"]

    temp = CenterOnboardingTemp(
        center_name=data.center_name,
        contact_person=data.contact_person,
        center_email=data.center_email,
        center_phone=data.center_phone,
        city=data.city,
        center_category_id=data.center_category_id,
        kind_of_center=data.kind_of_center,
        members_count=data.members_count,
        trainer_count=data.trainer_count,
        currently_using_digital_tool=data.currently_using_digital_tool,
        marketing_platform=data.marketing_platform,
        platform_feature_ids=feature_ids,
        is_terms_and_conditions=data.is_terms_and_conditions,
        subscription_duration=data.subscription_duration,
        calculated_amount=calculated_amount
    )
    db.add(temp)
    await db.commit()
    await db.refresh(temp)
    return temp


@router.get("/onboarding/temp/{onboarding_id}", response_model=CenterOnboardingTempDetailedOut)
async def get_onboarding_temp_by_id(
    onboarding_id: UUID,
    db: AsyncSession = Depends(get_async_session)
):
    """
    Get onboarding temp details, including only the base amount (without GST).
    """
    temp = await db.get(CenterOnboardingTemp, onboarding_id)
    if not temp:
        raise HTTPException(404, detail="Onboarding temp not found")

    # Fetch center category info
    category = await db.get(CenterCategory, temp.center_category_id)
    if category:
        category_info = {
            "id": str(category.id),
            "name": category.name
        }
    else:
        category_info = {}

    # Fetch platform features info
    feature_ids = temp.platform_feature_ids or []
    features = []
    for fid in feature_ids:
        feature = await db.get(PlatformFeature, fid)
        if feature:
            features.append({
                "id": str(feature.id),
                "feature_name": feature.feature_name,
                "description": feature.description
            })

    # Calculate yearly base price from all selected features
    yearly_base = 0.0
    for feature_id in feature_ids:
        feature = await db.get(PlatformFeature, feature_id)
        if feature:
            yearly_base += float(feature.base_price)

    # Apply pricing logic based on subscription duration
    pricing_info = calculate_subscription_price(yearly_base, temp.subscription_duration)
    base_amount = pricing_info["base_price"]

    return {
        "id": str(temp.id),
        "center_name": temp.center_name,
        "contact_person": temp.contact_person,
        "center_email": temp.center_email,
        "center_phone": temp.center_phone,
        "city": temp.city,
        "center_category": category_info,
        "kind_of_center": temp.kind_of_center,
        "members_count": temp.members_count,
        "trainer_count": temp.trainer_count,
        "currently_using_digital_tool": temp.currently_using_digital_tool,
        "marketing_platform": temp.marketing_platform,
        "platform_features": features,
        "is_terms_and_conditions": temp.is_terms_and_conditions,
        "subscription_duration": temp.subscription_duration,
        "calculated_amount": float(base_amount)  # Only base amount, no GST
    }


# @router.get("/onboarding/calculate-plan", response_model=GSTCalculationResponse)
# async def calculate_gst_plan(
#     onboarding_id: UUID = Query(..., description="Onboarding temp UUID"),
#     db: AsyncSession = Depends(get_async_session)
# ):
#     """
#     Calculate and return only the base price (before tax) for the onboarding temp.
#     """
#     temp = await db.get(CenterOnboardingTemp, onboarding_id)
#     if not temp:
#         raise HTTPException(status_code=404, detail="Onboarding temp not found")

#     feature_ids = temp.platform_feature_ids or []
#     if not isinstance(feature_ids, list):
#         raise HTTPException(status_code=400, detail="Invalid feature IDs format")

#     # Calculate yearly base price from features
#     yearly_base = 0.0
#     for feature_id in feature_ids:
#         try:
#             feature = await db.get(PlatformFeature, UUID(feature_id))
#             if not feature:
#                 raise HTTPException(
#                     status_code=404,
#                     detail=f"Feature {feature_id} not found"
#                 )
#             yearly_base += float(feature.base_price)
#         except ValueError:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Invalid feature ID format: {feature_id}"
#             )

#     # Apply pricing logic based on subscription duration
#     pricing_info = calculate_subscription_price(yearly_base, temp.subscription_duration)
#     total_base = pricing_info["base_price"]
#     pricing_note = pricing_info["note"]

#     # Update the calculated_amount in temp record (base only, no tax)
#     temp.calculated_amount = total_base
#     await db.commit()
#     await db.refresh(temp)

#     # Return only the base price (before tax)
#     return GSTCalculationResponse(
#         center_name=temp.center_name,
#         center_phone=temp.center_phone,
#         city=temp.city,
#         total_base_price=total_base,
#         total_tax=0.0,
#         total_amount=total_base,
#         tax=None,
#         pricing_note=pricing_note
#     )  


@router.get("/onboarding/calculate", response_model=GSTCalculationResponse)
async def calculate_gst(
    onboarding_id: UUID = Query(..., description="Onboarding temp UUID"),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Calculate GST and total amount with pricing breakdown.
    Shows savings comparison between monthly and yearly plans.
    """
    temp = await db.get(CenterOnboardingTemp, onboarding_id)
    if not temp:
        raise HTTPException(status_code=404, detail="Onboarding temp not found")

    feature_ids = temp.platform_feature_ids or []
    if not isinstance(feature_ids, list):
        raise HTTPException(status_code=400, detail="Invalid feature IDs format")

    # Calculate yearly base price from features
    yearly_base = 0.0
    for feature_id in feature_ids:
        try:
            feature = await db.get(PlatformFeature, UUID(feature_id))
            if not feature:
                raise HTTPException(
                    status_code=404,
                    detail=f"Feature {feature_id} not found"
                )
            yearly_base += float(feature.base_price)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid feature ID format: {feature_id}"
            )

    # Apply pricing logic based on subscription duration
    pricing_info = calculate_subscription_price(yearly_base, temp.subscription_duration)
    total_base = pricing_info["base_price"]
    pricing_note = pricing_info["note"]

    # Get applicable tax
    tax_query = await db.execute(
        select(TaxCategory)
        .where(TaxCategory.tax_scope == "center_subscription", TaxCategory.is_active == True)
        .limit(1)
    )
    tax = tax_query.scalar_one_or_none()
    
    total_tax = 0.0
    tax_info = None
    if tax:
        # Convert Decimal to float to avoid type mismatch
        total_tax = (total_base * float(tax.tax_percentage)) / 100
        tax_info = {
            "id": str(tax.id),
            "name": tax.name,
            "tax_type": tax.tax_type,
            "tax_percentage": float(tax.tax_percentage),
            "tax_scope": tax.tax_scope
        }

    # Update the calculated_amount in temp record (base + tax)
    temp.calculated_amount = total_base + total_tax
    await db.commit()
    await db.refresh(temp)

    return GSTCalculationResponse(
        center_name=temp.center_name,
        center_phone=temp.center_phone,
        city=temp.city,
        total_base_price=total_base,
        total_tax=total_tax,
        total_amount=total_base + total_tax,
        tax=tax_info,
        pricing_note=pricing_note
    )


# 5. POST /billing/onboarding/finalize
@router.post('/billing/onboarding/finalize/{onboarding_id}', response_model=OnboardingFinalizeResponse)
async def finalize_onboarding(
    onboarding_id: UUID = Path(..., description="Onboarding temp UUID"),
    payload: FinalizeOnboardingRequest = ...,
    db: AsyncSession = Depends(get_db)
):
    """
    Finalize onboarding: create center, admin, subscriptions with correct duration and pricing.
    """
    try:
        # Import required enums
        from app.billing.models.models import PaymentOrderStatus, PayerType, PayeeType, OrderType, ReferenceSchema, Currency
        
        # 1. Fetch the onboarding temp record
        temp = await db.get(CenterOnboardingTemp, onboarding_id)
        if not temp:
            raise HTTPException(status_code=404, detail="Onboarding temp not found")

        # 2. Create Address
        address = Address(
            id=uuid4(),
            address_line_1=payload.address_line_1,
            address_line_2=payload.address_line_2,
            city=temp.city,
        )
        db.add(address)
        await db.flush()

        # 3. Get center category
        center_category = await db.get(CenterCategory, temp.center_category_id)
        if not center_category:
            raise HTTPException(status_code=404, detail="Center category not found")

        # 4. Create Center
        center = Center(
            id=uuid4(),
            center_name=temp.center_name,
            center_category_id=temp.center_category_id,
            address_id=address.id,
            approval_status=ApprovalStatus.approved,
            center_status=CenterStatus.active,
            contact_person=temp.contact_person,
            center_email=temp.center_email,
            center_phone=temp.center_phone,
            gst_number=payload.gst_number,
            kind_of_center=temp.kind_of_center,
            members_count=temp.members_count,
            trainer_count=temp.trainer_count,
            currently_using_digital_tool=temp.currently_using_digital_tool,
            marketing_platform=temp.marketing_platform,
            network_enabled=True,
            parent_center_id=None,
        )
        db.add(center)
        await db.flush()

        # 5. Initialize Accounts for the new center (if you have this function)
        try:
            from app.accounts.init_accounts import initialize_center_accounts
            await initialize_center_accounts(db, center.id)
            print(f"✅ Initialized accounts for center: {center.center_name}")
        except ImportError:
            print("⚠️ Account initialization module not found, skipping...")

        # 6. Check if user already exists with this email
        user_result = await db.execute(
            select(User).where(User.email == temp.center_email)
        )
        existing_user = user_result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail=f"A user with email {temp.center_email} already exists"
            )

        # 7. Create CenterAdmin (which will also create the User row via inheritance)
        center_admin = CenterAdmin(
            id=uuid4(),
            email=temp.center_email,
            password_hash=get_password_hash("TempPassword@123"),
            role="centeradmin",
            status="active",
            full_name=temp.contact_person,
            center_id=center.id,
            address_id=address.id,
            network_access_enabled=False,
            white_label_enabled=False,
            is_approved=True,
        )
        db.add(center_admin)
        await db.flush()

        # 8. Update audit fields
        address.created_by = center_admin.id
        address.updated_by = center_admin.id
        center.created_by = center_admin.id
        center.updated_by = center_admin.id
        center_admin.created_by = center_admin.id
        center_admin.updated_by = center_admin.id
        await db.flush()

        # 9. Get applicable tax
        tax_result = await db.execute(
            select(TaxCategory)
            .where(TaxCategory.tax_scope == "center_subscription", TaxCategory.is_active == True)
            .limit(1)
        )
        tax = tax_result.scalar_one_or_none()

        # 10. Calculate yearly base price from features
        feature_ids = temp.platform_feature_ids or []
        yearly_base = 0.0
        for feature_id in feature_ids:
            feature = await db.get(PlatformFeature, UUID(feature_id))
            if not feature:
                raise HTTPException(
                    status_code=404,
                    detail=f"Feature {feature_id} not found"
                )
            yearly_base += float(feature.base_price)

        # 11. Apply pricing logic
        pricing_info = calculate_subscription_price(yearly_base, temp.subscription_duration)
        base_price = pricing_info["base_price"]
        
        # Calculate tax
        tax_amount = 0.0
        if tax:
            tax_amount = (base_price * float(tax.tax_percentage)) / 100
        
        total_amount = base_price + tax_amount

        # 12. Create PaymentOrder with all required enum fields
        payment_order = PaymentOrder(
            payment_order_id=uuid4(),
            payer_user_id=center_admin.id,
            payer_type=PayerType.center_admin,      # ✅ Required enum
            payee_type=PayeeType.platform,           # ✅ Required enum
            center_id=center.id,
            order_type=OrderType.center_subscription, # ✅ Required enum (use correct value)
            reference_schema=ReferenceSchema.center_feature, # ✅ Required enum
            reference_id=center.id,                   # Reference to the center
            subtotal_amount=base_price,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=Currency.INR,
            status=PaymentOrderStatus.paid,
            created_by=center_admin.id,
            updated_by=center_admin.id,
        )
        db.add(payment_order)
        await db.flush()

        # 13. Create CenterFeatureSubscriptions with correct duration and pricing
        start_date = datetime.utcnow().date()
        
        # Set end_date based on subscription duration
        if temp.subscription_duration == "monthly":
            end_date = start_date + relativedelta(months=1)
        else:
            end_date = start_date + relativedelta(years=1)

        feature_subscriptions = []
        for feature_id in feature_ids:
            feature = await db.get(PlatformFeature, UUID(feature_id))
            feature_yearly_price = float(feature.base_price)
            
            # Calculate unit price for this specific feature
            if temp.subscription_duration == "monthly":
                unit_price = (feature_yearly_price / 12) * 1.25
            else:
                unit_price = feature_yearly_price
            
            subscription = CenterFeatureSubscription(
                id=uuid4(),
                center_id=center.id,
                feature_id=UUID(feature_id),
                payment_order_id=payment_order.payment_order_id,
                pricing_type=pricing_info["pricing_type"],
                unit_price=unit_price,
                tax_category_id=tax.id if tax else None,
                start_date=start_date,
                end_date=end_date,
                status=StatusEnum.active,
                created_by=center_admin.id,
                updated_by=center_admin.id,
            )
            db.add(subscription)
            feature_subscriptions.append(subscription)
        
        await db.flush()


        # 14. Delete the temp record
        await db.delete(temp)
        
        # 15. Commit all changes
        await db.commit()
        
        # 16. Refresh all objects
        await db.refresh(center)
        await db.refresh(center_admin)
        await db.refresh(payment_order)
        for sub in feature_subscriptions:
            await db.refresh(sub)

        # 17. Prepare response
        return OnboardingFinalizeResponse(
            message="Center onboarding completed successfully",
            center=CenterInfo(
                id=center.id,
                center_name=center.center_name,
                center_category_id=center.center_category_id,
                address_id=center.address_id,
                approval_status=center.approval_status.value,
                center_status=center.center_status.value
            ),
            center_admin=CenterAdminInfo(
                id=center_admin.id,
                center_id=center_admin.center_id
            ),
            payment=PaymentOrderInfo(
                payment_order_id=payment_order.payment_order_id,
                total_amount=float(payment_order.total_amount),
                status=payment_order.status.value
            ),
            feature_subscriptions=[
                FeatureSubscriptionInfo(
                    id=sub.id,
                    center_id=sub.center_id,
                    feature_id=sub.feature_id,
                    payment_order_id=sub.payment_order_id,
                    pricing_type=sub.pricing_type,
                    unit_price=float(sub.unit_price),
                    tax_category_id=sub.tax_category_id,
                    start_date=sub.start_date,
                    status=sub.status.value
                )
                for sub in feature_subscriptions
            ],
            accounts_initialized=True
        )

    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {str(e.orig)}")
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error finalizing onboarding: {str(e)}")


# @router.post('/billing/onboarding/finalize/{onboarding_id}', response_model=OnboardingFinalizeResponse)
# async def finalize_onboarding(
#     onboarding_id: UUID = Path(..., description="Onboarding temp UUID"),
#     payload: FinalizeOnboardingRequest = ...,
#     db: AsyncSession = Depends(get_db)
# ):
#     try:
#         # 1. Fetch onboarding temp data
#         onboarding_temp = await db.get(CenterOnboardingTemp, onboarding_id)
#         if not onboarding_temp:
#             raise HTTPException(status_code=404, detail="Onboarding data not found")
#         if not onboarding_temp.center_email:
#             raise HTTPException(status_code=400, detail="Center email is required to create a user.")

#         # 2. Check if user already exists
#         user_stmt = select(User).where(User.email == onboarding_temp.center_email)
#         result = await db.execute(user_stmt)
#         user = result.scalar_one_or_none()
#         if user:
#             raise HTTPException(status_code=400, detail="A user with this email already exists.")

#         # 3. Create Address (no center_id)
#         address = Address(
#             id=uuid4(),
#             address_line_1=payload.address_line_1,
#             address_line_2=payload.address_line_2,
#             city=onboarding_temp.city,
#             state=getattr(onboarding_temp, "state", None),
#             country=getattr(onboarding_temp, "country", None),
#             postal_code=getattr(onboarding_temp, "postal_code", None),
#             created_by=None,  # Will set after CenterAdmin is created
#             updated_by=None,
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow(),
#         )
#         db.add(address)
#         await db.flush()

#         # 4. Create Center (parent_center_id is None for parent center)
#         center = Center(
#             id=uuid4(),
#             center_name=onboarding_temp.center_name,
#             center_category_id=onboarding_temp.center_category_id,
#             address_id=address.id,
#             gst_number=payload.gst_number,
#             currently_using_digital_tool=onboarding_temp.currently_using_digital_tool,
#             marketing_platform=onboarding_temp.marketing_platform,
#             kind_of_center=onboarding_temp.kind_of_center,
#             members_count=onboarding_temp.members_count,
#             trainer_count=onboarding_temp.trainer_count,
#             center_phone=onboarding_temp.center_phone,
#             center_email=onboarding_temp.center_email,
#             contact_person=onboarding_temp.contact_person,
#             approval_status="approved",
#             center_status="active",
#             network_enabled=True,
#             parent_center_id=None,  # Explicitly set as None
#             created_by=None,  # Will set after CenterAdmin is created
#             updated_by=None,
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow(),
#         )
#         db.add(center)
#         await db.flush()

#         # 5. Initialize Accounts for the new center
#         from app.accounts.init_accounts import initialize_center_accounts
#         await initialize_center_accounts(db, center.id)
#         print(f"✅ Initialized 28 standard accounts for center: {center.center_name}")


#         # 6. Create CenterAdmin (this will also create the User row)
#         center_admin = CenterAdmin(
#             id=uuid4(),
#             email=onboarding_temp.center_email,
#             password_hash=get_password_hash("defaultpassword123"),
#             role="centeradmin",
#             status=StatusEnum.active,
#             full_name=onboarding_temp.contact_person or "Center Admin",
#             center_id=center.id,
#             address_id=address.id,
#             created_by=None,  # Will set after flush
#             updated_by=None,
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow(),
#         )
#         db.add(center_admin)
#         await db.flush()

#         # Now update created_by/updated_by fields with center_admin.id
#         address.created_by = center_admin.id
#         address.updated_by = center_admin.id
#         center.created_by = center_admin.id
#         center.updated_by = center_admin.id
#         center_admin.created_by = center_admin.id
#         center_admin.updated_by = center_admin.id
#         await db.flush()

#         # 7. Create PaymentOrder
#         payment_order = PaymentOrder(
#             payment_order_id=uuid4(),
#             center_id=center.id,
#             payer_user_id=center_admin.id,
#             payer_type="center_admin",
#             payee_type="platform",
#             order_type="center_subscription",
#             reference_schema="center_feature",
#             reference_id=center.id,
#             subtotal_amount=getattr(onboarding_temp, "calculated_amount", 0.0),
#             tax_amount=getattr(onboarding_temp, "tax_amount", 0.0),
#             total_amount=getattr(onboarding_temp, "calculated_amount", 0.0),
#             currency="INR",
#             status="paid",
#             created_by=center_admin.id,
#             updated_by=center_admin.id,
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow(),
#         )
#         db.add(payment_order)
#         await db.flush()

#         # 8. Now create CenterFeatureSubscriptions with payment_order_id
#         feature_subscriptions = []
#         from collections import OrderedDict
#         feature_ids = list(OrderedDict.fromkeys(onboarding_temp.platform_feature_ids))
        
#         for feature_id in feature_ids:
#             feature = await db.get(PlatformFeature, feature_id)
#             if not feature:
#                 raise HTTPException(status_code=404, detail=f"Feature {feature_id} not found")
            
#             start_date = datetime.utcnow()
#             yearly_price = float(feature.base_price)
            
#             # Calculate end_date and pricing based on subscription_duration
#             if onboarding_temp.subscription_duration == "monthly":
#                 end_date = start_date + relativedelta(months=1)
#                 pricing_type = "monthly"
#                 # Monthly: (yearly / 12) * 1.25
#                 unit_price = (yearly_price / 12) * 1.25
#             else:
#                 end_date = start_date + relativedelta(years=1)
#                 pricing_type = "yearly"
#                 unit_price = yearly_price
            
#             subscription = CenterFeatureSubscription(
#                 id=uuid4(),
#                 center_id=center.id,
#                 feature_id=feature_id,
#                 payment_order_id=payment_order.payment_order_id,
#                 pricing_type=pricing_type,
#                 unit_price=unit_price,
#                 status=StatusEnum.active,
#                 start_date=start_date,
#                 end_date=end_date,
#                 created_by=center_admin.id,
#                 updated_by=center_admin.id,
#                 created_at=datetime.utcnow(),
#                 updated_at=datetime.utcnow(),
#             )
#             db.add(subscription)
#             feature_subscriptions.append(subscription)
        
#         await db.flush()

#         # 9. Commit transaction
#         await db.commit()

#         # 10. Prepare response
#         response = OnboardingFinalizeResponse(
#             message="Center onboarding completed successfully",  # ADD THIS LINE
#             center=CenterInfo.from_orm(center),
#             center_admin=CenterAdminInfo.from_orm(center_admin),
#             payment=PaymentOrderInfo.from_orm(payment_order),
#             feature_subscriptions=[
#                 FeatureSubscriptionInfo.from_orm(fs) for fs in feature_subscriptions
#             ],
#             accounts_initialized=True  # ADD THIS LINE
#         )
#         return response

#     except IntegrityError as e:
#         await db.rollback()
#         raise HTTPException(status_code=400, detail=f"Integrity error: {str(e.orig)}")
#     except Exception as e:
#         traceback.print_exc()
#         await db.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# 6. POST /center/onboarding/finalize
# @router.post("/onboarding/finalize")
# async def finalize_onboarding(
#     req: FinalizeOnboardingRequest,
#     db: AsyncSession = Depends(get_async_session)
# ):
#     temp = await db.get(CenterOnboardingTemp, req.onboarding_id)
#     if not temp:
#         raise HTTPException(404, "Onboarding temp not found")
#     payment = await db.get(PaymentOrder, req.payment_order_id)
#     if not payment or payment.status != "success":
#         raise HTTPException(400, "Payment not successful")
#     # 1. Create Address
#     address = Address(city=temp.city)
#     db.add(address)
#     await db.flush()
#     # 2. Create Center
#     center = Center(
#         center_name=temp.center_name,
#         center_category_id=temp.center_category_id,
#         address_id=address.id,
#         approval_status="approved",
#         center_status="active"
#     )
#     db.add(center)
#     await db.flush()
#     # 3. Create CenterAdmin (and User if needed)
#     user = await db.execute(select(User).where(User.email == temp.admin_email))
#     user = user.scalar_one_or_none()
#     if not user:
#         user = User(email=temp.admin_email, full_name=temp.admin_name, role="center_admin")
#         db.add(user)
#         await db.flush()
#     admin = CenterAdmin(user_id=user.id, center_id=center.id)
#     db.add(admin)
#     # 4. Create CenterFeatureSubscription for each feature
#     for feature_id in temp.selected_features:
#         feature = await db.get(PlatformFeature, feature_id)
#         tax = await db.execute(
#             select(TaxCategory)
#             .where(TaxCategory.tax_scope == "center_subscription", TaxCategory.is_active == True)
#             .limit(1)
#         )
#         tax = tax.scalar_one_or_none()
#         sub = CenterFeatureSubscription(
#             center_id=center.id,
#             feature_id=feature_id,
#             payment_order_id=payment.payment_order_id,
#             pricing_type="yearly",
#             unit_price=feature.base_price,
#             tax_category_id=tax.id if tax else None,
#             start_date=datetime.utcnow(),
#             status=StatusEnum.active
#         )
#         db.add(sub)
#     await db.commit()
#     await db.delete(temp)
#     await db.commit()
#     return {"detail": "Onboarding finalized and center created."}



# Create time slot (centeradmin only)
@router.post("/center/time-slots", response_model=CenterTimeSlotOut, status_code=201)
async def create_center_time_slot(
    payload: CenterTimeSlotCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    slot = CenterTimeSlot(
        center_id=center_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        slot_capacity=payload.slot_capacity,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot

# List all time slots for current center (all roles)
@router.get("/center/time-slots", response_model=List[CenterTimeSlotOut])
async def list_center_time_slots(
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    center_id = center_admin.center_id if center_admin else None
    result = await db.execute(select(CenterTimeSlot).where(CenterTimeSlot.center_id == center_id))
    slots = result.scalars().all()
    return slots

# Get time slot by ID (all roles)
@router.get("/center/time-slots/{slot_id}", response_model=CenterTimeSlotOut)
async def get_center_time_slot(
    slot_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    slot = await db.get(CenterTimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    return slot

# Update time slot (centeradmin only)
@router.put("/center/time-slots/{slot_id}", response_model=CenterTimeSlotOut)
async def update_center_time_slot(
    slot_id: str,
    payload: CenterTimeSlotUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    slot = await db.get(CenterTimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if slot.center_id != center_admin.center_id:
        raise HTTPException(status_code=403, detail="Not allowed to update this time slot")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(slot, field, value)
    slot.updated_by = current_user["user_id"]
    slot.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(slot)
    return slot

# Delete time slot (centeradmin only)
@router.delete("/center/time-slots/{slot_id}")
async def delete_center_time_slot(
    slot_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    slot = await db.get(CenterTimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if slot.center_id != center_admin.center_id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this time slot")
    await db.delete(slot)
    await db.commit()
    return {"detail": "Time slot deleted"}


#Center Location Endpoints
@router.post("/center-location/", response_model=CenterLocationOut, status_code=201)
async def create_center_location(
    data: CenterLocationCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Fetch the center
    center = await session.get(Center, data.center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")

    # Fetch the address explicitly
    if not center.address_id:
        raise HTTPException(status_code=404, detail="Center address not found")
    address = await session.get(Address, center.address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Center address not found")

    # Update latitude and longitude
    address.latitude = data.latitude
    address.longitude = data.longitude
    await session.commit()
    await session.refresh(address)
    return CenterLocationOut(center_id=center.id, latitude=address.latitude, longitude=address.longitude)


@router.get("/center-location/{center_id}", response_model=CenterLocationOut)
async def get_center_location(
    center_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    address = center.address
    if not address or address.latitude is None or address.longitude is None:
        raise HTTPException(status_code=404, detail="Center location not set")
    return CenterLocationOut(center_id=center.id, latitude=address.latitude, longitude=address.longitude)


@router.put("/center-location/", response_model=CenterLocationOut)
async def update_center_location(
    data: CenterLocationCreate,  # Or CenterLocationUpdate if you want a separate schema
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Get the center for the current admin
    center_id = current_admin["center_id"]
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")

    # Fetch the address explicitly
    if not center.address_id:
        raise HTTPException(status_code=404, detail="Center address not found")
    address = await session.get(Address, center.address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Center address not found")

    # Update latitude and longitude
    address.latitude = data.latitude
    address.longitude = data.longitude
    await session.commit()
    await session.refresh(address)
    return CenterLocationOut(center_id=center.id, latitude=address.latitude, longitude=address.longitude)


#-------------------------------
# Wallet APIs (Admin Only)
#-------------------------------

#wallet creation api
from decimal import Decimal

@router.post("/center/wallet/create")
async def create_or_topup_center_wallet(
    deposit: float = Body(..., embed=True),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.billing.models.models import PaymentOrder, PaymentOrderStatus, PaymentMethod
    from app.accounts.wallet_helper import post_wallet_transaction_journal
    from decimal import Decimal

    center_id = current_admin["center_id"]

    # ❌ REMOVE async with session.begin()

    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    wallet_result = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )
    wallet = wallet_result.scalar_one_or_none()

    # CREATE
    if not wallet:
        if deposit < 20000:
            raise HTTPException(400, "Minimum deposit ₹20,000 required")

        wallet = CenterWallet(
            id=uuid4(),
            center_id=center_id,
            balance=Decimal(str(deposit)),
            deposit=Decimal(str(deposit)),
            min_balance=Decimal("10000"),
            last_updated=datetime.utcnow(),
            created_by=current_admin["user_id"],
            updated_by=current_admin["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(wallet)
        await session.flush()

        transaction_type = "create"

    # TOPUP
    else:
        if deposit <= 0:
            raise HTTPException(400, "Deposit must be positive")

        wallet.balance += Decimal(str(deposit))
        wallet.last_updated = datetime.utcnow()
        wallet.updated_by = current_admin["user_id"]

        await session.flush()

        transaction_type = "topup"

    # PAYMENT ORDER
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        payer_user_id=current_admin["user_id"],
        payer_type="center_admin",
        payee_type="platform",
        center_id=center_id,
        order_type="wallet",
        reference_schema="wallet",
        reference_id=wallet.id,
        subtotal_amount=deposit,
        tax_amount=0,
        total_amount=deposit,
        currency="INR",
        status=PaymentOrderStatus.paid,
        payment_method=PaymentMethod.cash,
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    session.add(payment_order)
    await session.flush()

    # ACCOUNTING
    await post_wallet_transaction_journal(
        session=session,
        center_id=center_id,
        amount=Decimal(str(deposit)),
        payment_order_id=payment_order.payment_order_id,
        created_by=current_admin["user_id"],
        transaction_type=transaction_type
    )

    # ✅ COMMIT MANUALLY
    await session.commit()

    return {
        "center_id": str(center_id),
        "wallet_id": str(wallet.id),
        "balance": float(wallet.balance),
        "message": f"Wallet {transaction_type} successful"
    }
    

#Get Center Wallet
@router.get("/center/wallet")
async def get_my_center_wallet(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    wallet_result = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )
    wallet = wallet_result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    return {
        "center_id": str(center_id),
        "balance": float(wallet.balance),
        "deposit": float(wallet.deposit),
        "min_balance": float(wallet.min_balance),
        # "min_deposit": float(wallet.min_deposit)
    }

#Get Platform Wallet
@router.get("/platform/wallet")
async def get_platform_wallet(
    session: AsyncSession = Depends(get_async_session)
):
    wallet = await session.execute(select(PlatformWallet))
    wallet = wallet.scalar_one_or_none()
    if not wallet:
        raise HTTPException(404, "Platform wallet not found")
    return {
        "balance": float(wallet.balance)
    }


#List Wallet Transactions (Admin Only)
@router.get("/center/wallet/transactions")
async def list_my_wallet_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from sqlalchemy import select

    center_id = current_admin["center_id"]

    # 🔹 Get wallet
    wallet = (await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )).scalar_one_or_none()

    if not wallet:
        raise HTTPException(404, "Wallet not found")

    # 🔥 STEP 1: txn_ids
    txn_ids = [row[0] for row in (await session.execute(
        select(WalletTransaction.txn_id).where(
            (WalletTransaction.to_wallet_id == wallet.id) |
            (WalletTransaction.from_wallet_id == wallet.id)
        ).distinct()
    )).all()]

    if not txn_ids:
        return {"total": 0, "page": page, "page_size": page_size, "transactions": []}

    total = len(txn_ids)
    paginated_txn_ids = txn_ids[(page - 1) * page_size: page * page_size]

    # 🔥 STEP 2: fetch all txs
    txs = (await session.execute(
        select(WalletTransaction)
        .where(WalletTransaction.txn_id.in_(paginated_txn_ids))
        .order_by(WalletTransaction.created_at.desc())
    )).scalars().all()

    # 🔥 STEP 3: group
    txn_map = {}
    for tx in txs:
        key = str(tx.txn_id)
        txn_map.setdefault(key, []).append(tx)

    final_list = []

    # 🔥 STEP 4: process each txn
    for txn_id, tx_list in txn_map.items():

        total_amount = 0
        credit = 0
        debit = 0
        platform_fee = 0
        category = "-"
        transaction_center_name = "-"
        balance_after = 0

        for tx in tx_list:

            # 🔻 DEBIT (HOME CENTER)
            if tx.from_wallet_id == wallet.id:
                debit = float(tx.amount)
                total_amount = float(tx.amount)
                category = "network-out"

                # ✅ CORRECT BALANCE (THIS CENTER ONLY)
                balance_after = float(tx.balance)

                # ✅ Get other center name
                if tx.to_wallet_id:
                    to_wallet = await session.get(CenterWallet, tx.to_wallet_id)
                    if to_wallet:
                        center = await session.get(Center, to_wallet.center_id)
                        transaction_center_name = center.center_name

            # 🔺 CREDIT (NETWORK CENTER)
            elif tx.to_wallet_id == wallet.id:
                credit = float(tx.amount)
                category = "network-in"

                # ✅ CORRECT BALANCE (THIS CENTER ONLY)
                balance_after = float(tx.balance)

                # ✅ Get other center name
                if tx.from_wallet_id:
                    from_wallet = await session.get(CenterWallet, tx.from_wallet_id)
                    if from_wallet:
                        center = await session.get(Center, from_wallet.center_id)
                        transaction_center_name = center.center_name

            # 💰 PLATFORM FEE
            if tx.transaction_type == "platform_commission":
                platform_fee = float(tx.amount)

        # 🔥 TOTAL FIX (network center case)
        if total_amount == 0:
            total_amount = credit + platform_fee

        tx_type = "Debit" if debit > 0 else "Credit"

        final_list.append({
            "txn_id": txn_id,
            "date": tx_list[0].created_at.strftime("%Y-%m-%d"),
            "type": tx_type,
            "category": category,
            "transaction_center_name": transaction_center_name,
            "total_amount": total_amount,
            "credit": credit,
            "debit": debit,
            "platform_fee": platform_fee,

            # ✅ FINAL FIXED BALANCE
            "balance_after": balance_after,

            "status": tx_list[0].status.capitalize() if tx_list[0].status else "Completed"
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "transactions": final_list
    }


#wallet card api
@router.get("/center/wallet/summary")
async def get_wallet_summary(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from datetime import datetime
    from sqlalchemy import select, func

    center_id = current_admin["center_id"]

    wallet = (await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )).scalar_one_or_none()

    if not wallet:
        raise HTTPException(404, "Wallet not found")

    # 🔹 Month range
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_end = now

    # 🔺 CREDIT (network-in)
    credit_stmt = select(func.sum(WalletTransaction.amount)).where(
        WalletTransaction.to_wallet_id == wallet.id,
        WalletTransaction.transaction_type == "network-in",
        WalletTransaction.created_at >= month_start,
        WalletTransaction.created_at <= month_end
    )
    month_credit = (await session.execute(credit_stmt)).scalar() or 0

    # 🔻 DEBIT (network-out)
    debit_stmt = select(func.sum(WalletTransaction.amount)).where(
        WalletTransaction.from_wallet_id == wallet.id,
        WalletTransaction.transaction_type == "network-out",
        WalletTransaction.created_at >= month_start,
        WalletTransaction.created_at <= month_end
    )
    month_debit = (await session.execute(debit_stmt)).scalar() or 0

    # 💰 PLATFORM FEE (NEW)
    platform_stmt = select(func.sum(WalletTransaction.amount)).where(
        WalletTransaction.transaction_type == "platform_commission",
        WalletTransaction.created_at >= month_start,
        WalletTransaction.created_at <= month_end,
        WalletTransaction.txn_id.in_(
            select(WalletTransaction.txn_id).where(
                (WalletTransaction.to_wallet_id == wallet.id) |
                (WalletTransaction.from_wallet_id == wallet.id)
            )
        )
    )
    platform_fee = (await session.execute(platform_stmt)).scalar() or 0

    return {
        "center_id": str(center_id),
        "available_balance": float(wallet.balance),

        # 🔥 UPDATED FIELDS
        "month_credit": float(month_credit),
        "month_debit": float(month_debit),
        "platform_fee": float(platform_fee),

        # 🔥 OPTIONAL (VERY USEFUL)
        "net_income": float(month_credit - platform_fee),
        "net_outflow": float(month_debit)
    }


#get center details (centeradmin only)
@router.get("/center/me")
async def get_my_center_details(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    result = await session.execute(
        select(Center).where(Center.id == center_id)
    )
    center = result.scalar_one_or_none()
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")

    # Optionally fetch address details
    address = None
    if center.address_id:
        address_result = await session.execute(
            select(Address).where(Address.id == center.address_id)
        )
        address = address_result.scalar_one_or_none()

    # Get center image URL if present
    center_image_url = (
        await run_in_threadpool(get_file_url, center.center_image)
        if center.center_image else None
    )

    return {
        "center_id": str(center.id),
        "center_name": center.center_name,
        "about": center.about,
        "facilities": center.facilities,
        "website_url": center.website_url,
        "capacity": float(center.capacity) if center.capacity else None,
        "approval_status": center.approval_status.value if center.approval_status else None,
        "center_status": center.center_status.value if center.center_status else None,
        "network_enabled": center.network_enabled,
        "networking_amount": float(center.networking_amount) if center.networking_amount else None,
        "white_label_enabled": center.white_label_enabled,
        "kind_of_center": center.kind_of_center,
        "members_count": center.members_count,
        "trainer_count": center.trainer_count,
        "currently_using_digital_tool": center.currently_using_digital_tool,
        "marketing_platform": center.marketing_platform,
        "contact_person": center.contact_person,
        "center_email": center.center_email,
        "center_phone": center.center_phone,
        "gst_number": center.gst_number,
        "live_class_enable": center.live_class_enable,
        "center_image_url": center_image_url,  # <-- Added here
        "address": {
            "address_line_1": address.address_line_1,
            "address_line_2": address.address_line_2,
            "city": address.city,
            "district": address.district,
            "state": address.state,
            "country": address.country,
            "postal_code": address.postal_code,
        } if address else None
    }

#get center details by id (centeradmin can get own center and sub-branches, sub-branch admin can get only own center)
@router.get("/center/{center_id}/by-id")
async def get_center_by_id(
    center_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Get the requested center
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    # Get the current admin's center
    admin_center_id = str(current_admin["center_id"])

    # Permission logic:
    # - Parent admin: can get own center and any sub-branch
    # - Sub-branch admin: can get only their own center
    is_own_center = str(center.id) == admin_center_id
    is_sub_branch = str(center.parent_center_id) == admin_center_id if center.parent_center_id else False

    if not (is_own_center or is_sub_branch):
        raise HTTPException(403, "Not allowed to access this center data")

    # Fetch address
    address = None
    if center.address_id:
        address = await session.get(Address, center.address_id)

    # Fetch center category
    center_category = None
    if center.center_category_id:
        center_category = await session.get(CenterCategory, center.center_category_id)

    # Get center image URL
    center_image_url = (
        await run_in_threadpool(get_file_url, center.center_image)
        if center.center_image else None
    )

    return {
        "center_id": str(center.id),
        "center_name": center.center_name,
        "about": center.about,
        "facilities": center.facilities,

        # CENTER CATEGORY ADDED
        "center_category": {
            "id": str(center_category.id),
            "name": center_category.name
        } if center_category else None,

        "website_url": center.website_url,
        "capacity": float(center.capacity) if center.capacity else None,
        "approval_status": center.approval_status.value if hasattr(center.approval_status, "value") else center.approval_status,
        "center_status": center.center_status.value if hasattr(center.center_status, "value") else center.center_status,
        "network_enabled": center.network_enabled,
        "networking_amount": float(center.networking_amount) if center.networking_amount else None,
        "white_label_enabled": center.white_label_enabled,
        "kind_of_center": center.kind_of_center,
        "members_count": center.members_count,
        "trainer_count": center.trainer_count,
        "currently_using_digital_tool": center.currently_using_digital_tool,
        "marketing_platform": center.marketing_platform,
        "contact_person": center.contact_person,
        "center_email": center.center_email,
        "center_phone": center.center_phone,
        "gst_number": center.gst_number,
        "live_class_enable": center.live_class_enable,
        "center_image_url": center_image_url,
        "whatsapp_number": center.whatsapp_number,

        "address": {
            "address_line_1": address.address_line_1,
            "address_line_2": address.address_line_2,
            "city": address.city,
            "district": address.district,
            "state": address.state,
            "country": address.country,
            "postal_code": address.postal_code,
        } if address else None
    }  


@router.put("/center/profile/update/{center_id}")
async def update_center_profile(
    center_id: str = Path(..., description="ID of the center to update"),
    data: CenterProfileUpdate = Body(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Fetch the center to update
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")

    admin_center_id = str(current_admin["center_id"])
    is_own_center = str(center.id) == admin_center_id
    is_sub_branch = str(center.parent_center_id) == admin_center_id if center.parent_center_id else False

    # Permission check
    if not (is_own_center or is_sub_branch):
        raise HTTPException(status_code=403, detail="Not allowed to update this center")

    # Make whatsapp_number mandatory
    if not data.whatsapp_number:
        raise HTTPException(
            status_code=400,
            detail="WhatsApp number is required"
        )

    # Update Center fields (except address and image)
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field != "address" and hasattr(center, field):
            setattr(center, field, value)

    # Update Address if present
    address_data = None
    if "address" in update_data and update_data["address"]:
        if not center.address_id:
            raise HTTPException(
                status_code=400,
                detail="Center has no address to update"
            )
        address = await session.get(Address, center.address_id)
        if not address:
            raise HTTPException(
                status_code=404,
                detail="Address not found"
            )
        for field, value in update_data["address"].items():
            if hasattr(address, field):
                setattr(address, field, value)
        address_data = {
            "address_line_1": address.address_line_1,
            "address_line_2": address.address_line_2,
            "city": address.city,
            "district": address.district,
            "state": address.state,
            "country": address.country,
            "postal_code": address.postal_code,
        }

    await session.commit()
    await session.refresh(center)

    # Prepare updated response
    updated_center = {
        "center_id": str(center.id),
        "center_name": center.center_name,
        "about": center.about,
        "facilities": center.facilities,
        "website_url": center.website_url,
        "capacity": float(center.capacity) if center.capacity else None,
        "approval_status": center.approval_status.value
        if hasattr(center.approval_status, "value")
        else center.approval_status,
        "center_status": center.center_status.value
        if hasattr(center.center_status, "value")
        else center.center_status,
        "network_enabled": center.network_enabled,
        "networking_amount": float(center.networking_amount)
        if center.networking_amount
        else None,
        "white_label_enabled": center.white_label_enabled,
        "kind_of_center": center.kind_of_center,
        "members_count": center.members_count,
        "trainer_count": center.trainer_count,
        "currently_using_digital_tool": center.currently_using_digital_tool,
        "marketing_platform": center.marketing_platform,
        "contact_person": center.contact_person,
        "center_email": center.center_email,
        "center_phone": center.center_phone,
        "whatsapp_number": center.whatsapp_number,  
        "gst_number": center.gst_number,
        "live_class_enable": center.live_class_enable,
        "center_image_url": (
            await run_in_threadpool(get_file_url, center.center_image)
            if center.center_image
            else None
        ),
        "address": address_data,
    }

    return {
        "detail": "Center profile updated successfully",
        "updated_center": updated_center
    }

#center image update api
@router.put("/center/image/update")
async def update_center_image(
    center_id: str = Body(..., embed=True, description="Center ID to update image"),
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Get current admin info
    admin_id = current_admin["user_id"]
    admin = await session.get(CenterAdmin, admin_id)
    if not admin:
        raise HTTPException(404, "CenterAdmin not found")

    # Get the center to update
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    # Permission logic:
    # - Sub-branch admin: can update only their own center
    # - Parent admin: can update their own center and any sub-branch
    print("admin.center_id:", admin.center_id)
    print("center_id:", center_id)
    print("center.parent_center_id:", center.parent_center_id)

    is_own_center = str(admin.center_id) == str(center_id)
    is_sub_branch = str(center.parent_center_id) == str(admin.center_id) if center.parent_center_id else False

    if not (is_own_center or is_sub_branch):
        raise HTTPException(403, "Not allowed to update this center image")

    # Upload image to S3
    file_bytes = await image.read()
    file_ext = image.filename.split('.')[-1]
    key = f"center_images/{center_id}.{file_ext}"
    await run_in_threadpool(upload_file, file_bytes, key, image.content_type)
    center.center_image = key
    await session.commit()

    image_url = await run_in_threadpool(get_file_url, key)
    return {
        "detail": "Center image updated successfully",
        "center_id": center_id,
        "center_name": center.center_name,
        "center_image_url": image_url
    }


@router.put("/centeradmin/profile-photo")
async def update_centeradmin_profile_photo(
    profile_photo: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    admin_result = await session.execute(
        select(CenterAdmin).where(CenterAdmin.center_id == center_id)
    )
    admin = admin_result.scalar_one_or_none()
    if not admin:
        raise HTTPException(404, "CenterAdmin not found")
    user = await session.get(User, admin.id)  # Use admin.id, not admin.user_id
    if not user:
        raise HTTPException(404, "User not found")
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    file_bytes = await profile_photo.read()
    file_ext = profile_photo.filename.split('.')[-1]
    key = f"profile_photos/{user.id}.{file_ext}"
    from app.s3.service import upload_file, get_file_url
    from fastapi.concurrency import run_in_threadpool
    await run_in_threadpool(upload_file, file_bytes, key, profile_photo.content_type)
    user.profile_photo = key  # <-- Save the S3 key, not the URL

    await session.commit()
    profile_photo_url = await run_in_threadpool(get_file_url, key)
    return {
        "detail": "Profile photo updated successfully",
        "profile_photo_url": profile_photo_url,
        "user_id": str(user.id),
        "role": user.role,
        "center_id": str(center.id),
        "center_name": center.center_name
    }


    
#get centeradmin profile api
@router.get("/centeradmin/profile", response_model=dict)
async def get_centeradmin_profile(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Get the logged-in centeradmin's user ID
    admin_id = current_admin["user_id"]

    # Fetch CenterAdmin record
    center_admin = await session.get(CenterAdmin, admin_id)
    if not center_admin:
        raise HTTPException(404, "CenterAdmin not found")

    # Fetch User record (for profile_photo and role)
    user = await session.get(User, admin_id)
    if not user:
        raise HTTPException(404, "User not found")

    # Get the public S3 URL for the profile photo if present
    profile_photo_url = None
    if user.profile_photo:
        # user.profile_photo should be the S3 key
        from app.s3.service import get_file_url
        from fastapi.concurrency import run_in_threadpool
        profile_photo_url = await run_in_threadpool(get_file_url, user.profile_photo)

    return {
        "user_id": str(user.id),
        "role": user.role,
        "profile_photo": profile_photo_url,
        "full_name": center_admin.full_name
    }


@router.get("/center/{center_id}/profile", response_model=CenterOperationalInfoOut)
async def get_center_operational_info(center_id: str, session: AsyncSession = Depends(get_async_session)):
    # Get center with address and operational settings
    result = await session.execute(
        select(Center)
        .where(Center.id == center_id)
        .options(
            selectinload(Center.address),
            selectinload(Center.operational_settings)
        )
    )
    center = result.scalar_one_or_none()
    if not center or not center.address:
        raise HTTPException(status_code=404, detail="Center or address not found")

    # Get operational settings
    op_settings = await session.execute(
        select(CenterOperationalSetting)
        .where(CenterOperationalSetting.center_id == center_id)
    )
    op_setting = op_settings.scalars().first()
    if not op_setting:
        raise HTTPException(status_code=404, detail="Operational settings not found")

    # Get designation id for "Trainer"
    designation_result = await session.execute(
        select(Designation.id)
        .where(Designation.name == "Trainer")
    )
    trainer_designation_ids = designation_result.scalars().all()  # Get all matching designations (in case of multiple "Trainer" entries)
    if not trainer_designation_ids:
        trainers = []
    else:
        trainers_result = await session.execute(
            select(Employee.full_name, Employee.profile_photo)
            .where(Employee.center_id == center_id)
            .where(Employee.designation_id.in_(trainer_designation_ids))
        )
        trainers = [
            TrainerOut(name=row[0], profile_photo=row[1])
            for row in trainers_result.all()
        ]

    # Fetch gallery images
    gallery_result = await session.execute(
        select(CenterGalleryImage).where(CenterGalleryImage.center_id == center_id)
    )
    gallery_images = gallery_result.scalars().all()
    gallery = [
        CenterGalleryImageOut(
            id=img.id,
            center_id=center.id,
            center_name=center.center_name,
            image_url=img.image_url
        ) for img in gallery_images
    ]

    address = center.address
    address_out = AddressOut(
        city=address.city,
        state=address.state,
        country=address.country,
        district=address.district,
        postal_code=address.postal_code,
        address_line_1=address.address_line_1,
        address_line_2=address.address_line_2,
        latitude=float(address.latitude) if address.latitude is not None else None,
        longitude=float(address.longitude) if address.longitude is not None else None,
    )

    # Fetch membership plans for the center
    membership_result = await session.execute(
        select(Membership).where(Membership.center_id == center_id)
    )
    memberships = membership_result.scalars().all()
    membership_plans = [
        {
            "membership_id": str(membership.membership_id),
            "membership_name": membership.membership_name,
            "membership_code": membership.membership_code,
            "description": membership.description,
            "duration_count": membership.duration_count,
            "duration_unit": membership.duration_unit.value if hasattr(membership.duration_unit, "value") else membership.duration_unit,
            "default_price": float(membership.default_price),
            "status": membership.status.value if hasattr(membership.status, "value") else str(membership.status),
        }
        for membership in memberships
    ]

    return CenterOperationalInfoOut(
        center_id=str(center_id),
        center_name=center.center_name,
        about=center.about,
        facilities=center.facilities,
        address=address_out,
        opening_time=op_setting.opening_time.strftime("%H:%M:%S"),
        closing_time=op_setting.closing_time.strftime("%H:%M:%S"),
        current_day=datetime.now().strftime("%A"),
        trainers=trainers,
        gallery=gallery,
        membership_plans=membership_plans  # <-- Added here
    )


#image gallery APIs
# Create image (center admin only)
@router.post("/center/gallery", response_model=CenterGalleryImageOut)
async def create_center_gallery_image(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    file_bytes = await file.read()
    file_ext = file.filename.split('.')[-1]
    key = f"gallery/{center_id}/{uuid4()}.{file_ext}"
    await run_in_threadpool(upload_file, file_bytes, key, file.content_type)
    image_url = await run_in_threadpool(get_file_url, key)

    gallery_image = CenterGalleryImage(
        id=uuid4(),
        center_id=center_id,
        image_url=image_url,
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"]
    )
    session.add(gallery_image)
    await session.commit()
    await session.refresh(gallery_image)
    return CenterGalleryImageOut(
        id=gallery_image.id,
        center_id=center.id,
        center_name=center.center_name,
        image_url=gallery_image.image_url
    )

# List images (member or admin)
@router.get("/center/{center_id}/gallery", response_model=List[CenterGalleryImageOut])
async def list_center_gallery_images(
    center_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")
    result = await session.execute(
        select(CenterGalleryImage).where(CenterGalleryImage.center_id == center_id)
    )
    images = result.scalars().all()
    return [
        CenterGalleryImageOut(
            id=img.id,
            center_id=center.id,
            center_name=center.center_name,
            image_url=get_file_url(img.image_url)  # Always generate a fresh presigned URL
        ) for img in images
    ]

# Get single image (member or admin)
@router.get("/center/gallery/{image_id}", response_model=CenterGalleryImageOut)
async def get_center_gallery_image(
    image_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    img = await session.get(CenterGalleryImage, image_id)
    if not img:
        raise HTTPException(404, "Image not found")
    center = await session.get(Center, img.center_id)
    return CenterGalleryImageOut(
        id=img.id,
        center_id=center.id,
        center_name=center.center_name,
        image_url=img.image_url
    )

# Update image (center admin only)
@router.put("/center/gallery/{image_id}", response_model=CenterGalleryImageOut)
async def update_center_gallery_image(
    image_id: str,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    img = await session.get(CenterGalleryImage, image_id)
    if not img:
        raise HTTPException(404, "Image not found")
    if img.center_id != current_admin["center_id"]:
        raise HTTPException(403, "Not allowed")

    file_bytes = await file.read()
    file_ext = file.filename.split('.')[-1]
    key = f"gallery/{img.center_id}/{uuid4()}.{file_ext}"
    await run_in_threadpool(upload_file, file_bytes, key, file.content_type)
    image_url = await run_in_threadpool(get_file_url, key)
    img.image_url = image_url
    img.updated_by = current_admin["user_id"]
    await session.commit()
    await session.refresh(img)
    center = await session.get(Center, img.center_id)
    return CenterGalleryImageOut(
        id=img.id,
        center_id=center.id,
        center_name=center.center_name,
        image_url=img.image_url
    )

# Delete image (center admin only)
@router.delete("/center/gallery/{image_id}")
async def delete_center_gallery_image(
    image_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    img = await session.get(CenterGalleryImage, image_id)
    if not img:
        raise HTTPException(404, "Image not found")

    admin_center_id = str(current_admin["center_id"])
    is_own_center = str(img.center_id) == admin_center_id

    # Fetch the image's center to check parent relationship
    center = await session.get(Center, img.center_id)
    is_sub_branch = str(center.parent_center_id) == admin_center_id if center and center.parent_center_id else False

    if not (is_own_center or is_sub_branch):
        raise HTTPException(403, "Not allowed")

    await session.delete(img)
    await session.commit()
    return {"detail": "Image deleted"}



@router.get("/centers", response_model=dict)
async def list_centers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    name: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    facilities: Optional[List[str]] = Query(None),
    time_slot_id: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    range_km: Optional[float] = Query(None),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    stmt = select(Center)

    # Search filters
    if name:
        stmt = stmt.where(Center.center_name.ilike(f"%{name}%"))
    if location:
        stmt = stmt.join(Address, Center.address_id == Address.id).where(
            or_(
                Address.city.ilike(f"%{location}%"),
                Address.state.ilike(f"%{location}%"),
                Address.country.ilike(f"%{location}%")
            )
        )

    # Filter by category
    if category_id:
        stmt = stmt.where(Center.center_category_id == category_id)

    # Filter by facilities (array contains all)
    if facilities:
        for facility in facilities:
            stmt = stmt.where(Center.facilities.contains([facility]))

    # Filter by time slot
    if time_slot_id:
        stmt = stmt.join(CenterTimeSlot, Center.id == CenterTimeSlot.center_id).where(
            CenterTimeSlot.id == time_slot_id
        )

    # Filter by membership price
    if min_price is not None or max_price is not None:
        stmt = stmt.join(Membership, Center.id == Membership.center_id)
        if min_price is not None:
            stmt = stmt.where(Membership.default_price >= min_price)
        if max_price is not None:
            stmt = stmt.where(Membership.default_price <= max_price)

    # Get total count (before location filter)
    import sqlalchemy as sa
    count_stmt = stmt.with_only_columns(sa.func.count()).order_by(None)
    total_result = await session.execute(count_stmt)
    total = total_result.scalar_one()

    # Pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(stmt)
    centers = result.scalars().all()

    centers_out = []
    for center in centers:
        address = None
        if center.address_id:
            address = await session.get(Address, center.address_id)
        # Location range filter
        if latitude is not None and longitude is not None and range_km is not None:
            if address and address.latitude is not None and address.longitude is not None:
                distance = haversine(latitude, longitude, float(address.latitude), float(address.longitude))
                if distance > range_km:
                    continue  # Skip centers outside the range
        centers_out.append({
            "id": center.id,
            "center_name": center.center_name,
            "city": address.city if address else None,
            "state": address.state if address else None,
            "country": address.country if address else None,
            "category_id": center.center_category_id,
            "facilities": center.facilities,
            # Add more fields as needed
        })

    # If a member searched a location and no centers found, save to superadmin_info
    user_role = current_user.get("role")
    if user_role == "member" and location and len(centers_out) == 0:
        info = SuperadminInfo(
            searched_location=location,
            searched_by=current_user.get("email")
        )
        session.add(info)
        await session.commit()

    return {
        "total": len(centers_out) if latitude and longitude and range_km else total,
        "page": page,
        "page_size": page_size,
        "centers": centers_out
    }




@router.get("/facilities/all", response_model=List[str])
async def list_all_facilities(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    # Allow access to centeradmin and all members
    user_role = current_user.get("role")
    if user_role not in ("centeradmin", "member"):
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await session.execute(select(Center.facilities))
    facilities_set: Set[str] = set()
    for row in result.scalars().all():
        if row:
            facilities_set.update(row)
    return list(facilities_set)



@router.get("/centers/nearest", response_model=List[dict])
async def list_centers_by_location(
    latitude: float = Query(..., description="Current latitude"),
    longitude: float = Query(..., description="Current longitude"),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    # Allow access only to members and center admins
    user_role = current_user.get("role")
    if user_role not in ("member", "centeradmin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await session.execute(select(Center))
    centers = result.scalars().all()
    centers_with_distance = []

    for center in centers:
        address = None
        if center.address_id:
            address = await session.get(Address, center.address_id)
        if address and address.latitude is not None and address.longitude is not None:
            distance = haversine(latitude, longitude, float(address.latitude), float(address.longitude))
        else:
            distance = float('inf')  # If no location, put at end

        # Fetch gallery images
        gallery_result = await session.execute(
            select(CenterGalleryImage).where(CenterGalleryImage.center_id == center.id)
        )
        gallery_images = gallery_result.scalars().all()
        gallery = [
            {
                "id": str(img.id),
                "image_url": img.image_url
            } for img in gallery_images
        ]

        centers_with_distance.append({
            "id": str(center.id),
            "center_name": center.center_name,
            "distance_km": distance,
            "city": address.city if address else None,
            "state": address.state if address else None,
            "country": address.country if address else None,
            "address": {
                "address_line_1": address.address_line_1,
                "address_line_2": address.address_line_2,
                "city": address.city,
                "state": address.state,
                "country": address.country,
                "postal_code": address.postal_code,
                "latitude": float(address.latitude) if address.latitude is not None else None,
                "longitude": float(address.longitude) if address.longitude is not None else None,
            } if address else None,
            "gallery": gallery
        })

    # Sort by distance ascending
    centers_with_distance.sort(key=lambda x: x["distance_km"])
    return centers_with_distance



#center admin whatsapp number apis
@router.post("/whatsapp/set")
async def set_whatsapp_number(
    number: str,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "centeradmin":
        raise HTTPException(status_code=403, detail="Only centeradmin can set WhatsApp number")
    # Fetch the CenterAdmin to get center_id
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=404, detail="CenterAdmin not found")
    center = await db.get(Center, center_admin.center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    if center.whatsapp_number:
        raise HTTPException(status_code=400, detail="WhatsApp number already set")
    center.whatsapp_number = number
    await db.commit()
    return {"detail": "WhatsApp number set successfully"}



@router.get("/center/whatsapp")
async def get_center_whatsapp_number(
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    role = current_user["role"]
    user_id = current_user["user_id"]

    if role == "centeradmin":
        # Get the center for the centeradmin
        center_admin = await db.get(CenterAdmin, user_id)
        if not center_admin:
            raise HTTPException(status_code=404, detail="CenterAdmin not found")
        center = await db.get(Center, center_admin.center_id)
        if not center:
            raise HTTPException(status_code=404, detail="Center not found")
        return {
            "whatsapp_number": center.whatsapp_number
        }

    elif role == "member":
        # Get the member's center
        member = await db.get(Member, user_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        center = await db.get(Center, member.home_center_id)
        if not center:
            raise HTTPException(status_code=404, detail="Center not found")
        return {
            "whatsapp_number": center.whatsapp_number,
            "center_phone": center.center_phone
        }

    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    


#List all accessible centers for the current center admin.
@router.get("/centers/accessible-centers", summary="List centers (ID and name only) for center admin")
async def list_centers_for_admin(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required)
):
    """
    List all accessible centers for the current center admin.
    - If parent center admin: returns parent center + all active sub-centers
    - If sub-center admin: returns only their own center
    
    Returns only center ID and name for dropdown/lookup purposes.
    """
    from app.auth.models.models import CenterAdmin
    
    # Get center_id from current_admin
    admin_center_id = current_admin.get("center_id")
    if not admin_center_id:
        raise HTTPException(status_code=403, detail="Center ID not found")
    
    # Get the admin's center details
    admin_center_query = select(Center).where(Center.id == admin_center_id)
    admin_center_result = await db.execute(admin_center_query)
    admin_center = admin_center_result.scalar_one_or_none()
    
    if not admin_center:
        raise HTTPException(status_code=404, detail="Center not found")
    
    centers_list = []
    
    # Check if this is a parent center (parent_center_id is None)
    if admin_center.parent_center_id is None:
        # This is a parent center admin - include parent + all sub-centers
        
        # Add parent center
        centers_list.append({
            "id": str(admin_center.id),
            "center_name": admin_center.center_name,
            "is_parent": True,
            "center_status": admin_center.center_status.value if hasattr(admin_center.center_status, 'value') else str(admin_center.center_status)
        })
        
        # Get all active sub-centers
        sub_centers_query = select(Center).where(
            and_(
                Center.parent_center_id == admin_center_id,
                Center.center_status == CenterStatus.active
            )
        ).order_by(Center.center_name)
        
        sub_centers_result = await db.execute(sub_centers_query)
        sub_centers = sub_centers_result.scalars().all()
        
        for sub_center in sub_centers:
            centers_list.append({
                "id": str(sub_center.id),
                "center_name": sub_center.center_name,
                "is_parent": False,
                "parent_center_id": str(sub_center.parent_center_id),
                "center_status": sub_center.center_status.value if hasattr(sub_center.center_status, 'value') else str(sub_center.center_status)
            })
    
    else:
        # This is a sub-center admin - return only their own center
        centers_list.append({
            "id": str(admin_center.id),
            "center_name": admin_center.center_name,
            "is_parent": False,
            "parent_center_id": str(admin_center.parent_center_id),
            "center_status": admin_center.center_status.value if hasattr(admin_center.center_status, 'value') else str(admin_center.center_status)
        })
    
    return {
        "total_centers": len(centers_list),
        "admin_center_id": str(admin_center_id),
        "is_parent_admin": admin_center.parent_center_id is None,
        "centers": centers_list
    }