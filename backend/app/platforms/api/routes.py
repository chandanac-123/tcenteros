# app/platforms/api/routes.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.platforms.models.models import PlatformFeature
from app.platforms.schema.schema import (
    PlatformFeatureCreate, PlatformFeatureUpdate, PlatformFeatureOut
)
from app.core.database import get_async_session

router = APIRouter()

@router.post("/", response_model=PlatformFeatureOut)
async def create_feature(
    data: PlatformFeatureCreate,
    db: AsyncSession = Depends(get_async_session)
):
    feature = PlatformFeature(**data.dict())
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    return feature

@router.get("/", response_model=list[PlatformFeatureOut])
async def list_features(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(PlatformFeature))
    return result.scalars().all()

@router.get("/{feature_id}", response_model=PlatformFeatureOut)
async def get_feature(feature_id: UUID, db: AsyncSession = Depends(get_async_session)):
    feature = await db.get(PlatformFeature, feature_id)
    if not feature:
        raise HTTPException(404, detail="Feature not found")
    return feature

@router.put("/{feature_id}", response_model=PlatformFeatureOut)
async def update_feature(
    feature_id: UUID,
    data: PlatformFeatureUpdate,
    db: AsyncSession = Depends(get_async_session)
):
    feature = await db.get(PlatformFeature, feature_id)
    if not feature:
        raise HTTPException(404, detail="Feature not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(feature, field, value)
    await db.commit()
    await db.refresh(feature)
    return feature

@router.delete("/{feature_id}")
async def delete_feature(feature_id: UUID, db: AsyncSession = Depends(get_async_session)):
    feature = await db.get(PlatformFeature, feature_id)
    if not feature:
        raise HTTPException(404, detail="Feature not found")
    await db.delete(feature)
    await db.commit()
    return {"detail": "Feature deleted"}