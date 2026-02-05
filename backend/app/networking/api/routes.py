from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.dependencies import get_current_user  
from app.auth.models.models import Member, MemberStatusEnum
from app.core.database import get_async_session
from app.center.models.models import Center
from app.settings.models.models import Address

router = APIRouter()

@router.get("/centers/network-enabled-cities", tags=["Centers"])
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

@router.get("/centers/network-enabled", tags=["Centers"])
async def list_network_enabled_centers(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)  # Require authentication for all users
):
    # Query centers with network_enabled = True
    centers_result = await session.execute(
        select(Center)
        .where(Center.network_enabled == True)
    )
    centers = centers_result.scalars().all()

    response = []
    for center in centers:
        # Count active members for this center
        members_result = await session.execute(
            select(func.count(Member.id))
            .where(
                Member.home_center_id == center.id,
                Member.member_status == MemberStatusEnum.member
            )
        )
        active_members_count = members_result.scalar_one()

        # Get address details
        address = None
        if center.address_id:
            address_result = await session.execute(
                select(Address).where(Address.id == center.address_id)
            )
            address_obj = address_result.scalar_one_or_none()
            if address_obj:
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