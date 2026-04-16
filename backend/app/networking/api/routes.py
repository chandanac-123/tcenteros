from fastapi import APIRouter, Depends, Query, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.dependencies import get_current_user, centeradmin_required, member_required
from app.billing.models.models import PaymentMethod, PaymentOrder, PaymentOrderStatus,  PayerType, PayeeType, OrderType, ReferenceSchema, Currency
from app.networking.schema.schema import NetworkingAccessRequest
from app.center.models.models import CenterWallet, WalletTransaction
from app.auth.models.models import NetworkingStatusEnum, UserCenterMembership, MemberStatusEnum, CenterAdmin
from app.platforms.models.models import PlatformWallet
from uuid import uuid4
from datetime import datetime
from app.auth.models.models import Member, MemberStatusEnum
from app.core.database import get_async_session
from app.center.models.models import Center
from app.settings.models.models import Address
from decimal import Decimal
from app.accounts.networking_helper import post_networking_access_journal   

router = APIRouter()

#list both network enabled cities and not enabled cities 
@router.get("/centers/network-enabled-cities")
async def list_all_center_cities(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    """
    List distinct cities of all centers (network_enabled True or False), case-insensitive.
    """
    result = await session.execute(
        select(Address.city)
        .join(Center, Center.address_id == Address.id)
        .distinct()
    )
    # Normalize to title case and deduplicate
    cities = [row[0].strip().title() for row in result.all() if row[0]]
    unique_cities = sorted(set(cities))
    return {"cities": unique_cities}


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


@router.get("/networking/calculate-amount")
async def calculate_networking_amount(
    network_center_id: str = Query(..., description="Target networking center UUID"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD"),
    time_slot_id: str = Query(..., description="Time slot UUID"),
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    """
    Calculate the payable networking amount for a member for the given period and time slot.
    """
    from decimal import Decimal
    from datetime import datetime

    # 1. Validate network center
    network_center = await session.get(Center, network_center_id)
    if not network_center or not network_center.network_enabled:
        raise HTTPException(404, "Networking center not found or not enabled")

    # 2. Calculate fee
    per_day = Decimal(str(network_center.networking_amount or 0))
    try:
        d1 = datetime.strptime(start_date, "%Y-%m-%d").date()
        d2 = datetime.strptime(end_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD.")

    total_days = (d2 - d1).days + 1
    if total_days < 1:
        raise HTTPException(400, "End date must be after or equal to start date")
    total_amount = per_day * Decimal(total_days)
    platform_share = total_amount * Decimal("0.15")
    center_share = total_amount - platform_share

    return {
        "network_center_id": network_center_id,
        "time_slot_id": time_slot_id,
        "start_date": start_date,
        "end_date": end_date,
        "total_days": total_days,
        "amount_payable": float(total_amount),
        "platform_income": float(platform_share),
        "transferred_to_network_center": float(center_share)
    }




# Networking Access Request & Payment (Member)
# @router.post("/networking/access")
# async def request_networking_access(
#     network_center_id: str = Query(..., description="Target networking center UUID"),
#     payload: NetworkingAccessRequest = ...,
#     session: AsyncSession = Depends(get_async_session),
#     current_member=Depends(member_required)
# ):
#     # 1. Validate network center and wallet
#     network_center = await session.get(Center, network_center_id)
#     if not network_center or not network_center.network_enabled:
#         raise HTTPException(404, "Networking center not found or not enabled")
#     network_wallet = await session.execute(
#         select(CenterWallet).where(CenterWallet.center_id == network_center_id)
#     )
#     network_wallet = network_wallet.scalar_one_or_none()
#     if not network_wallet or network_wallet.deposit < 2000 or network_wallet.balance < 10000:
#         raise HTTPException(400, "Network center wallet does not meet requirements")

#     # 2. Calculate fee
#     per_day = Decimal(str(network_center.networking_amount or 0))
#     d1 = datetime.strptime(payload.start_date, "%Y-%m-%d").date()
#     d2 = datetime.strptime(payload.end_date, "%Y-%m-%d").date()
#     total_days = (d2 - d1).days + 1
#     if total_days < 1:
#         raise HTTPException(400, "End date must be after or equal to start date")
#     total_amount = per_day * Decimal(total_days)
#     platform_share = total_amount * Decimal("0.15")
#     center_share = total_amount - platform_share

#     # 3. Home center wallet
#     member = await session.get(Member, current_member["user_id"])
#     home_wallet = await session.execute(
#         select(CenterWallet).where(CenterWallet.center_id == member.home_center_id)
#     )
#     home_wallet = home_wallet.scalar_one_or_none()
#     if not home_wallet or home_wallet.balance < center_share:
#         raise HTTPException(400, "Insufficient home center wallet balance")
#     home_wallet.balance -= center_share
#     network_wallet.balance += center_share

#     # 4. Platform wallet
#     platform_wallet = await session.execute(select(PlatformWallet))
#     platform_wallet = platform_wallet.scalar_one_or_none()
#     if platform_wallet:
#         platform_wallet.balance += platform_share

#     # 5. Create PaymentOrder (status paid)
#     payment_order = PaymentOrder(
#         payment_order_id=uuid4(),
#         payer_user_id=member.id,
#         payer_type=PayerType.user,
#         payee_type=PayeeType.center,
#         center_id=network_center.id,
#         order_type=OrderType.center_subscription,
#         reference_schema=ReferenceSchema.center,
#         reference_id=network_center.id,
#         subtotal_amount=total_amount,
#         tax_amount=Decimal("0"),
#         total_amount=total_amount,
#         currency=Currency.INR,
#         status=PaymentOrderStatus.paid,
#         created_by=member.id,
#         updated_by=member.id,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow(),
#     )
#     session.add(payment_order)

#     # 6. Log transactions
#     session.add(WalletTransaction(
#         id=uuid4(),
#         from_wallet_id=home_wallet.id,
#         to_wallet_id=network_wallet.id,
#         amount=center_share,
#         transaction_type="networking_transfer",
#         description="Networking access transfer"
#     ))
#     if platform_wallet:
#         session.add(WalletTransaction(
#             id=uuid4(),
#             platform_wallet_id=platform_wallet.id,
#             amount=platform_share,
#             transaction_type="platform_income",
#             description="Platform income from networking"
#         ))

#     # 7. Create or update UserCenterMembership for networking
#     from app.auth.models.models import UserCenterMembership, MemberStatusEnum

#     # Check if membership already exists for this user and center
#     existing_membership = await session.execute(
#         select(UserCenterMembership).where(
#             UserCenterMembership.user_id == member.id,
#             UserCenterMembership.center_id == network_center_id
#         )
#     )
#     existing_membership = existing_membership.scalar_one_or_none()

#     if existing_membership:
#         # Optionally update membership details (dates, time slot, status)
#         existing_membership.time_slot_id = payload.time_slot_id
#         existing_membership.start_date = d1
#         existing_membership.end_date = d2
#         existing_membership.member_status = MemberStatusEnum.network_member  
#         existing_membership.updated_by = member.id
#         existing_membership.updated_at = datetime.utcnow()
#         network_membership_id = existing_membership.id
#     else:
#         # Create new membership record
#         network_membership = UserCenterMembership(
#             id=uuid4(),
#             user_id=member.id,
#             center_id=network_center_id,
#             time_slot_id=payload.time_slot_id,
#             member_status=MemberStatusEnum.network_member,  
#             network_eligible=True,
#             start_date=d1,
#             end_date=d2,
#             created_by=member.id,
#             updated_by=member.id,
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow(),
#         )
#         session.add(network_membership)
#         await session.flush()
#         network_membership_id = network_membership.id

#     await session.commit()
#     return {
#         "detail": "Networking access granted",
#         "network_membership_id": str(network_membership_id),
#         "network_center_id": network_center_id,
#         "home_center_id": str(member.home_center_id),
#         "amount": float(total_amount),
#         "platform_income": float(platform_share),
#         "transferred_to_network_center": float(center_share),
#         "payment_order_id": str(payment_order.payment_order_id)
#     }



#Member: Make Networking Access Request
@router.post("/networking/access")
async def request_networking_access(
    network_center_id: str = Query(..., description="Target networking center UUID"),
    payload: NetworkingAccessRequest = ...,
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    from decimal import Decimal
    from datetime import datetime
    from app.auth.models.models import UserCenterMembership, MemberStatusEnum, NetworkingStatusEnum, Member

    # Validate network center
    network_center = await session.get(Center, network_center_id)
    if not network_center or not network_center.network_enabled:
        raise HTTPException(404, "Networking center not found or not enabled")

    # Parse dates
    try:
        d1 = datetime.strptime(payload.start_date, "%Y-%m-%d").date()
        d2 = datetime.strptime(payload.end_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD.")

    if (d2 - d1).days < 0:
        raise HTTPException(400, "End date must be after or equal to start date")

    member = await session.get(Member, current_member["user_id"])

    # Check for any existing membership for this user with overlapping dates
    overlap_query = select(UserCenterMembership).where(
        UserCenterMembership.user_id == member.id,
        UserCenterMembership.start_date <= d2,
        UserCenterMembership.end_date >= d1
    )
    overlap_result = await session.execute(overlap_query)
    overlapping_membership = overlap_result.scalar_one_or_none()
    if overlapping_membership:
        raise HTTPException(
            400,
            "You already have a networking request for one or more of these dates."
        )

    # Calculate fee (same as before)
    per_day = Decimal(str(network_center.networking_amount or 0))
    total_days = (d2 - d1).days + 1

    network_membership = UserCenterMembership(
        id=uuid4(),
        user_id=member.id,
        center_id=network_center_id,
        time_slot_id=payload.time_slot_id,
        member_status=MemberStatusEnum.network_member,
        network_eligible=True,
        start_date=d1,
        end_date=d2,
        network_status=NetworkingStatusEnum.pending,
        created_by=member.id,
        updated_by=member.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(network_membership)
    await session.flush()
    network_membership_id = network_membership.id

    await session.commit()
    return {
        "detail": "Request sent to network center",
        "network_center_id": network_center_id,
        "network_status": "pending",
        "network_membership_id": str(network_membership_id)
    }



#CenterAdmin: Approve Networking Request
# @router.put("/networking/access/approve")
# async def approve_networking_access(
#     network_membership_id: str = Query(..., description="Networking membership UUID"),
#     session: AsyncSession = Depends(get_async_session),
#     current_admin=Depends(centeradmin_required)
# ):
#     from datetime import datetime
#     from decimal import Decimal
#     from uuid import uuid4
#     from app.auth.models.models import UserCenterMembership, NetworkingStatusEnum, Member
#     from app.center.models.models import Center, CenterWallet, WalletTransaction
#     from app.platforms.models.models import PlatformWallet

#     # 1. Get membership and validate
#     membership = await session.get(UserCenterMembership, network_membership_id)
#     if not membership or str(membership.center_id) != str(current_admin["center_id"]):
#         raise HTTPException(404, "Request not found or not your center")
#     if membership.network_status not in [NetworkingStatusEnum.pending, NetworkingStatusEnum.pending_settlement]:
#         raise HTTPException(400, "Request is not pending or pending settlement")

#     # 2. Get network center and member
#     network_center = await session.get(Center, membership.center_id)
#     member = await session.get(Member, membership.user_id)
#     if not network_center or not member:
#         raise HTTPException(404, "Center or member not found")

#     # 3. Calculate networking fee
#     per_day = Decimal(str(network_center.networking_amount or 0))
#     d1 = membership.start_date
#     d2 = membership.end_date
#     total_days = (d2 - d1).days + 1
#     total_amount = per_day * Decimal(total_days)
#     platform_share = (total_amount * Decimal("0.15")).quantize(Decimal("0.01"))
#     center_share = (total_amount - platform_share).quantize(Decimal("0.01"))

#     # 4. Get wallets
#     network_wallet = await session.execute(
#         select(CenterWallet).where(CenterWallet.center_id == network_center.id)
#     )
#     network_wallet = network_wallet.scalar_one_or_none()
#     if not network_wallet or network_wallet.deposit < 20000 or network_wallet.balance < 10000:
#         raise HTTPException(400, "Network center wallet does not meet requirements")

#     home_wallet = await session.execute(
#         select(CenterWallet).where(CenterWallet.center_id == member.home_center_id)
#     )
#     home_wallet = home_wallet.scalar_one_or_none()

#     # 5. Check home wallet balance
#     if not home_wallet or home_wallet.balance < center_share:
#         # Mark as pending settlement
#         membership.network_status = NetworkingStatusEnum.pending_settlement
#         membership.updated_by = current_admin["user_id"]
#         membership.updated_at = datetime.utcnow()
#         await session.commit()
#         raise HTTPException(
#             400,
#             "Home center has insufficient balance, request marked as pending settlement."
#         )

#     # 6. Ensure platform wallet exists, create if not
#     platform_wallet = await session.execute(select(PlatformWallet))
#     platform_wallet = platform_wallet.scalar_one_or_none()
#     if not platform_wallet:
#         platform_wallet = PlatformWallet(
#             id=uuid4(),
#             balance=Decimal("0.00"),
#             last_updated=datetime.utcnow(),
#             created_at=datetime.utcnow(),
#             updated_at=datetime.utcnow(),
#             created_by=current_admin["user_id"],
#             updated_by=current_admin["user_id"],
#         )
#         session.add(platform_wallet)
#         await session.flush()

#     # 7. Update wallet balances
#     home_wallet.balance -= center_share
#     network_wallet.balance += center_share
#     platform_wallet.balance += platform_share
#     platform_wallet.last_updated = datetime.utcnow()
#     platform_wallet.updated_at = datetime.utcnow()
#     platform_wallet.updated_by = current_admin["user_id"]

#     # 8. Log WalletTransaction (one for home center, one for network center)
#     session.add(WalletTransaction(
#         id=uuid4(),
#         txn_id=uuid4(),
#         from_wallet_id=home_wallet.id,
#         to_wallet_id=network_wallet.id,
#         amount=center_share,
#         transaction_type="network-out",
#         description="Networking access transfer (outgoing)",
#         balance=home_wallet.balance,
#         type="debit",
#         status="completed",
#         created_at=datetime.utcnow()
#     ))
#     session.add(WalletTransaction(
#         id=uuid4(),
#         txn_id=uuid4(),
#         from_wallet_id=home_wallet.id,
#         to_wallet_id=network_wallet.id,
#         amount=center_share,
#         transaction_type="network-in",
#         description="Networking access transfer (incoming)",
#         balance=network_wallet.balance,
#         type="credit",
#         status="completed",
#         created_at=datetime.utcnow()
#     ))
#     # Platform share is only tracked in PlatformWallet

#     # 9. Update membership status
#     membership.network_status = NetworkingStatusEnum.approved
#     membership.updated_by = current_admin["user_id"]
#     membership.updated_at = datetime.utcnow()

#     await session.commit()
#     return {
#         "detail": "Request approved and networking payment processed",
#         "network_membership_id": str(membership.id),
#         "network_status": "approved",
#         "amount": float(total_amount),
#         "platform_income": float(platform_share),
#         "transferred_to_network_center": float(center_share)
#     }

@router.get("/networking/requests")
async def list_networking_requests(
    status: str = Query(None, description="Filter by status: pending, approved, pending_settlement, rejected"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    """
    List all networking access requests for the logged-in center admin's center.
    Only shows requests for the admin's own center.
    """
    from app.auth.models.models import UserCenterMembership, Member, NetworkingStatusEnum
    from app.center.models.models import Center

    # Build base query - filter by current admin's center
    query = (
        select(UserCenterMembership, Member, Center)
        .join(Member, UserCenterMembership.user_id == Member.id)
        .outerjoin(Center, Member.home_center_id == Center.id)
        .where(
            UserCenterMembership.center_id == current_admin["center_id"],
            UserCenterMembership.member_status == MemberStatusEnum.network_member
        )
    )

    # Apply status filter if provided
    if status:
        try:
            status_enum = NetworkingStatusEnum[status]
            query = query.where(UserCenterMembership.network_status == status_enum)
        except KeyError:
            raise HTTPException(400, f"Invalid status: {status}")

    # Get total count
    total_query = select(func.count()).select_from(query.subquery())
    total = (await session.execute(total_query)).scalar()

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    results = (await session.execute(query)).all()

    requests = []
    for membership, member, home_center in results:
        # Calculate networking amount
        if membership.start_date and membership.end_date:
            network_center = await session.get(Center, membership.center_id)
            per_day = Decimal(str(network_center.networking_amount or 0))
            total_days = (membership.end_date - membership.start_date).days + 1
            total_amount = per_day * Decimal(total_days)
            platform_share = (total_amount * Decimal("0.15")).quantize(Decimal("0.01"))
            center_share = (total_amount - platform_share).quantize(Decimal("0.01"))
        else:
            total_amount = Decimal("0.00")
            platform_share = Decimal("0.00")
            center_share = Decimal("0.00")

        requests.append({
            "network_membership_id": str(membership.id),
            "member_id": str(member.id),
            "member_full_name": member.full_name,
            "member_mobile": member.mobile,
            "home_center_id": str(home_center.id) if home_center else None,
            "home_center_name": home_center.center_name if home_center else None,
            "start_date": str(membership.start_date) if membership.start_date else None,
            "end_date": str(membership.end_date) if membership.end_date else None,
            "time_slot_id": str(membership.time_slot_id) if membership.time_slot_id else None,
            "network_status": membership.network_status.value if membership.network_status else None,
            "total_amount": float(total_amount),
            "center_share": float(center_share),
            "platform_share": float(platform_share),
            "created_at": membership.created_at,
            "updated_at": membership.updated_at
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "requests": requests
    }


@router.put("/networking/access/approve")
async def approve_networking_access(
    network_membership_id: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from datetime import datetime
    from decimal import Decimal
    from uuid import uuid4
    from sqlalchemy import select

    now = datetime.utcnow()

    # 1. Validate
    membership = await session.get(UserCenterMembership, network_membership_id)
    if not membership or str(membership.center_id) != str(current_admin["center_id"]):
        raise HTTPException(404, "Invalid request")

    if membership.network_status not in [
        NetworkingStatusEnum.pending,
        NetworkingStatusEnum.pending_settlement
    ]:
        raise HTTPException(400, "Invalid status")

    # 2. Fetch data
    network_center = await session.get(Center, membership.center_id)
    member = await session.get(Member, membership.user_id)

    # 3. Calculate
    # ✅ ADD THIS VALIDATION (ONLY FIX)
    if not network_center.networking_amount:
        raise HTTPException(400, "Networking amount not set for this center")

    per_day = Decimal(str(network_center.networking_amount))
    total_days = (membership.end_date - membership.start_date).days + 1

    total_amount = per_day * total_days
    platform_share = (total_amount * Decimal("0.15")).quantize(Decimal("0.01"))
    center_share = (total_amount - platform_share).quantize(Decimal("0.01"))

    # 4. Wallets (✅ FIXED HERE)
    home_wallet = (await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == member.home_center_id)
    )).scalar_one_or_none()

    if not home_wallet:
        raise HTTPException(400, "Home center wallet not found")

    network_wallet = (await session.execute(
        select(CenterWallet).where(CenterWallet.center_id == network_center.id)
    )).scalar_one_or_none()

    if not network_wallet:
        raise HTTPException(400, "Network center wallet not found")

    platform_wallet = (await session.execute(
        select(PlatformWallet)
    )).scalar_one_or_none()

    if not platform_wallet:
        platform_wallet = PlatformWallet(
            id=uuid4(),
            balance=Decimal("0.00"),
            created_by=current_admin["user_id"],
            created_at=now,
            updated_at=now
        )
        session.add(platform_wallet)
        await session.flush()

    # 5. Validate balance
    if home_wallet.balance < total_amount:
        membership.network_status = NetworkingStatusEnum.pending_settlement
        await session.commit()
        raise HTTPException(400, "Insufficient balance")

    # 6. Update balances
    home_wallet.balance -= total_amount
    network_wallet.balance += center_share
    platform_wallet.balance += platform_share

    # 7. Wallet Transactions
    common_txn_id = uuid4()

    session.add(WalletTransaction(
        id=uuid4(),
        txn_id=common_txn_id,
        from_wallet_id=home_wallet.id,
        amount=total_amount,
        transaction_type="network-out",
        description="Total networking payment",
        balance=home_wallet.balance,
        type="debit",
        status="completed",
        created_at=now
    ))

    session.add(WalletTransaction(
        id=uuid4(),
        txn_id=common_txn_id,
        to_wallet_id=network_wallet.id,
        amount=center_share,
        transaction_type="network-in",
        description="Networking income",
        balance=network_wallet.balance,
        type="credit",
        status="completed",
        created_at=now
    ))

    session.add(WalletTransaction(
        id=uuid4(),
        txn_id=common_txn_id,
        platform_wallet_id=platform_wallet.id,
        amount=platform_share,
        transaction_type="platform_commission",
        description="Platform commission",
        balance=platform_wallet.balance,
        type="credit",
        status="completed",
        created_at=now
    ))

    # 8. Payment Orders
    session.add(PaymentOrder(
        payment_order_id=uuid4(),
        payer_user_id=member.id,
        payer_type=PayerType.user,
        payee_type=PayeeType.center,
        center_id=member.home_center_id,
        order_type=OrderType.network_out,
        reference_id=membership.id,
        reference_schema=ReferenceSchema.networking_access_request,
        total_amount=total_amount,
        subtotal_amount=total_amount,
        currency=Currency.INR,
        status=PaymentOrderStatus.paid,
        payment_method=PaymentMethod.other,
        created_by=current_admin["user_id"]
    ))

    session.add(PaymentOrder(
        payment_order_id=uuid4(),
        payer_user_id=member.id,
        payer_type=PayerType.user,
        payee_type=PayeeType.center,
        center_id=network_center.id,
        order_type=OrderType.network_in,
        reference_id=membership.id,
        reference_schema=ReferenceSchema.networking_access_request,
        total_amount=center_share,
        subtotal_amount=center_share,
        currency=Currency.INR,
        status=PaymentOrderStatus.paid,
        payment_method=PaymentMethod.other,
        created_by=current_admin["user_id"]
    ))

    # 9. Accounting
    await post_networking_access_journal(
        session,
        home_center_id=member.home_center_id,
        network_center_id=network_center.id,
        amount=total_amount,
        platform_share=platform_share,
        member_id=member.id,
        membership_id=membership.id,
        approved_by=current_admin["user_id"]
    )

    # 10. Status
    membership.network_status = NetworkingStatusEnum.approved

    await session.commit()

    return {
        "detail": "Request approved and networking payment processed",
        "network_membership_id": str(membership.id),
        "network_status": "approved",
        "total_paid_by_home_center": float(total_amount),
        "transferred_to_network_center": float(center_share),
        "platform_commission": float(platform_share),
        "amount": float(total_amount),
        "platform_income": float(platform_share),
    }


@router.get("/networking/pending-settlements")
async def list_pending_settlements(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.auth.models.models import UserCenterMembership, NetworkingStatusEnum, Member
    from app.center.models.models import Center

    results = await session.execute(
        select(UserCenterMembership, Member)
        .join(Member, UserCenterMembership.user_id == Member.id)
        .where(
            UserCenterMembership.center_id == current_admin["center_id"],
            UserCenterMembership.network_status == NetworkingStatusEnum.pending_settlement
        )
    )
    settlements = []
    for membership, member in results.all():
        settlements.append({
            "network_membership_id": str(membership.id),
            "member_full_name": member.full_name,
            "start_date": membership.start_date,
            "end_date": membership.end_date,
            "network_status": membership.network_status.value,
        })
    return {"pending_settlements": settlements}



@router.get("/networking/list/{member_id}")
async def list_networking_by_member_id(
    member_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    # Get all networking memberships for the user
    memberships = await session.execute(
        select(UserCenterMembership)
        .where(
            UserCenterMembership.user_id == member_id,
            UserCenterMembership.member_status == MemberStatusEnum.network_member
        )
    )
    memberships = memberships.scalars().all()

    if not memberships:
        return {"networking_memberships": []}

    # Optionally, include center details
    result = []
    for membership in memberships:
        center = await session.get(Center, membership.center_id)
        result.append({
            "network_membership_id": str(membership.id),
            "center_id": str(membership.center_id),
            "center_name": center.center_name if center else None,
            "start_date": membership.start_date,
            "end_date": membership.end_date,
            "time_slot_id": str(membership.time_slot_id) if membership.time_slot_id else None,
            "member_status": membership.member_status.value,
        })

    return {"networking_memberships": result}


@router.put("/center/networking/toggle")
async def toggle_networking(
    enabled: bool = Body(..., embed=True, description="Enable or disable networking"),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    center_id = current_admin["center_id"]
    center = await session.get(Center, center_id)
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    center.network_enabled = enabled
    await session.commit()
    await session.refresh(center)
    return {
        "center_id": str(center.id),
        "network_enabled": center.network_enabled,
        "detail": f"Networking {'enabled' if enabled else 'disabled'} successfully."
    }

@router.get("/center/network-enabled/me")
async def get_my_center_network_enabled(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.center.models.models import Center
    from app.settings.models.models import Address

    center = await session.get(Center, current_admin["center_id"])
    if not center:
        raise HTTPException(404, "Center not found")

    address = await session.get(Address, center.address_id)
    address_data = {
        "address_line_1": address.address_line_1,
        "address_line_2": address.address_line_2,
        "city": address.city,
        "district": address.district,
        "state": address.state,
        "country": address.country,
        "postal_code": address.postal_code,
    } if address else {}

    return {
        "center_id": str(center.id),
        "center_name": center.center_name,
        "network_enabled": center.network_enabled,
        "address": address_data
    }

# List networking bookings for a center (CenterAdmin)
@router.get("/networking/bookings")
async def list_network_bookings(
    status: str = Query(None, description="Filter by status: pending, approved, paid, completed"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.auth.models.models import UserCenterMembership, Member, NetworkingStatusEnum
    from app.center.models.models import Center
    from sqlalchemy import func, and_
    from datetime import datetime

    now = datetime.utcnow().date()
    status_filter = []
    if status == "pending":
        status_filter.append(UserCenterMembership.network_status == NetworkingStatusEnum.pending)
    elif status == "approved":
        status_filter.append(UserCenterMembership.network_status == NetworkingStatusEnum.approved)
    elif status == "paid":
        status_filter.append(UserCenterMembership.network_status == NetworkingStatusEnum.paid)
    elif status == "completed":
        status_filter.append(
            and_(
                UserCenterMembership.network_status == NetworkingStatusEnum.paid,
                UserCenterMembership.end_date < now
            )
        )

    # Base query: bookings for this center
    query = (
    select(UserCenterMembership, Member, Center)
    .outerjoin(Member, UserCenterMembership.user_id == Member.id)
    .outerjoin(Center, Member.home_center_id == Center.id)
    .where(UserCenterMembership.center_id == current_admin["center_id"])
  )

    # Only apply status filter if provided
    if status_filter:
        query = query.where(*status_filter)

    # Pagination
    total_query = select(func.count()).select_from(query.subquery())
    total = (await session.execute(total_query)).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)

    results = (await session.execute(query)).all()

    bookings = []
    for membership, member, home_center in results:
        bookings.append({
            "network_membership_id": str(membership.id),
            "member_full_name": member.full_name,
            "home_center_name": home_center.center_name if home_center else None,
            "home_center_mobile": member.mobile,
            "start_date": membership.start_date,
            "end_date": membership.end_date,
            "network_status": membership.network_status.value,
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "bookings": bookings
    }



#get details of a specific networking booking (CenterAdmin)
@router.get("/networking/booking/{network_membership_id}")
async def get_networking_booking_by_id(
    network_membership_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.auth.models.models import UserCenterMembership, Member
    from app.center.models.models import Center, CenterTimeSlot
    from app.settings.models.models import Address, CenterCategory

    # Get the networking membership
    membership = await session.get(UserCenterMembership, network_membership_id)
    if not membership or str(membership.center_id) != str(current_admin["center_id"]):
        raise HTTPException(404, "Booking not found or not your center")

    # Get member details
    member = await session.get(Member, membership.user_id)
    if not member:
        raise HTTPException(404, "Member not found")

    # Get home center details
    home_center = await session.get(Center, member.home_center_id)
    if not home_center:
        raise HTTPException(404, "Home center not found")

    # Get home center category
    center_category_name = None
    if home_center.center_category_id:
        category = await session.get(CenterCategory, home_center.center_category_id)
        center_category_name = category.name if category else None

    # Get home center address
    address = await session.get(Address, home_center.address_id)
    address_data = {
        "address_line_1": address.address_line_1,
        "address_line_2": address.address_line_2,
        "city": address.city,
        "district": address.district,
        "state": address.state,
        "country": address.country,
        "postal_code": address.postal_code,
    } if address else {}

    # Get selected time slot (optional)
    time_slot = None
    if membership.time_slot_id:
        time_slot_obj = await session.get(CenterTimeSlot, membership.time_slot_id)
        if time_slot_obj:
            time_slot = {
                "time_slot_id": str(time_slot_obj.id),
                "slot_name": getattr(time_slot_obj, "slot_name", None),
                "start_time": str(time_slot_obj.start_time),
                "end_time": str(time_slot_obj.end_time),
            }

    return {
        "network_membership_id": str(membership.id),
        "member": {
            "full_name": member.full_name,
            "mobile": member.mobile,
            "start_date": membership.start_date,
            "end_date": membership.end_date,
            "time_slot": time_slot,
        },
        "home_center": {
            "center_id": str(home_center.id),
            "center_name": home_center.center_name,
            "center_category": center_category_name,
            "center_email": home_center.center_email,
            "center_number": home_center.center_phone,
            "address": address_data,
        }
    }


@router.delete("/networking/booking/{network_membership_id}")
async def delete_networking_booking(
    network_membership_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.auth.models.models import UserCenterMembership

    membership = await session.get(UserCenterMembership, network_membership_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Networking booking not found")
    if str(membership.center_id) != str(current_admin["center_id"]):
        raise HTTPException(status_code=403, detail="Not allowed to delete this networking booking")
    await session.delete(membership)
    await session.commit()
    return {"detail": "Networking booking deleted successfully"}

