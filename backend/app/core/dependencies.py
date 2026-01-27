# app/core/dependencies.py

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException
from app.core.database import AsyncSessionLocal
from fastapi.security import OAuth2PasswordBearer


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Replace with your JWT decoding
    user = {"id": "superadmin-id", "role": "superadmin"}
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

async def superadmin_required(user: dict = Depends(get_current_user)):
    if user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return user