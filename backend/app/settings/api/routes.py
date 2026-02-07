from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.settings.models.models import CenterCategory, TaxCategory, Designation
from app.settings.schema.schema import CenterCategoryOut, TaxCategoryCreate, TaxCategoryOut, TaxCategoryUpdate, CenterOperationalSettingCreate, CenterOperationalSettingUpdate, CenterOperationalSettingOut, DesignationCreate, DesignationOut, DesignationUpdate
from app.settings.models.models import CenterOperationalSetting
from app.auth.models.models import CenterAdmin
from app.core.dependencies import centeradmin_required
from app.s3.service import upload_file
from app.core.dependencies import get_current_user
import uuid
from datetime import time
from app.s3.service import get_file_url

router = APIRouter()

#center category
@router.post(
    "/center-categories/",
    response_model=CenterCategoryOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_center_category(
    name: str,
    code: str,
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can create center categories",
        )

    image_key = f"center_categories/{uuid.uuid4()}_{image.filename}"
    image_bytes = await image.read()
    upload_file(image_bytes, image_key, image.content_type)
    image_url = image_key  # Or construct the S3 public URL if needed

    category = CenterCategory(
        name=name,
        code=code,
        image_url=image_url,
    )

    session.add(category)
    await session.commit()
    await session.refresh(category)

    return category

@router.get("/center-categories/", response_model=list[CenterCategoryOut])
async def list_center_categories(
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(CenterCategory))
    return result.scalars().all()


#TaxCategory
# CREATE
@router.post("/tax-categories/", response_model=TaxCategoryOut, status_code=status.HTTP_201_CREATED)
async def create_tax_category(
    data: TaxCategoryCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can create tax categories")
    tax_category = TaxCategory(**data.dict())
    session.add(tax_category)
    await session.commit()
    await session.refresh(tax_category)
    return tax_category

# READ ALL
@router.get("/tax-categories/", response_model=list[TaxCategoryOut])
async def list_tax_categories(
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can view tax categories")
    result = await session.execute(select(TaxCategory))
    return result.scalars().all()

# READ ONE
@router.get("/tax-categories/{tax_id}", response_model=TaxCategoryOut)
async def get_tax_category(
    tax_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can view tax categories")
    result = await session.execute(select(TaxCategory).where(TaxCategory.id == tax_id))
    tax_category = result.scalar_one_or_none()
    if not tax_category:
        raise HTTPException(status_code=404, detail="Tax category not found")
    return tax_category

# UPDATE
@router.put("/tax-categories/{tax_id}", response_model=TaxCategoryOut)
async def update_tax_category(
    tax_id: str,
    data: TaxCategoryUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can update tax categories")
    result = await session.execute(select(TaxCategory).where(TaxCategory.id == tax_id))
    tax_category = result.scalar_one_or_none()
    if not tax_category:
        raise HTTPException(status_code=404, detail="Tax category not found")
    for key, value in data.dict().items():
        setattr(tax_category, key, value)
    await session.commit()
    await session.refresh(tax_category)
    return tax_category

# DELETE
@router.delete("/tax-categories/{tax_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tax_category(
    tax_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can delete tax categories")
    result = await session.execute(select(TaxCategory).where(TaxCategory.id == tax_id))
    tax_category = result.scalar_one_or_none()
    if not tax_category:
        raise HTTPException(status_code=404, detail="Tax category not found")
    await session.delete(tax_category)
    await session.commit()
    return


#Center Operational Settings
# CREATE
@router.post("/center-operational-settings/", response_model=CenterOperationalSettingOut, status_code=201)
async def create_center_operational_setting(
    data: CenterOperationalSettingCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Check if already exists for this center
    result = await session.execute(
        select(CenterOperationalSetting).where(CenterOperationalSetting.center_id == center_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Operational settings already exist for this center")

    ops = CenterOperationalSetting(
        center_id=center_id,
        opening_time=data.opening_time,
        closing_time=data.closing_time,
        week_off_days=data.week_off_days,
        attendance_allowed_radius_meters=data.attendance_allowed_radius_meters
    )
    session.add(ops)
    await session.commit()
    await session.refresh(ops)
    return ops

# READ (get for current center)
@router.get("/center-operational-settings/", response_model=CenterOperationalSettingOut)
async def get_center_operational_setting(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    result = await session.execute(
        select(CenterOperationalSetting).where(CenterOperationalSetting.center_id == center_id)
    )
    ops = result.scalar_one_or_none()
    if not ops:
        raise HTTPException(status_code=404, detail="Operational settings not found for this center")
    return ops

# UPDATE
@router.put("/center-operational-settings/", response_model=CenterOperationalSettingOut)
async def update_center_operational_setting(
    data: CenterOperationalSettingUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    result = await session.execute(
        select(CenterOperationalSetting).where(CenterOperationalSetting.center_id == center_id)
    )
    ops = result.scalar_one_or_none()
    if not ops:
        raise HTTPException(status_code=404, detail="Operational settings not found for this center")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(ops, key, value)
    await session.commit()
    await session.refresh(ops)
    return ops

# DELETE
@router.delete("/center-operational-settings/", status_code=204)
async def delete_center_operational_setting(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    result = await session.execute(
        select(CenterOperationalSetting).where(CenterOperationalSetting.center_id == center_id)
    )
    ops = result.scalar_one_or_none()
    if not ops:
        raise HTTPException(status_code=404, detail="Operational settings not found for this center")
    await session.delete(ops)
    await session.commit()
    return


#------------------------------------
#Designation crud
#------------------------------------
# Create Designation
@router.post("/designation", response_model=DesignationOut)
async def create_designation(
    data: DesignationCreate = Depends(),
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session)
):
    # Check for duplicate code
    result_code = await session.execute(select(Designation).where(Designation.code == data.code))
    if result_code.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Designation code already exists")
    # Check for duplicate name
    result_name = await session.execute(select(Designation).where(Designation.name == data.name))
    if result_name.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Designation name already exists")

    image_key = f"designations/{uuid.uuid4()}_{image.filename}"
    image_bytes = await image.read()
    upload_file(image_bytes, image_key, image.content_type)
    image_url = get_file_url(image_key)

    data_dict = data.dict()
    data_dict["image_url"] = image_url

    designation = Designation(**data_dict)
    session.add(designation)
    await session.commit()
    await session.refresh(designation)
    return {
        **designation.__dict__,
        "image_url": image_url
    }

# Get Designation by ID
@router.get("/designation/{designation_id}", response_model=DesignationOut)
async def get_designation(designation_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    designation = await session.get(Designation, designation_id)
    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")
    return designation

# Update Designation with optional image
@router.put("/designation/{designation_id}", response_model=DesignationOut)
async def update_designation(
    designation_id: uuid.UUID,
    data: DesignationUpdate = Depends(),
    image: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    designation = await session.get(Designation, designation_id)
    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(designation, key, value)
    if image:
        image_key = f"designations/{uuid.uuid4()}_{image.filename}"
        image_bytes = await image.read()
        upload_file(image_bytes, image_key, image.content_type)
        designation.image_url = image_key  # Or use get_file_url(image_key)
    await session.commit()
    await session.refresh(designation)
    return designation

# Delete Designation
@router.delete("/designation/{designation_id}")
async def delete_designation(designation_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    designation = await session.get(Designation, designation_id)
    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")
    await session.delete(designation)
    await session.commit()
    return {"detail": "Designation deleted"}

# List Designations
@router.get("/designation", response_model=list[DesignationOut])
async def list_designations(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Designation))
    designations = result.scalars().all()
    # Convert image_url to absolute URL for each designation
    return [
        {
            **designation.__dict__,
            "image_url": get_file_url(designation.image_url) if designation.image_url else None
        }
        for designation in designations
    ]


