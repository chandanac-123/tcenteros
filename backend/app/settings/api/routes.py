from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.settings.models.models import CenterCategory, TaxCategory
from app.settings.schema.schema import CenterCategoryOut, TaxCategoryBase, TaxCategoryCreate, TaxCategoryOut, TaxCategoryUpdate
from app.s3.service import upload_file
from app.core.dependencies import get_current_user
import uuid

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
