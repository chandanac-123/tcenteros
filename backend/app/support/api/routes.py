from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import uuid4
from typing import Optional, List
from app.support.models.models import Ticket, TicketMessage, TicketStatus
from app.auth.models.models import Member, CenterAdmin,SuperAdmin
from app.center.models.models import Center
from app.s3.service import upload_file, get_file_url
from app.core.dependencies import member_required, superadmin_required, centeradmin_required, get_async_session, get_current_user
from app.support.schema.schema import TicketOut, TicketMessageOut
from datetime import datetime
from fastapi.concurrency import run_in_threadpool
from app.core.models.models import User 
router = APIRouter()

# 1. Member raises ticket
@router.post("/ticket/raise", response_model=TicketOut)
async def raise_ticket(
    subject: Optional[str] = Form(None),
    description: str = Form(...),
    image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session),
    current_member=Depends(member_required)
):
    image_url = None
    if image:
        file_bytes = await image.read()
        ext = image.filename.split('.')[-1]
        key = f"ticket_images/{uuid4()}.{ext}"
        await run_in_threadpool(upload_file, file_bytes, key, image.content_type)
        image_url = await run_in_threadpool(get_file_url, key)

    member = await session.get(Member, current_member["user_id"])
    if not member:
        raise HTTPException(404, "Member not found")

    subject = subject or "No Subject"

    # Fetch the first superadmin (assuming role field is present)
    superadmin_result = await session.execute(
        select(User).where(User.role == "superadmin")
    )
    superadmin = superadmin_result.scalars().first()
    assigned_admin_id = superadmin.id if superadmin else None
    assigned_admin_role = "superadmin" if superadmin else None

    ticket = Ticket(
        id=uuid4(),
        member_id=member.id,
        center_id=member.home_center_id,
        assigned_admin_id=assigned_admin_id,
        assigned_admin_role=assigned_admin_role,
        status=TicketStatus.pending,
        subject=subject,
        description=description,
        image_url=image_url,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    session.add(ticket)
    await session.commit()
    await session.refresh(ticket)

    messages = []

    ticket_out = TicketOut(
        id=ticket.id,
        member_id=ticket.member_id,
        center_id=ticket.center_id,
        assigned_admin_id=ticket.assigned_admin_id,
        status=ticket.status.value if hasattr(ticket.status, "value") else str(ticket.status),
        subject=ticket.subject,
        description=ticket.description,
        image_url=ticket.image_url,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=messages
    )
    return ticket_out

# 2. Get ticket and messages (all roles)
@router.get("/ticket/{ticket_id}", response_model=TicketOut)
async def get_ticket(
    ticket_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    ticket = await session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    # Access control: member (own), superadmin (all), centeradmin (assigned)
    if current_user["role"] == "member" and str(ticket.member_id) != str(current_user["user_id"]):
        raise HTTPException(403, "Not allowed")
    if current_user["role"] == "centeradmin" and str(ticket.assigned_admin_id) != str(current_user["user_id"]):
        raise HTTPException(403, "Not allowed")
    # Fetch messages
    messages_result = await session.execute(
        select(TicketMessage).where(TicketMessage.ticket_id == ticket.id).order_by(TicketMessage.created_at)
    )
    messages = messages_result.scalars().all()
    messages_out = [
        TicketMessageOut(
            id=msg.id,
            sender_id=msg.sender_id,
            sender_role=msg.sender_role,
            message=msg.message,
            image_url=msg.image_url,
            created_at=msg.created_at
        ) for msg in messages
    ]
    ticket_out = TicketOut(
        id=ticket.id,
        member_id=ticket.member_id,
        center_id=ticket.center_id,
        assigned_admin_id=ticket.assigned_admin_id,
        status=ticket.status.value if hasattr(ticket.status, "value") else str(ticket.status),
        subject=ticket.subject,
        description=ticket.description,
        image_url=ticket.image_url,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=messages_out
    )
    return ticket_out

# 3. Send message (all roles)
@router.post("/ticket/{ticket_id}/message", response_model=TicketMessageOut)
async def send_ticket_message(
    ticket_id: str,
    message: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    ticket = await session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    # Access control: member (own), superadmin (all), centeradmin (assigned)
    if current_user["role"] == "member" and str(ticket.member_id) != str(current_user["user_id"]):
        raise HTTPException(403, "Not allowed")
    if current_user["role"] == "centeradmin" and str(ticket.assigned_admin_id) != str(current_user["user_id"]):
        raise HTTPException(403, "Not allowed")
    # Only allow chat if ticket is open or assigned
    if ticket.status not in [TicketStatus.open, TicketStatus.assigned]:
        raise HTTPException(400, "Chat not allowed in current ticket status")
    image_url = None
    if image:
        file_bytes = await image.read()
        ext = image.filename.split('.')[-1]
        key = f"ticket_messages/{uuid4()}.{ext}"
        upload_file(file_bytes, key, content_type=image.content_type)
        image_url = get_file_url(key)
    msg = TicketMessage(
        id=uuid4(),
        ticket_id=ticket.id,
        sender_id=current_user["user_id"],
        sender_role=current_user["role"],
        message=message,
        image_url=image_url,
        created_at=datetime.utcnow(),
    )
    session.add(msg)
    await session.commit()
    await session.refresh(msg)
    return msg

# 4. Superadmin opens ticket (status: open, auto-reply)
@router.post("/ticket/{ticket_id}/open")
async def open_ticket(
    ticket_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_superadmin=Depends(superadmin_required)
):
    ticket = await session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    ticket.status = TicketStatus.open
    ticket.updated_at = datetime.utcnow()
    # Auto-reply
    auto_msg = TicketMessage(
        id=uuid4(),
        ticket_id=ticket.id,
        sender_id=current_superadmin["user_id"],
        sender_role="superadmin",
        message="Thank you for raising the issue. We are looking into it.",
        created_at=datetime.utcnow(),
    )
    session.add(auto_msg)
    await session.commit()
    return {"detail": "Ticket opened and auto-reply sent."}

# 5. Superadmin assigns ticket to centeradmin
@router.post("/ticket/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    centeradmin_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_superadmin=Depends(superadmin_required)
):
    ticket = await session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    centeradmin = await session.get(CenterAdmin, centeradmin_id)
    if not centeradmin:
        raise HTTPException(404, "CenterAdmin not found")
    ticket.assigned_admin_id = centeradmin.id
    ticket.status = TicketStatus.assigned
    ticket.updated_at = datetime.utcnow()
    await session.commit()
    return {"detail": "Ticket assigned to center admin."}

# 6. Close ticket (superadmin or centeradmin)
@router.post("/ticket/{ticket_id}/close")
async def close_ticket(
    ticket_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    ticket = await session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    if current_user["role"] not in ["superadmin", "centeradmin"]:
        raise HTTPException(403, "Not allowed")
    if current_user["role"] == "centeradmin" and str(ticket.assigned_admin_id) != str(current_user["user_id"]):
        raise HTTPException(403, "Not allowed")
    ticket.status = TicketStatus.closed
    ticket.updated_at = datetime.utcnow()
    await session.commit()
    return {"detail": "Ticket closed."}

# 7. List tickets (role-based)
@router.get("/tickets", response_model=List[TicketOut])
async def list_tickets(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    if current_user["role"] == "member":
        stmt = select(Ticket).where(Ticket.member_id == current_user["user_id"])
    elif current_user["role"] == "centeradmin":
        stmt = select(Ticket).where(Ticket.assigned_admin_id == current_user["user_id"])
    elif current_user["role"] == "superadmin":
        stmt = select(Ticket)
    else:
        raise HTTPException(403, "Not allowed")
    result = await session.execute(stmt)
    tickets = result.scalars().all()
    ticket_out_list = []
    for ticket in tickets:
        messages_result = await session.execute(
            select(TicketMessage).where(TicketMessage.ticket_id == ticket.id).order_by(TicketMessage.created_at)
        )
        messages = messages_result.scalars().all()
        messages_out = [
            TicketMessageOut(
                id=msg.id,
                sender_id=msg.sender_id,
                sender_role=msg.sender_role,
                message=msg.message,
                image_url=msg.image_url,
                created_at=msg.created_at
            ) for msg in messages
        ]
        ticket_out = TicketOut(
            id=ticket.id,
            member_id=ticket.member_id,
            center_id=ticket.center_id,
            assigned_admin_id=ticket.assigned_admin_id,
            status=ticket.status.value if hasattr(ticket.status, "value") else str(ticket.status),
            subject=ticket.subject,
            description=ticket.description,
            image_url=ticket.image_url,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            messages=messages_out
        )
        ticket_out_list.append(ticket_out)
    return ticket_out_list

