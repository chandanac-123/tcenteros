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
from app.center.models.models import CenterOnboardingTemp, Center, CenterTimeSlot, CenterWallet, WalletTransaction, CenterGalleryImage
from app.settings.models.models import CenterCategory,Designation, Address, TaxCategory, CenterOperationalSetting
from app.platforms.models.models import PlatformFeature, CenterFeatureSubscription, PlatformWallet
from app.billing.models.models import PaymentOrder
from app.auth.models.models import CenterAdmin, User, Employee
from app.core.models.models import StatusEnum
from app.center.schema.schema import *
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_async_session
from uuid import uuid4
from app.core.dependencies import centeradmin_required, get_db, get_current_user
from app.core.security import get_password_hash
from app.s3.service import upload_file, get_file_url
from fastapi.concurrency import run_in_threadpool
from math import radians, cos, sin, asin, sqrt
from sqlalchemy import or_
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
@router.post("/center/wallet/create")
async def create_center_wallet(
    deposit: float,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    # Check if wallet already exists
    wallet_result = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )
    wallet = wallet_result.scalar_one_or_none()
    if wallet:
        raise HTTPException(400, "Wallet already exists for this center")

    # Create wallet
    wallet = CenterWallet(
        id=uuid4(),
        center_id=center_id,
        balance=deposit,
        deposit=deposit,
        min_balance=10000,
        min_deposit=2000,
        last_updated=datetime.utcnow(),
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(wallet)
    await session.commit()
    await session.refresh(wallet)
    return {
        "center_id": str(center_id),
        "wallet_id": str(wallet.id),
        "balance": float(wallet.balance),
        "deposit": float(wallet.deposit),
        "min_balance": float(wallet.min_balance),
        "min_deposit": float(wallet.min_deposit)
    }

#Get Center Wallet
@router.get("/center/{center_id}/wallet")
async def get_center_wallet(
    center_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    wallet = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )
    wallet = wallet.scalar_one_or_none()
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    return {
        "center_id": center_id,
        "balance": float(wallet.balance),
        "deposit": float(wallet.deposit),
        "min_balance": float(wallet.min_balance),
        "min_deposit": float(wallet.min_deposit)
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
@router.get("/center/{center_id}/wallet/transactions")
async def list_wallet_transactions(
    center_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    wallet = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == center_id)
    )
    wallet = wallet.scalar_one_or_none()
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    txs = await session.execute(
        select(WalletTransaction)
        .where((WalletTransaction.from_wallet_id == wallet.id) | (WalletTransaction.to_wallet_id == wallet.id))
        .order_by(WalletTransaction.created_at.desc())
    )
    return [
        {
            "id": str(tx.id),
            "from_wallet_id": str(tx.from_wallet_id) if tx.from_wallet_id else None,
            "to_wallet_id": str(tx.to_wallet_id) if tx.to_wallet_id else None,
            "platform_wallet_id": str(tx.platform_wallet_id) if tx.platform_wallet_id else None,
            "amount": float(tx.amount),
            "transaction_type": tx.transaction_type,
            "description": tx.description,
            "created_at": tx.created_at
        }
        for tx in txs.scalars().all()
    ]


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


@router.put("/center/profile/update")
async def update_center_profile(
    data: CenterProfileUpdate = Body(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")

    # Update Center fields (except address)
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field != "address" and hasattr(center, field):
            setattr(center, field, value)

    # Update Address if present
    address_data = None
    if "address" in update_data and update_data["address"]:
        if not center.address_id:
            raise HTTPException(400, "Center has no address to update")
        address = await session.get(Address, center.address_id)
        if not address:
            raise HTTPException(404, "Address not found")
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

    # Prepare updated response
    updated_center = {
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
        "address": address_data,
    }

    return {
        "detail": "Center profile updated successfully",
        "updated_center": updated_center
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
    await run_in_threadpool(upload_file, file_bytes, key, profile_photo.content_type)
    profile_photo_url = await run_in_threadpool(get_file_url, key)
    user.profile_photo_url = profile_photo_url

    await session.commit()
    return {
        "detail": "Profile photo updated successfully",
        "profile_photo_url": profile_photo_url,
        "center_id": str(center.id),
        "center_name": center.center_name
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
    op_setting = op_settings.scalar_one_or_none()
    if not op_setting:
        raise HTTPException(status_code=404, detail="Operational settings not found")

    # Get designation id for "Trainer"
    designation_result = await session.execute(
        select(Designation.id)
        .where(Designation.name == "Trainer")
    )
    trainer_designation_id = designation_result.scalar_one_or_none()
    if not trainer_designation_id:
        trainers = []
    else:
        trainers_result = await session.execute(
            select(Employee.full_name, Employee.profile_photo)
            .where(Employee.center_id == center_id)
            .where(Employee.designation_id == trainer_designation_id)
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
        gallery=gallery
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
            image_url=img.image_url
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
    if img.center_id != current_admin["center_id"]:
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
    facilities: Optional[List[str]] = Query(None),  # e.g. ?facilities=wifi&facilities=parking
    time_slot_id: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    latitude: Optional[float] = Query(None),  # User's current latitude
    longitude: Optional[float] = Query(None), # User's current longitude
    range_km: Optional[float] = Query(None),  # Range in km
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

