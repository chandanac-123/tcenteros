from fastapi import APIRouter, Body, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.platforms.models.models import PlatformBranchSetting
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.core.dependencies import superadmin_required, centeradmin_required
from app.billing.models.models import PaymentOrder
from app.center.models.models import Center
from uuid import uuid4
from datetime import datetime

router = APIRouter()


#-------------------------------------
# Branching Routes
#-------------------------------------

#1. Superadmin: Set Branching Price
@router.post("/superadmin/branching-price")
async def set_branching_price(
    price: float = Body(..., embed=True),
    session: AsyncSession = Depends(get_async_session),
    current_superadmin=Depends(superadmin_required)
):
    # Store price in a settings table (e.g., PlatformSetting)
    
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    if setting:
        setting.value = str(price)
    else:
        setting = PlatformBranchSetting(key="branching_price", value=str(price))
        session.add(setting)
    await session.commit()
    return {"branching_price": price, "detail": "Branching price set successfully"}



#2. Centeradmin: View Branching Price
@router.get("/centeradmin/branching-price")
async def get_branching_price(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    price = float(setting.value) if setting else 0.0
    return {"branching_price": price}


#3. Centeradmin: Request Branch Creation & Calculate Amount
@router.post("/centeradmin/branch/request")
async def request_branch_creation(
    branch_count: int = Body(..., embed=True),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    # Get the current branching price from settings
    setting = await session.execute(
        select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
    )
    setting = setting.scalar_one_or_none()
    price = float(setting.value) if setting else 0.0
    total_amount = branch_count * price

    # Create payment order (simulate payment success)
    payment_order = PaymentOrder(
        payment_order_id=uuid4(),
        center_id=current_admin["center_id"],
        payer_user_id=current_admin["user_id"],
        payer_type="center_admin",
        payee_type="platform",
        order_type="add_on",  # Use the correct enum value as per your DB
        reference_schema="center",
        reference_id=current_admin["center_id"],
        subtotal_amount=total_amount,
        tax_amount=0.0,
        total_amount=total_amount,
        currency="INR",
        status="paid",
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(payment_order)

    # Fetch the parent center and increment branch_count if it is a parent (parent_center_id is None)
    parent_center = await session.get(Center, current_admin["center_id"])
    total_branch_count = None
    if parent_center and parent_center.parent_center_id is None:
        parent_center.branch_count = (parent_center.branch_count or 0) + branch_count
        total_branch_count = parent_center.branch_count

    await session.commit()
    return {
        "branch_count": branch_count,
        "branching_price": price,
        "total_amount": total_amount,
        "payment_order_id": str(payment_order.payment_order_id),
        "payment_status": "success",
        "total_branch_count": total_branch_count
    }


#4. Centeradmin: Make Payment for Branches
# @router.post("/centeradmin/branch/payment")
# async def pay_for_branches(
#     branch_count: int = Body(..., embed=True),
#     session: AsyncSession = Depends(get_async_session),
#     current_admin=Depends(centeradmin_required)
# ):
#     # Calculate total amount

#     from app.billing.models.models import PaymentOrder
#     from uuid import uuid4
#     from datetime import datetime

#     setting = await session.execute(
#         select(PlatformBranchSetting).where(PlatformBranchSetting.key == "branching_price")
#     )
#     setting = setting.scalar_one_or_none()
#     price = float(setting.value) if setting else 0.0
#     total_amount = branch_count * price

#     # Create payment order (simulate payment success)
#     payment_order = PaymentOrder(
#         payment_order_id=uuid4(),
#         center_id=current_admin["center_id"],
#         payer_user_id=current_admin["user_id"],
#         payer_type="center_admin",
#         payee_type="platform",
#         order_type="branch_creation",
#         reference_schema="center",
#         reference_id=current_admin["center_id"],
#         subtotal_amount=total_amount,
#         tax_amount=0.0,
#         total_amount=total_amount,
#         currency="INR",
#         status="paid",
#         created_by=current_admin["user_id"],
#         updated_by=current_admin["user_id"],
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow(),
#     )
#     session.add(payment_order)
#     await session.commit()
#     return {
#         "branch_count": branch_count,
#         "total_amount": total_amount,
#         "payment_order_id": str(payment_order.payment_order_id),
#         "payment_status": "success"
#     }


#5. Centeradmin: Create Sub-Branches (after payment)
@router.post("/centeradmin/branch/create")
async def create_sub_branches(
    branch_names: List[str] = Body(..., embed=True),
    payment_order_id: str = Body(..., embed=True),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.billing.models.models import PaymentOrder
    from app.center.models.models import Center
    from uuid import uuid4
    from datetime import datetime

    # Verify payment
    payment = await session.get(PaymentOrder, payment_order_id)
    if not payment or payment.status != "paid":
        raise HTTPException(400, "Payment not successful")

    parent_center_id = current_admin["center_id"]
    created_branch_ids = []
    for name in branch_names:
        branch = Center(
            id=uuid4(),
            parent_center_id=parent_center_id,
            center_name=name,
            center_status="active",
            approval_status="approved",
            created_by=current_admin["user_id"],
            updated_by=current_admin["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(branch)
        created_branch_ids.append(str(branch.id))
    await session.commit()
    return {
        "parent_center_id": str(parent_center_id),
        "branch_ids": created_branch_ids,
        "detail": f"{len(branch_names)} branches created successfully"
    }


