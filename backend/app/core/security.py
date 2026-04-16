from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
from sqlalchemy.orm import Session
from app.core.models.models import SKU
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import secrets
import string
from uuid import uuid4
import asyncio
from sqlalchemy import select


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def generate_random_password(length: int = 10) -> str:
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Ensure at least one character from each category for stronger passwords
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
    ]
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)



async def generate_sku_code(db: AsyncSession, center_id, max_attempts: int = 5) -> str:
    """
    Robust SKU generator:
    - Finds last SKU for center, parses numeric suffix safely
    - Builds next candidate, checks uniqueness, retries on conflict
    - Falls back to a UUID-based code if needed
    """
    prefix = "SKU"
    for attempt in range(max_attempts):
        # Get last SKU row for this center
        result = await db.execute(
            select(SKU).where(SKU.center_id == center_id).order_by(SKU.created_at.desc()).limit(1)
        )
        last_sku = result.scalar_one_or_none()

        if not last_sku or not getattr(last_sku, "sku_code", None):
            candidate = f"{prefix}-0001"
        else:
            # Defensive parse: accept formats like "SKU-0001" and fallback safely
            try:
                suffix = last_sku.sku_code.rsplit("-", 1)[-1]
                last_number = int(suffix)
            except Exception:
                # If parsing fails, fall back to uuid-based candidate for this attempt
                candidate = f"SKU-{uuid4().hex[:8].upper()}"
            else:
                # choose width (e.g., 6 digits to reduce collisions)
                new_number = str(last_number + 1).zfill(6)
                candidate = f"{prefix}-{new_number}"

        # Check uniqueness
        exist_check = await db.execute(select(SKU.id).where(SKU.sku_code == candidate))
        if exist_check.scalar_one_or_none() is None:
            return candidate

        # If exists, small backoff then retry loop
        await asyncio.sleep(0.02 * (attempt + 1))

    # Final fallback after retries
    return f"SKU-{uuid4().hex[:10].upper()}"

