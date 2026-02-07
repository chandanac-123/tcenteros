# app/core/dependencies.py

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from app.core.database import AsyncSessionLocal, get_async_session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.models.models import CenterAdmin
from sqlalchemy.future import select


bearer_scheme = HTTPBearer()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return {
        "user_id": user_id,
        "role": role,
    }



def superadmin_required(user=Depends(get_current_user)):
    if not user or user.get("role") != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin privileges required"
        )
    return user

async def centeradmin_required(
    user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    if not user or user.get("role") != "centeradmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Centeradmin privileges required"
        )
    # Fetch CenterAdmin from DB to get center_id
    result = await session.execute(
        select(CenterAdmin).where(CenterAdmin.id == user["user_id"])
    )
    center_admin = result.scalar_one_or_none()
    if not center_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Centeradmin not found"
        )
    return {
        "user_id": user["user_id"],
        "role": user["role"],
        "center_id": str(center_admin.center_id)
    }


def member_required(user=Depends(get_current_user)):
    if not user or user.get("role") != "member":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Member privileges required"
        )
    return user