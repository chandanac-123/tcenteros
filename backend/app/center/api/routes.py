# app/center/api/routes.py
import email
from sqlite3 import IntegrityError
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import List, Optional
import uuid
import traceback
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.center.models.models import CenterOnboardingTemp, Center, CenterTimeSlot
from app.settings.models.models import CenterCategory, Address, TaxCategory
from app.platforms.models.models import PlatformFeature, CenterFeatureSubscription
from app.billing.models.models import PaymentOrder
from app.auth.models.models import CenterAdmin, User
from app.core.models.models import StatusEnum
from app.center.schema.schema import *
from datetime import datetime
from sqlalchemy.future import select
from app.core.database import get_async_session
from uuid import uuid4
from app.core.dependencies import centeradmin_required, get_db, get_current_user
from app.core.security import get_password_hash

router = APIRouter()

# 1. POST /center/onboarding/temp
@router.post("/onboarding/temp", response_model=CenterOnboardingTempOut)
async def create_onboarding_temp(
    data: CenterOnboardingTempCreate,
    db: AsyncSession = Depends(get_async_session)
):
    # Convert UUIDs to strings for JSON storage
    feature_ids = [str(fid) for fid in data.platform_feature_ids]

    # Sum the base price of each selected feature
    total_base = 0.0
    for feature_id in data.platform_feature_ids:
        feature = await db.get(PlatformFeature, feature_id)
        if not feature:
            raise HTTPException(404, f"Feature {feature_id} not found")
        total_base += float(feature.base_price)

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
        platform_feature_ids=feature_ids,  # store as list of strings
        is_terms_and_conditions=data.is_terms_and_conditions,
        calculated_amount=total_base
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
    temp = await db.get(CenterOnboardingTemp, onboarding_id)
    if not temp:
        raise HTTPException(404, detail="Onboarding temp not found")

    # Fetch center category info
    category = await db.get(CenterCategory, temp.center_category_id)
    category_info = None
    if category:
        category_info = {
            "id": category.id,
            "name": category.name
        }

    # Fetch platform features info
    feature_ids = temp.platform_feature_ids or []
    features = []
    for fid in feature_ids:
        feature = await db.get(PlatformFeature, fid)
        if feature:
            features.append({
                "id": feature.id,
                "feature_name": feature.feature_name,
                "description": feature.description
            })

    return {
        "id": temp.id,
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
        "calculated_amount": float(temp.calculated_amount)
    }


@router.get("/onboarding/calculate", response_model=GSTCalculationResponse)
async def calculate_gst(
    onboarding_id: UUID = Query(..., description="Onboarding temp UUID"),
    db: AsyncSession = Depends(get_async_session)
):
    temp = await db.get(CenterOnboardingTemp, onboarding_id)
    if not temp:
        raise HTTPException(404, "Onboarding temp not found")

    feature_ids = temp.platform_feature_ids or []
    if not isinstance(feature_ids, list):
        raise HTTPException(400, "platform_feature_ids must be a list of UUIDs")

    total_base = 0.0
    for feature_id in feature_ids:
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
    tax_info = None
    if tax:
        total_tax = total_base * float(tax.tax_percentage) / 100
        tax_info = {
            "id": str(tax.id),
            "name": tax.name,
            "tax_type": tax.tax_type.value,
            "tax_percentage": float(tax.tax_percentage),
            "tax_scope": tax.tax_scope.value
        }

    # Store the final amount (base + tax) in calculated_amount
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
        tax=tax_info
    )

# 5. POST /billing/onboarding/finalize
# 5. POST /billing/onboarding/finalize
@router.post('/billing/onboarding/finalize/{onboarding_id}', response_model=OnboardingFinalizeResponse)
async def finalize_onboarding(
    onboarding_id: UUID = Path(..., description="Onboarding temp UUID"),
    payload: FinalizeOnboardingRequest = ...,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Fetch onboarding temp data
        onboarding_temp = await db.get(CenterOnboardingTemp, onboarding_id)
        if not onboarding_temp:
            raise HTTPException(status_code=404, detail="Onboarding data not found")
        if not onboarding_temp.center_email:
            raise HTTPException(status_code=400, detail="Center email is required to create a user.")

        # 2. Check if user already exists
        user_stmt = select(User).where(User.email == onboarding_temp.center_email)
        result = await db.execute(user_stmt)
        user = result.scalar_one_or_none()
        if user:
            raise HTTPException(status_code=400, detail="A user with this email already exists.")

        # 3. Create Address (no center_id)
        address = Address(
            id=uuid4(),
            address_line_1=payload.address_line_1,
            address_line_2=payload.address_line_2,
            city=onboarding_temp.city,
            state=getattr(onboarding_temp, "state", None),
            country=getattr(onboarding_temp, "country", None),
            postal_code=getattr(onboarding_temp, "postal_code", None),
            created_by=None,  # Will set after CenterAdmin is created
            updated_by=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(address)
        await db.flush()

        # 4. Create Center and assign address_id
        center = Center(
            id=uuid4(),
            center_name=onboarding_temp.center_name,
            center_category_id=onboarding_temp.center_category_id,
            address_id=address.id,
            gst_number=payload.gst_number,
            currently_using_digital_tool=onboarding_temp.currently_using_digital_tool,
            marketing_platform=onboarding_temp.marketing_platform,
            kind_of_center=onboarding_temp.kind_of_center,
            members_count=onboarding_temp.members_count,
            trainer_count=onboarding_temp.trainer_count,
            center_phone=onboarding_temp.center_phone,
            center_email=onboarding_temp.center_email,
            contact_person=onboarding_temp.contact_person,
            approval_status="approved",
            center_status="active",
            network_enabled=True,
            created_by=None,  # Will set after CenterAdmin is created
            updated_by=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(center)
        await db.flush()

        # 5. Create CenterAdmin (this will also create the User row)
        center_admin = CenterAdmin(
            id=uuid4(),
            email=onboarding_temp.center_email,
            password_hash=get_password_hash("defaultpassword123"),
            role="centeradmin",
            status=StatusEnum.active,
            full_name=onboarding_temp.contact_person or "Center Admin",
            center_id=center.id,
            address_id=address.id,
            created_by=None,  # Will set after flush
            updated_by=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(center_admin)
        await db.flush()

        # Now update created_by/updated_by fields with center_admin.id
        address.created_by = center_admin.id
        address.updated_by = center_admin.id
        center.created_by = center_admin.id
        center.updated_by = center_admin.id
        center_admin.created_by = center_admin.id
        center_admin.updated_by = center_admin.id
        await db.flush()

        # 6. Create PaymentOrder
        payment_order = PaymentOrder(
            payment_order_id=uuid4(),
            center_id=center.id,
            payer_user_id=center_admin.id,
            payer_type="center_admin",
            payee_type="platform",
            order_type="center_subscription",
            reference_schema="center_feature",
            reference_id=center.id,
            subtotal_amount=getattr(onboarding_temp, "calculated_amount", 0.0),
            tax_amount=getattr(onboarding_temp, "tax_amount", 0.0),
            total_amount=getattr(onboarding_temp, "calculated_amount", 0.0),
            currency="INR",
            status="paid",
            created_by=center_admin.id,
            updated_by=center_admin.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(payment_order)
        await db.flush()

        # 7. Now create CenterFeatureSubscriptions with payment_order_id
        feature_subscriptions = []
        from collections import OrderedDict
        feature_ids = list(OrderedDict.fromkeys(onboarding_temp.platform_feature_ids))
        for feature_id in feature_ids:
            feature = await db.get(PlatformFeature, feature_id)
            if not feature:
                raise HTTPException(status_code=404, detail=f"Feature {feature_id} not found")
            start_date = datetime.utcnow()
            end_date = start_date + relativedelta(years=1)
            subscription = CenterFeatureSubscription(
                id=uuid4(),
                center_id=center.id,
                feature_id=feature_id,
                payment_order_id=payment_order.payment_order_id,
                pricing_type="yearly",
                unit_price=feature.base_price,
                status=StatusEnum.active,
                start_date=start_date,
                end_date=end_date,
                created_by=center_admin.id,
                updated_by=center_admin.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(subscription)
            feature_subscriptions.append(subscription)
        await db.flush()

        # 8. Commit transaction
        await db.commit()

        # 9. Prepare response
        response = OnboardingFinalizeResponse(
            center=CenterInfo.from_orm(center),
            center_admin=CenterAdminInfo.from_orm(center_admin),
            payment=PaymentOrderInfo.from_orm(payment_order),
            feature_subscriptions=[
                FeatureSubscriptionInfo.from_orm(fs) for fs in feature_subscriptions
            ],
        )
        return response

    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Integrity error: {str(e.orig)}")
    except Exception as e:
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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
    center = await session.get(Center, data.center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    address = center.address
    if not address:
        raise HTTPException(status_code=404, detail="Center address not found")
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