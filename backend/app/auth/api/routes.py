
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.s3.service import upload_file, get_file_url, delete_file
import urllib.parse
from app.core.database import get_async_session
from app.auth.schema.schema import CenterAdminLoginRequest, CenterAdminLoginResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth.models.models import User
from app.core.security import verify_password
from app.core.security import create_access_token, create_refresh_token



router = APIRouter()

@router.post("/login")
async def login():
    return {"message": "login ok"}



@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    key = upload_file(file)
    # key = "uploads/uuid_filename with spaces.png"

    # remove "uploads/" prefix
    filename = key.replace("uploads/", "", 1)

    # URL-encode ONLY the filename
    encoded_filename = urllib.parse.quote(filename)

    return {
        "message": "Uploaded",
        "key": encoded_filename
    }

@router.get("/{key:path}")
def get_file(key: str):
    url = get_file_url(key)
    return {"url": url}


@router.delete("/{key}")
def delete(key: str):
    delete_file(key)
    return {"message": "Deleted"}


@router.post("/centeradmin/login", response_model=CenterAdminLoginResponse)
async def centeradmin_login(
    payload: CenterAdminLoginRequest,
    db: AsyncSession = Depends(get_async_session)
):
    stmt = select(User).where(User.email == payload.email, User.role == "centeradmin")
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }