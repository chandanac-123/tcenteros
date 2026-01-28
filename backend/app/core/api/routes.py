from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.core.models.models import User, UserRole
from app.core.schema.schema import SuperadminLoginRequest
from app.core.security import verify_password, create_access_token  # You need to implement create_access_token
from pydantic import BaseModel


router = APIRouter()

@router.post("/superadmin/login")
async def superadmin_login(
    data: SuperadminLoginRequest,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(User).where(User.email == data.email, User.role == UserRole.superadmin)
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Generate JWT token
    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}