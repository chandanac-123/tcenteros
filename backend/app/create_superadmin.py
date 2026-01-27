import asyncio
from sqlalchemy import select

import app.core.models
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.core.models.models import User, UserRole, StatusEnum
from app.core.config import settings



async def create_superadmin():
    async with AsyncSessionLocal() as session:
        # Check if superadmin already exists
        result = await session.execute(
            select(User).where(User.role == UserRole.superadmin)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print("✅ Superadmin already exists:", existing_admin.email)
            return

        # Create superadmin
        superadmin = User(
            email=settings.SUPERADMIN_EMAIL,
            username=settings.SUPERADMIN_USERNAME,
            password_hash=get_password_hash(settings.SUPERADMIN_PASSWORD),
            role=UserRole.superadmin,
            status=StatusEnum.active,
        )

        session.add(superadmin)
        await session.commit()
        await session.refresh(superadmin)

        print("🎉 Superadmin created successfully!")
        print("ID:", superadmin.id)
        print("Email:", superadmin.email)


if __name__ == "__main__":
    asyncio.run(create_superadmin())
