from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.dependencies import get_current_user, centeradmin_required, member_required
from app.billing.models.models import PaymentOrder, PaymentOrderStatus,  PayerType, PayeeType, OrderType, ReferenceSchema, Currency
from app.networking.schema.schema import NetworkingAccessRequest
from app.center.models.models import CenterWallet, WalletTransaction
from app.platforms.models.models import PlatformWallet
from uuid import uuid4
from datetime import datetime
from app.auth.models.models import Member, MemberStatusEnum
from app.core.database import get_async_session
from app.center.models.models import Center
from app.settings.models.models import Address

router = APIRouter()

@router.get("/centers/network-enabled-cities")
async def list_network_enabled_cities(
    session: AsyncSession = Depends(get_async_session)
):
    """
    List distinct cities of centers where network_enabled is True.
    Accessible to all users.
    """
    result = await session.execute(
        select(Address.city)
        .join(Center, Center.address_id == Address.id)
        .where(Center.network_enabled == True)
        .distinct()
    )
    cities = [row[0] for row in result.all() if row[0]]
    return {"cities": cities}

@router.get("/centers/network-enabled")
async def list_network_enabled_centers(
    city: str = Query(None, description="Filter centers by city"),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    # Build the base query
    stmt = (
        select(Center, Address)
        .join(Address, Center.address_id == Address.id)
        .where(Center.network_enabled == True)
    )
    if city:
        stmt = stmt.where(Address.city.ilike(city))

    centers_result = await session.execute(stmt)
    centers_with_address = centers_result.all()

    response = []
    for center, address_obj in centers_with_address:
        # Count active members for this center
        members_result = await session.execute(
            select(func.count(Member.id))
            .where(
                Member.home_center_id == center.id,
                Member.member_status == MemberStatusEnum.member
            )
        )
        active_members_count = members_result.scalar_one()

        address = {
            "address_line_1": address_obj.address_line_1,
            "address_line_2": address_obj.address_line_2,
            "city": address_obj.city,
            "district": address_obj.district,
            "state": address_obj.state,
            "country": address_obj.country,
            "postal_code": address_obj.postal_code,
        }

        response.append({
            "center_id": str(center.id),
            "center_name": center.center_name,
            "active_members": active_members_count,
            "address": address
        })

    return {"centers": response}


# Set Networking Amount (CenterAdmin Only)
@router.put("/center/networking-amount")
async def set_networking_amount(
    amount: float,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center = await session.get(Center, current_admin["center_id"])
    if not center:
        raise HTTPException(404, "Center not found")
    center.networking_amount = amount
    await session.commit()
    return {"detail": "Networking amount set", "networking_amount": float(center.networking_amount)}



#Get Networking Amount (All Users)
@router.get("/center/{center_id}/networking-amount")
async def get_networking_amount(
    center_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(404, "Center not found")
    return {"center_id": center_id, "networking_amount": float(center.networking_amount or 0)}



# Networking Access Request & Payment (Member)
@router.post("/networking/access")
async def request_networking_access(
    network_center_id: str = Query(..., description="Target networking center UUID"),
    payload: NetworkingAccessRequest = ...,
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    # 1. Validate network center and wallet
    network_center = await session.get(Center, network_center_id)
    if not network_center or not network_center.network_enabled:
        raise HTTPException(404, "Networking center not found or not enabled")
    network_wallet = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == network_center_id)
    )
    network_wallet = network_wallet.scalar_one_or_none()
    if not network_wallet or network_wallet.deposit < 2000 or network_wallet.balance < 10000:
        raise HTTPException(400, "Network center wallet does not meet requirements")

    # 2. Calculate fee
    per_day = float(network_center.networking_amount or 0)
    d1 = datetime.strptime(payload.start_date, "%Y-%m-%d").date()
    d2 = datetime.strptime(payload.end_date, "%Y-%m-%d").date()
    total_days = (d2 - d1).days + 1
    if total_days < 1:
        raise HTTPException(400, "End date must be after or equal to start date")
    total_amount = per_day * total_days
    platform_share = total_amount * 0.15
    center_share = total_amount - platform_share

    # 3. Home center wallet
    member = await session.get(Member, current_member["user_id"])
    home_wallet = await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == member.home_center_id)
    )
    home_wallet = home_wallet.scalar_one_or_none()
    if not home_wallet or home_wallet.balance < center_share:
        raise HTTPException(400, "Insufficient home center wallet balance")
    home_wallet.balance -= center_share
    network_wallet.balance += center_share

    # 4. Platform wallet
    platform_wallet = await session.execute(select(PlatformWallet))
    platform_wallet = platform_wallet.scalar_one_or_none()
    if platform_wallet:
        platform_wallet.balance += platform_share

    # 5. Create PaymentOrder (status paid)
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        payer_user_id=member.id,
        payer_type=PayerType.user,
        payee_type=PayeeType.center,
        center_id=network_center.id,
        order_type=OrderType.center_subscription,
        reference_schema=ReferenceSchema.center,
        reference_id=network_center.id,
        subtotal_amount=total_amount,
        tax_amount=0,
        total_amount=total_amount,
        currency=Currency.INR,
        status=PaymentOrderStatus.paid,
        created_by=member.id,
        updated_by=member.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(payment_order)

    # 6. Log transactions
    session.add(WalletTransaction(
        id=uuid4(),
        from_wallet_id=home_wallet.id,
        to_wallet_id=network_wallet.id,
        amount=center_share,
        transaction_type="networking_transfer",
        description="Networking access transfer"
    ))
    if platform_wallet:
        session.add(WalletTransaction(
            id=uuid4(),
            platform_wallet_id=platform_wallet.id,
            amount=platform_share,
            transaction_type="platform_income",
            description="Platform income from networking"
        ))

    # 7. Create network member
    network_member = Member(
        id=uuid4(),
        email=member.email,
        username=member.username,
        password_hash=member.password_hash,
        role="member",
        status=member.status,
        gender=member.gender,
        mobile=member.mobile,
        profile_photo=member.profile_photo,
        home_center_id=network_center_id,
        network_center_id=network_center_id,
        network_eligible=True,
        date_of_birth=member.date_of_birth,
        blood_group=member.blood_group,
        time_slot_id=payload.time_slot_id,
        member_status=member.member_status,
        created_by=member.id,
        updated_by=member.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(network_member)
    await session.commit()
    return {
        "detail": "Networking access granted",
        "network_member_id": str(network_member.id),
        "network_center_id": network_center_id,
        "home_center_id": str(member.home_center_id),
        "amount": total_amount,
        "platform_income": platform_share,
        "transferred_to_network_center": center_share,
        "payment_order_id": str(payment_order.payment_order_id)
    }