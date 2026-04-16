import asyncio
from sqlalchemy import select, and_
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.core.models.models import User, UserRole, StatusEnum
from app.core.config import settings

async def create_superadmin():
    async with AsyncSessionLocal() as session:
        # Check if superadmin with the same email already exists
        result = await session.execute(
            select(User).where(
                and_(
                    User.role == UserRole.superadmin.value,
                    User.email == settings.SUPERADMIN_EMAIL
                )
            )
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"✅ Superadmin already exists: {existing_admin.email}")
            return

        # Create superadmin in shared.users only
        superadmin_user = User(
            email=settings.SUPERADMIN_EMAIL,
            username=settings.SUPERADMIN_USERNAME,
            password_hash=get_password_hash(settings.SUPERADMIN_PASSWORD),
            role=UserRole.superadmin.value,
            status=StatusEnum.active.value if isinstance(StatusEnum.active, StatusEnum) else StatusEnum.active,
        )
        session.add(superadmin_user)
        await session.commit()
        await session.refresh(superadmin_user)

        print("🎉 Superadmin created successfully in shared.users!")
        print("ID:", superadmin_user.id)
        print("Email:", superadmin_user.email)

if __name__ == "__main__":
    asyncio.run(create_superadmin())