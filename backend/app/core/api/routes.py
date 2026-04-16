from fastapi import APIRouter, HTTPException, Depends, HTTPException, Body
from jose import JWTError, jwt
from app.core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.core.models.models import User, UserRole
from app.core.schema.schema import SuperadminLoginRequest
from app.core.security import verify_password, create_access_token, create_refresh_token  # You need to implement create_access_token
from pydantic import BaseModel
from fastapi.security import HTTPBearer

bearer_scheme = HTTPBearer()


router = APIRouter()


@router.get("/secure-endpoint")
def secure_api(token = Depends(bearer_scheme)):
    return {"message": "authorized"}

@router.post("/auth/refresh")
async def refresh_access_token(refresh_token: str = Body(..., embed=True)):
    try:
        payload = jwt.decode(
            refresh_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        role = payload.get("role")
        center_id = payload.get("center_id")
        if not user_id or not role:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Issue new access token
    access_token = create_access_token({
        "sub": user_id,
        "role": role,
        "center_id": center_id
    })
    # Optionally, issue a new refresh token as well
    new_refresh_token = create_refresh_token({
        "sub": user_id,
        "role": role,
        "center_id": center_id
    })

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


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