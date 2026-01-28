from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.core.models.models import User, UserRole
from app.core.schema.schema import SuperadminLoginRequest
from app.core.security import verify_password, create_access_token  # You need to implement create_access_token
from pydantic import BaseModel
from fastapi.security import HTTPBearer

bearer_scheme = HTTPBearer()


router = APIRouter()


@router.get("/secure-endpoint")
def secure_api(token = Depends(bearer_scheme)):
    return {"message": "authorized"}

#superadmin login
@router.post("/superadmin/login")
async def superadmin_login(
    data: SuperadminLoginRequest,
    session: AsyncSession = Depends(get_async_session)
):
    # Use string "superadmin" for the role comparison
    result = await session.execute(
        select(User).where(User.email == data.email, User.role == "superadmin")
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Use user.role directly (it's a string)
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}