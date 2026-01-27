# app/routes/center_category.py
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.settings.schema.schema import CenterCategorySuperadminSchema
from app.settings.service.service import create_center_category_superadmin
from app.core.dependencies import get_db, superadmin_required

router = APIRouter()

@router.post("/create-centercategory", status_code=201)
async def create_center_category_api(
    name: str = Form(...),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(superadmin_required)
):
    """
    Superadmin can create a CenterCategory with name and optional image.
    Image is uploaded to S3; DB stores only name and parent_category_id.
    """
    return await create_center_category_superadmin(
        db=db,
        name=name,
        image_file=image,
  
    )
