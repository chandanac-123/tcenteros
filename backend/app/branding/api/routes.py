from fastapi import APIRouter,HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.future import select
from uuid import UUID, uuid4
from app.branding.models.models import WhiteLabelConfig
from app.branding.schema.schema import (
    WhiteLabelConfigCreate, WhiteLabelConfigOut
)
from app.core.dependencies import get_async_session, centeradmin_required                               
from app.core.models.models import StatusEnum
from app.s3.service import upload_file, get_file_url
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

router = APIRouter()

@router.post("/branding/white-label/{center_id}", response_model=WhiteLabelConfigOut)
async def create_white_label_config(
    center_id: UUID,
    app_name: Optional[str] = Form(None),
    primary_color: Optional[str] = Form(None),
    secondary_color: Optional[str] = Form(None),
    custom_domain: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    logo_url = None
    if logo:
        file_bytes = await logo.read()
        file_ext = logo.filename.split('.')[-1]
        key = f"branding/{center_id}/logo_{uuid4()}.{file_ext}"
        upload_file(file_bytes, key, logo.content_type)
        logo_url = get_file_url(key)

    config = WhiteLabelConfig(
        white_label_id=uuid4(),
        center_id=center_id,
        app_name=app_name,
        logo_url=logo_url,
        primary_color=primary_color,
        secondary_color=secondary_color,
        custom_domain=custom_domain,
        status=StatusEnum.active,
        created_by=current_admin["user_id"],
        updated_by=current_admin["user_id"]
    )
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return config

@router.get("/branding/white-label/{center_id}/logo")
async def get_white_label_logo(
    center_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(WhiteLabelConfig.logo_url).where(WhiteLabelConfig.center_id == center_id)
    )
    logo_url = result.scalar_one_or_none()
    if logo_url is None:
        raise HTTPException(status_code=404, detail="Logo not found")
    return {"logo_url": logo_url}

@router.get("/branding/white-label/{center_id}/app-name")
async def get_white_label_app_name(
    center_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(WhiteLabelConfig.app_name).where(WhiteLabelConfig.center_id == center_id)
    )
    app_name = result.scalar_one_or_none()
    if app_name is None:
        raise HTTPException(status_code=404, detail="App name not found")
    return {"app_name": app_name}

@router.get("/branding/white-label/{center_id}/primary-color")
async def get_white_label_primary_color(
    center_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(WhiteLabelConfig.primary_color).where(WhiteLabelConfig.center_id == center_id)
    )
    primary_color = result.scalar_one_or_none()
    if primary_color is None:
        raise HTTPException(status_code=404, detail="Primary color not found")
    return {"primary_color": primary_color}

@router.get("/branding/white-label/{center_id}/secondary-color")
async def get_white_label_secondary_color(
    center_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(WhiteLabelConfig.secondary_color).where(WhiteLabelConfig.center_id == center_id)
    )
    secondary_color = result.scalar_one_or_none()
    if secondary_color is None:
        raise HTTPException(status_code=404, detail="Secondary color not found")
    return {"secondary_color": secondary_color}

@router.get("/branding/white-label/{center_id}/custom-domain")
async def get_white_label_custom_domain(
    center_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(WhiteLabelConfig.custom_domain).where(WhiteLabelConfig.center_id == center_id)
    )
    custom_domain = result.scalar_one_or_none()
    if custom_domain is None:
        raise HTTPException(status_code=404, detail="Custom domain not found")
    return {"custom_domain": custom_domain}