
from datetime import datetime
from fastapi import APIRouter,HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.future import select
from uuid import UUID, uuid4
from app.branding.models.models import WhiteLabelConfig
from app.branding.schema.schema import (
    WhiteLabelConfigCreate, WhiteLabelConfigOut
)
from app.settings.schema.schema import TermsPrivacyOut
from app.settings.models.models import TermsPrivacy
from app.core.dependencies import get_async_session, centeradmin_required                               
from app.core.models.models import StatusEnum
from app.s3.service import upload_file, get_file_url
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

router = APIRouter()

@router.post("/branding/white-label/bulk-update", response_model=dict)
async def bulk_update_white_label_config(
    app_name: Optional[str] = Form(None),
    primary_color: Optional[str] = Form(None),
    secondary_color: Optional[str] = Form(None),
    custom_domain: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.center.models.models import Center

    admin_center_id = str(current_admin["center_id"])

    # Get all centers: parent + sub-branches
    result = await session.execute(
        select(Center).where(
            (Center.id == admin_center_id) | (Center.parent_center_id == admin_center_id)
        )
    )
    centers = result.scalars().all()
    if not centers:
        raise HTTPException(404, "No centers found for this admin")

    # Handle logo upload (one upload for all)
    logo_url = None
    MAX_FILE_SIZE_MB = 2
    MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

    if logo:
        file_bytes = await logo.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Logo file too large. Max allowed size is {MAX_FILE_SIZE_MB} MB."
            )
        file_ext = logo.filename.split('.')[-1]
        key = f"branding/{admin_center_id}/logo_{uuid4()}.{file_ext}"
        upload_file(file_bytes, key, logo.content_type)
        logo_url = get_file_url(key)

    updated = []
    created = []

    for center in centers:
        # Check if config exists
        result = await session.execute(
            select(WhiteLabelConfig).where(WhiteLabelConfig.center_id == center.id)
        )
        config = result.scalars().first()

        if config:
            # Update existing config
            if app_name is not None:
                config.app_name = app_name
            if logo_url is not None:
                config.logo_url = logo_url
            if primary_color is not None:
                config.primary_color = primary_color
            if secondary_color is not None:
                config.secondary_color = secondary_color
            if custom_domain is not None:
                config.custom_domain = custom_domain
            config.updated_by = current_admin["user_id"]
            config.status = StatusEnum.active
            updated.append(str(center.id))
        else:
            # Create new config
            config = WhiteLabelConfig(
                white_label_id=uuid4(),
                center_id=center.id,
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
            created.append(str(center.id))

    await session.commit()
    return {
        "updated_centers": updated,
        "created_centers": created,
        "total_processed": len(updated) + len(created)
    }

@router.get("/branding/white-label/all", response_model=dict)
async def get_all_white_label_configs(
    session: AsyncSession = Depends(get_async_session),
    current_admin=Depends(centeradmin_required)
):
    from app.center.models.models import Center

    admin_center_id = str(current_admin["center_id"])

    # Get parent center and all sub-branches
    result = await session.execute(
        select(Center).where(
            (Center.id == admin_center_id) | (Center.parent_center_id == admin_center_id)
        )
    )
    centers = result.scalars().all()
    if not centers:
        raise HTTPException(404, "No centers found for this admin")

    configs = []
    for center in centers:
        config_result = await session.execute(
            select(WhiteLabelConfig).where(WhiteLabelConfig.center_id == center.id)
        )
        config = config_result.scalars().first()
        configs.append({
            "center_id": str(center.id),
            "center_name": center.center_name,
            "is_parent": center.parent_center_id is None,
            "parent_center_id": str(center.parent_center_id) if center.parent_center_id else None,
            "branding": {
                "app_name": config.app_name if config else None,
                "logo_url": config.logo_url if config else None,
                "primary_color": config.primary_color if config else None,
                "secondary_color": config.secondary_color if config else None,
                "custom_domain": config.custom_domain if config else None,
                "status": config.status.value if config and hasattr(config.status, "value") else (config.status if config else None),
            }
        })

    return {
        "total_centers": len(configs),
        "centers": configs
    }


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



#Here is an API that allows a logged-in centeradmin to get the global Terms & Privacy created by the superadmin 
@router.get("/terms-privacy/global", response_model=TermsPrivacyOut)
async def get_global_terms_privacy(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    # Fetch the global TermsPrivacy (center_id is None)
    result = await session.execute(
        select(TermsPrivacy).where(TermsPrivacy.center_id == None)
    )
    terms = result.scalars().first()
    if not terms:
        raise HTTPException(404, "Global Terms/Privacy not found")

    return TermsPrivacyOut(
        id=terms.id,
        title=terms.title,
        content=terms.content,
        created_at=terms.created_at,
        updated_at=terms.updated_at
    )



# Centeradmin creates/updates Terms & Privacy for their center
@router.post("/terms-privacy/center", response_model=TermsPrivacyOut)
async def create_or_update_center_terms_privacy(
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_id = current_user["center_id"]
    # Check if already exists
    result = await session.execute(
        select(TermsPrivacy).where(TermsPrivacy.center_id == center_id)
    )
    terms = result.scalars().first()
    if terms:
        # Update only provided fields
        if title is not None:
            terms.title = title
        if content is not None:
            terms.content = content
        terms.updated_by = current_user["user_id"]
        terms.updated_at = datetime.utcnow()
    else:
        # Create, allow missing fields (but at least one must be provided)
        if title is None and content is None:
            raise HTTPException(400, "At least one of 'title' or 'content' must be provided")
        terms = TermsPrivacy(
            title=title or "",
            content=content or "",
            center_id=center_id,
            created_by=current_user["user_id"],
            updated_by=current_user["user_id"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(terms)
    await session.commit()
    await session.refresh(terms)
    return terms


@router.get("/terms-privacy/center", response_model=TermsPrivacyOut)
async def get_center_terms_privacy(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_id = current_user["center_id"]
    result = await session.execute(
        select(TermsPrivacy).where(TermsPrivacy.center_id == center_id)
    )
    terms = result.scalars().first()
    if not terms:
        raise HTTPException(404, "Terms/Privacy not found for this center")
    return TermsPrivacyOut(
        id=terms.id,
        title=terms.title,
        content=terms.content,
        created_at=terms.created_at,
        updated_at=terms.updated_at
    )



