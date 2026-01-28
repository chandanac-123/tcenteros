# app/center/api/routes.py
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.center.models.models import CenterOnboardingTemp, Center
from app.settings.models.models import CenterCategory, Address, TaxCategory
from app.platforms.models.models import PlatformFeature, CenterFeatureSubscription
from app.billing.models.models import PaymentOrder
from app.auth.models.models import CenterAdmin, User
from app.core.models.models import StatusEnum
from app.center.schema.schema import *
from datetime import datetime
from sqlalchemy.future import select
from app.core.database import get_async_session

router = APIRouter()

# 1. POST /center/onboarding/temp
@router.post("/onboarding/temp", response_model=CenterOnboardingTempOut)
async def create_onboarding_temp(
    data: CenterOnboardingTempCreate,
    db: AsyncSession = Depends(get_async_session)
):
    temp = CenterOnboardingTemp(**data.dict())
    db.add(temp)
    await db.commit()
    await db.refresh(temp)
    return temp

# 4. GET /center/onboarding/calculate
@router.get("/onboarding/calculate", response_model=GSTCalculationResponse)
async def calculate_gst(
    selected_features: List[UUID] = Query(..., description="List of feature UUIDs"),
    onboarding_id: Optional[UUID] = Query(None, description="Onboarding temp UUID"),
    db: AsyncSession = Depends(get_async_session)
):
    total_base = 0.0
    for feature_id in selected_features:
        feature = await db.get(PlatformFeature, feature_id)
        if not feature:
            raise HTTPException(404, f"Feature {feature_id} not found")
        total_base += float(feature.base_price)

    tax = await db.execute(
        select(TaxCategory)
        .where(TaxCategory.tax_scope == "center_subscription", TaxCategory.is_active == True)
        .limit(1)
    )
    tax = tax.scalar_one_or_none()
    total_tax = 0.0
    if tax:
        total_tax = total_base * float(tax.tax_percentage) / 100

    # Update calculated_amount in CenterOnboardingTemp if onboarding_id is provided
    if onboarding_id:
        temp = await db.get(CenterOnboardingTemp, onboarding_id)
        if temp:
            temp.calculated_amount = total_base
            await db.commit()
            await db.refresh(temp)

    return GSTCalculationResponse(
        total_base_price=total_base,
        total_tax=total_tax,
        total_amount=total_base + total_tax
    )

# 5. POST /billing/payment-order
@router.post("/billing/payment-order", response_model=PaymentOrderOut)
async def create_payment_order(
    data: PaymentOrderCreate,
    db: AsyncSession = Depends(get_async_session)
):
    # You may want to check onboarding temp exists and amount matches calculation
    payment = PaymentOrder(
        payment_order_id=uuid.uuid4(),
        amount=data.amount,
        status="pending"
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return PaymentOrderOut(
        payment_order_id=payment.payment_order_id,
        status=payment.status,
        amount=float(payment.amount)
    )

# 6. POST /center/onboarding/finalize
@router.post("/onboarding/finalize")
async def finalize_onboarding(
    req: FinalizeOnboardingRequest,
    db: AsyncSession = Depends(get_async_session)
):
    temp = await db.get(CenterOnboardingTemp, req.onboarding_id)
    if not temp:
        raise HTTPException(404, "Onboarding temp not found")
    payment = await db.get(PaymentOrder, req.payment_order_id)
    if not payment or payment.status != "success":
        raise HTTPException(400, "Payment not successful")
    # 1. Create Address
    address = Address(city=temp.city)
    db.add(address)
    await db.flush()
    # 2. Create Center
    center = Center(
        center_name=temp.center_name,
        center_category_id=temp.center_category_id,
        address_id=address.id,
        approval_status="approved",
        center_status="active"
    )
    db.add(center)
    await db.flush()
    # 3. Create CenterAdmin (and User if needed)
    user = await db.execute(select(User).where(User.email == temp.admin_email))
    user = user.scalar_one_or_none()
    if not user:
        user = User(email=temp.admin_email, full_name=temp.admin_name, role="center_admin")
        db.add(user)
        await db.flush()
    admin = CenterAdmin(user_id=user.id, center_id=center.id)
    db.add(admin)
    # 4. Create CenterFeatureSubscription for each feature
    for feature_id in temp.selected_features:
        feature = await db.get(PlatformFeature, feature_id)
        tax = await db.execute(
            select(TaxCategory)
            .where(TaxCategory.tax_scope == "center_subscription", TaxCategory.is_active == True)
            .limit(1)
        )
        tax = tax.scalar_one_or_none()
        sub = CenterFeatureSubscription(
            center_id=center.id,
            feature_id=feature_id,
            payment_order_id=payment.payment_order_id,
            pricing_type="yearly",
            unit_price=feature.base_price,
            tax_category_id=tax.id if tax else None,
            start_date=datetime.utcnow(),
            status=StatusEnum.active
        )
        db.add(sub)
    await db.commit()
    await db.delete(temp)
    await db.commit()
    return {"detail": "Onboarding finalized and center created."}