from fastapi import APIRouter, Form , UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_async_session
from app.settings.models.models import CenterCategory, TaxCategory, Designation
from app.settings.schema.schema import CenterCategoryOut, TaxCategoryCreate, TaxCategoryOut, TaxCategoryUpdate, CenterOperationalSettingCreate, CenterOperationalSettingUpdate, CenterOperationalSettingOut, DesignationCreate, DesignationOut, DesignationUpdate, TermsPrivacyOut
from app.settings.models.models import CenterOperationalSetting
from app.auth.models.models import CenterAdmin
from app.center.models.models import Center, CenterTimeSlot
from app.center.schema.schema import CenterTimeSlotOut
from app.settings.models.models import TermsPrivacy, FAQ
from app.settings.schema.schema import FAQCreate, FAQOut
from uuid import uuid4
from typing import List
from app.settings.schema.schema import TermsPrivacyOut
from app.core.dependencies import centeradmin_required, superadmin_required
from app.s3.service import upload_file
from app.core.dependencies import get_current_user
from jinja2 import Template
import uuid
from datetime import time
from app.s3.service import get_file_url
import random
import re
from datetime import datetime

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
    if current_user["role"] not in ("superadmin", "centeradmin"):
        raise HTTPException(status_code=403, detail="Only superadmin or centeradmin can create tax categories")
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
    if current_user["role"] not in ("superadmin", "centeradmin", "member"):
        raise HTTPException(status_code=403, detail="Only superadmin, centeradmin, or member can view tax categories")
    result = await session.execute(select(TaxCategory))
    return result.scalars().all()

# READ ONE
@router.get("/tax-categories/{tax_id}", response_model=TaxCategoryOut)
async def get_tax_category(
    tax_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ("superadmin", "centeradmin", "member"):
        raise HTTPException(status_code=403, detail="Only superadmin, centeradmin, or member can view tax categories")
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
    if current_user["role"] not in ("superadmin", "centeradmin"):
        raise HTTPException(status_code=403, detail="Only superadmin or centeradmin can update tax categories")
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
    if current_user["role"] not in ("superadmin", "centeradmin"):
        raise HTTPException(status_code=403, detail="Only superadmin or centeradmin can delete tax categories")
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
    name: str = Form(...),  # Accept name as a form field
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session)
):
    # Auto-generate code
    name_part = ''.join(re.findall(r'[A-Za-z]', name))[:3].upper().ljust(3, 'X')
    while True:
        rand_part = f"{random.randint(0, 999):03d}"
        code = f"{name_part}{rand_part}"
        result_code = await session.execute(select(Designation).where(Designation.code == code))
        if not result_code.scalar_one_or_none():
            break

    # Check for duplicate name
    result_name = await session.execute(select(Designation).where(Designation.name == name))
    if result_name.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Designation name already exists")

    image_key = f"designations/{uuid.uuid4()}_{image.filename}"
    image_bytes = await image.read()
    upload_file(image_bytes, image_key, image.content_type)
    image_url = get_file_url(image_key)

    designation = Designation(
        name=name,
        code=code,
        image_url=image_url
    )
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
    return {
        **designation.__dict__,
        "image_url": get_file_url(designation.image_url) if designation.image_url else None
    }

# Update Designation (code cannot be changed)
@router.put("/designation/{designation_id}", response_model=DesignationOut)
async def update_designation(
    designation_id: uuid.UUID,
    name: str = Form(...),
    image: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    designation = await session.get(Designation, designation_id)
    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")

    # Check for duplicate name (optional, but recommended)
    result_name = await session.execute(
        select(Designation).where(Designation.name == name, Designation.id != designation_id)
    )
    if result_name.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Designation name already exists")

    designation.name = name

    if image:
        image_key = f"designations/{uuid.uuid4()}_{image.filename}"
        image_bytes = await image.read()
        upload_file(image_bytes, image_key, image.content_type)
        designation.image_url = get_file_url(image_key)

    await session.commit()
    await session.refresh(designation)
    return {
        **designation.__dict__,
        "image_url": get_file_url(designation.image_url) if designation.image_url else None
    }


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
    return [
        {
            **designation.__dict__,
            "image_url": get_file_url(designation.image_url) if designation.image_url else None
        }
        for designation in designations
    ]




@router.get("/terms-privacy", response_model=TermsPrivacyOut)
async def get_terms_privacy(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    # Fetch the global terms/privacy (just get the first one)
    result = await session.execute(select(TermsPrivacy))
    template = result.scalars().first()
    if not template:
        raise HTTPException(404, "Terms/Privacy not found")

    center_data = {}
    if current_user["role"] in ("centeradmin", "member"):
        center_id = None
        if current_user["role"] == "centeradmin":
            center_admin = await session.get(CenterAdmin, current_user["user_id"])
            if not center_admin:
                raise HTTPException(404, "CenterAdmin not found")
            center_id = center_admin.center_id
        elif current_user["role"] == "member":
            from app.auth.models.models import Member
            member = await session.get(Member, current_user["user_id"])
            if not member:
                raise HTTPException(404, "Member not found")
            center_id = member.home_center_id

        center = await session.get(Center, center_id)
        if not center:
            raise HTTPException(404, "Center not found")

        # Explicitly fetch address using address_id to avoid MissingGreenlet
        address = None
        if center.address_id:
            from app.settings.models.models import Address
            address = await session.get(Address, center.address_id)

        center_data = {
            "center_name": center.center_name,
            "center_address": (
                f"{address.address_line_1 or ''}, {address.address_line_2 or ''}, "
                f"{address.city or ''}, {address.state or ''}, {address.country or ''}, {address.postal_code or ''}"
            ) if address else "",
        }

    rendered_content = Template(template.content).render(**center_data)
    return {
        "id": template.id,
        "title": template.title,
        "content": rendered_content,
        "created_at": template.created_at,
        "updated_at": template.updated_at,
    }


@router.post("/terms-privacy", response_model=TermsPrivacyOut)
async def create_terms_privacy(
    title: str = Form(...),
    content: str = Form(...),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(superadmin_required)
):
    terms = TermsPrivacy(
        title=title,
        content=content,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(terms)
    await session.commit()
    await session.refresh(terms)
    return terms


@router.post("/faqs", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
async def create_faq(
    data: FAQCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(superadmin_required)
):
    faq = FAQ(
        id=uuid4(),
        question=data.question,
        answer=data.answer,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(faq)
    await session.commit()
    await session.refresh(faq)
    return faq

# List FAQs (all members)
@router.get("/faqs", response_model=List[FAQOut])
async def list_faqs(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(FAQ))
    faqs = result.scalars().all()
    return faqs



@router.get("/center/time-slots/all", response_model=List[CenterTimeSlotOut])
async def list_all_time_slots(
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(CenterTimeSlot))
    slots = result.scalars().all()
    return slots



