from fastapi import APIRouter, Form , UploadFile, File, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from sqlalchemy.exc import IntegrityError
from app.core.database import get_async_session
from app.auth.models.models import MemberStatusEnum, Member
from app.settings.models.models import CenterCategory, TaxCategory, Designation, Address
from app.settings.schema.schema import CenterCategoryOut, TaxCategoryCreate, TaxCategoryOut, TaxCategoryUpdate, CenterOperationalSettingCreate, CenterOperationalSettingUpdate, CenterOperationalSettingOut, DesignationCreate, DesignationOut, DesignationUpdate, TermsPrivacyOut, CenterHolidayCreate,  CenterHolidayOut
from app.settings.models.models import CenterOperationalSetting, CenterHoliday, WeekDayEnum
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
from datetime import timedelta
import uuid
from app.s3.service import get_file_url
import random
import re
from datetime import datetime
from pydantic import UUID4
from app.settings.models.models import SKUCategory
from app.settings.schema.schema import SKUCategoryCreate, SKUCategoryOut
from uuid import UUID
from app.s3.service import delete_file



router = APIRouter()

#center category
@router.post(
    "/center-categories/",
    response_model=CenterCategoryOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_center_category(
    name: str = Form(...),
    code: str = Form(...),
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can create center categories.")

    image_key = f"center_categories/{uuid4()}_{image.filename}"
    image_bytes = await image.read()
    upload_file(image_bytes, image_key, image.content_type)
    # Store only the key in DB
    category = CenterCategory(
        name=name,
        code=code,
        image_url=image_key,
    )

    session.add(category)
    await session.commit()
    await session.refresh(category)

    # Return with public URL
    return {
        **category.__dict__,
        "image_url": get_file_url(category.image_url) if category.image_url else None
    }

@router.get("/center-categories/", response_model=list[CenterCategoryOut])
async def list_center_categories(
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(CenterCategory))
    categories = result.scalars().all()
    # Return with public URLs
    return [
        {
            **cat.__dict__,
            "image_url": get_file_url(cat.image_url) if cat.image_url else None
        }
        for cat in categories
    ]

@router.delete("/center-categories/{category_id}", status_code=204)
async def delete_center_category(
    category_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can delete center categories.")

    result = await session.execute(select(CenterCategory).where(CenterCategory.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Center category not found")

    # Delete image from S3 if it exists
    if category.image_url:
        try:
            delete_file(category.image_url)
        except Exception as e:
            # Log or handle error, but continue to delete the DB record
            pass

    await session.delete(category)
    await session.commit()
    return



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
        inventory_profit=data.inventory_profit,
        payroll_cycle_day=data.payroll_cycle_day
    )
    session.add(ops)
    await session.commit()
    await session.refresh(ops)
    return ops

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
# Create Designation (centeradmin only, in own center)
@router.post("/designation", response_model=DesignationOut)
async def create_designation(
    name: str = Form(...),
    image: UploadFile = File(None),  # <-- Now optional
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    # Check for duplicate name in this center
    result_name = await session.execute(
        select(Designation).where(Designation.name == name, Designation.center_id == center_id)
    )
    if result_name.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="There cannot be more than one designation with the same name in your center.")

    # Auto-generate code
    import random, re, uuid
    name_part = ''.join(re.findall(r'[A-Za-z]', name))[:3].upper().ljust(3, 'X')
    while True:
        rand_part = f"{random.randint(0, 999):03d}"
        code = f"{name_part}{rand_part}"
        result_code = await session.execute(
            select(Designation).where(Designation.code == code, Designation.center_id == center_id)
        )
        if not result_code.scalar_one_or_none():
            break

    image_url = None
    if image:
        image_key = f"designations/{uuid.uuid4()}_{image.filename}"
        image_bytes = await image.read()
        upload_file(image_bytes, image_key, image.content_type)
        image_url = get_file_url(image_key)

    designation = Designation(
        name=name,
        code=code,
        image_url=image_url,
        center_id=center_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(designation)
    try:
        await session.commit()
        await session.refresh(designation)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail="There cannot be more than one designation with the same name in your center."
        )

    return {
        **designation.__dict__,
        "image_url": image_url
    }


# Update Designation (centeradmin only, in own center)
@router.put("/designation/{designation_id}", response_model=DesignationOut)
async def update_designation(
    designation_id: uuid.UUID,
    name: str = Form(...),
    image: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    designation = await session.get(Designation, designation_id)
    if not designation or designation.center_id != center_id:
        raise HTTPException(status_code=404, detail="Designation not found in your center")

    # Check for duplicate name in this center
    result_name = await session.execute(
        select(Designation).where(Designation.name == name, Designation.id != designation_id, Designation.center_id == center_id)
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

# Delete Designation (centeradmin only, in own center)
@router.delete("/designation/{designation_id}")
async def delete_designation(
    designation_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")
    center_id = center_admin.center_id

    designation = await session.get(Designation, designation_id)
    if not designation or designation.center_id != center_id:
        raise HTTPException(status_code=404, detail="Designation not found in your center")
    await session.delete(designation)
    await session.commit()
    return {"detail": "Designation deleted"}

# List Designations (centeradmin/member, in own center)
@router.get("/designation", response_model=list[DesignationOut])
async def list_designations(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    center_id = None
    if current_user["role"] == "centeradmin":
        center_admin = await session.get(CenterAdmin, current_user["user_id"])
        center_id = center_admin.center_id
    elif current_user["role"] == "member":
        member = await session.get(Member, current_user["user_id"])
        center_id = member.home_center_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await session.execute(select(Designation).where(Designation.center_id == center_id))
    designations = result.scalars().all()
    return [
        {
            **designation.__dict__,
            "image_url": get_file_url(designation.image_url) if designation.image_url else None
        }
        for designation in designations
    ]

# Get Designation by ID (centeradmin/member, in own center)
@router.get("/designation/{designation_id}", response_model=DesignationOut)
async def get_designation(
    designation_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    center_id = None
    if current_user["role"] == "centeradmin":
        center_admin = await session.get(CenterAdmin, current_user["user_id"])
        center_id = center_admin.center_id
    elif current_user["role"] == "member":
        member = await session.get(Member, current_user["user_id"])
        center_id = member.home_center_id
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    designation = await session.get(Designation, designation_id)
    if not designation or designation.center_id != center_id:
        raise HTTPException(status_code=404, detail="Designation not found in your center")
    return {
        **designation.__dict__,
        "image_url": get_file_url(designation.image_url) if designation.image_url else None
    }



@router.get("/terms-privacy")
async def get_terms_privacy(
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    center_id = None
    is_guest = False

    # Determine user type and center
    if current_user["role"] == "guest":
        is_guest = True
    elif current_user["role"] == "centeradmin":
        center_admin = await session.get(CenterAdmin, current_user["user_id"])
        if not center_admin:
            raise HTTPException(404, "CenterAdmin not found")
        center_id = center_admin.center_id
    elif current_user["role"] == "member":
        member = await session.get(Member, current_user["user_id"])
        if not member:
            raise HTTPException(404, "Member not found")
        member_status = member.member_status.value if hasattr(member.member_status, "value") else str(member.member_status)
        # Guest if member_status is guest and no home_center_id
        if member_status == "guest" and not member.home_center_id:
            is_guest = True
        else:
            center_id = member.home_center_id

    # Always fetch the global TermsPrivacy (center_id is NULL)
    result = await session.execute(select(TermsPrivacy).where(TermsPrivacy.center_id == None))
    template = result.scalars().first()
    if not template:
        raise HTTPException(404, "Terms/Privacy not found")

    # Prepare center_data for template rendering
    if is_guest:
        center_data = {
            "center_name": "tcenteros",
            "center_address": "tcenteros address"
        }
    else:
        if not center_id:
            raise HTTPException(404, "Center not found")
        center = await session.get(Center, center_id)
        if not center:
            raise HTTPException(404, "Center not found")
        address = None
        if center.address_id:
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
    current_user=Depends(get_current_user)
):
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
    # For guest, center_id remains None

    terms = TermsPrivacy(
        title=title,
        content=content,
        center_id=center_id,
        created_by=current_user["user_id"],   # <-- Set this
        updated_by=current_user["user_id"],   # <-- Set this
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



#-----------------------------------------
#Holiday crud apis
#-----------------------------------------

#Create Holiday
@router.post("/center-holidays/", response_model=CenterHolidayOut, status_code=201)
async def create_center_holiday(
    data: CenterHolidayCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(403, "Not a center admin")
    center_id = center_admin.center_id

    # Prevent duplicate holiday for the same center and date
    existing = await session.execute(
        select(CenterHoliday).where(
            CenterHoliday.center_id == center_id,
            and_(
                CenterHoliday.start_date <= data.end_date,
                CenterHoliday.end_date >= data.start_date
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "A holiday already exists for the given date range.")

    # Calculate total_days and week_days
    total_days = (data.end_date - data.start_date).days + 1
    week_days = []
    for i in range(total_days):
        day = (data.start_date + timedelta(days=i)).strftime("%A").lower()
        week_days.append(day)

    holiday = CenterHoliday(
        center_id=center_id,
        holiday_name=data.holiday_name,
        start_date=data.start_date,
        end_date=data.end_date,
        total_days=total_days,
        week_days=week_days
    )
    session.add(holiday)
    await session.commit()
    await session.refresh(holiday)
    return CenterHolidayOut(
        id=holiday.id,
        holiday_name=holiday.holiday_name,
        start_date=holiday.start_date,
        end_date=holiday.end_date,
        day=holiday.week_days
    )

#List Holidays (with pagination)
@router.get("/center-holidays/", response_model=dict)
async def list_center_holidays(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(403, "Not a center admin")
    center_id = center_admin.center_id

    total = await session.execute(
        select(func.count()).select_from(CenterHoliday).where(CenterHoliday.center_id == center_id)
    )
    total_count = total.scalar()

    result = await session.execute(
        select(CenterHoliday)
        .where(CenterHoliday.center_id == center_id)
        .order_by(CenterHoliday.start_date.desc())
        .offset(skip)
        .limit(limit)
    )
    holidays = result.scalars().all()
    data = [
        {
            "id": h.id,
            "holiday_name": h.holiday_name,
            "start_date": h.start_date,
            "end_date": h.end_date,
            "day": [d.value for d in h.week_days]
        }
        for h in holidays
    ]
    return {"total": total_count, "data": data}


#Delete Holiday
@router.delete("/center-holidays/{holiday_id}", status_code=200)
async def delete_center_holiday(
    holiday_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await session.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(403, "Not a center admin")
    center_id = center_admin.center_id

    holiday = await session.get(CenterHoliday, holiday_id)
    if not holiday or holiday.center_id != center_id:
        raise HTTPException(404, "Holiday not found")
    await session.delete(holiday)
    await session.commit()
    return {"message": "Data deleted", "deleted_id": holiday_id}



# Create SKU Category
@router.post("/center/sku-categories", response_model=SKUCategoryOut, status_code=201)
async def create_sku_category(
    payload: SKUCategoryCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    center_id = center_admin.center_id

    # Check duplicate name inside same center
    result = await db.execute(
        select(SKUCategory).where(
            SKUCategory.name == payload.name,
            SKUCategory.center_id == center_id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="SKU category with this name already exists in this center."
        )

    sku_category = SKUCategory(
        center_id=center_id,
        name=payload.name,
        description=payload.description,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )

    db.add(sku_category)
    await db.commit()
    await db.refresh(sku_category)

    return sku_category

# List SKU Categories (for centeradmin's center)
@router.get("/center/sku-categories", response_model=List[SKUCategoryOut])
async def list_sku_categories(
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    result = await db.execute(
        select(SKUCategory).where(
            SKUCategory.center_id == center_admin.center_id
        )
    )

    categories = result.scalars().all()

    return categories

# Get SKU Category by ID
@router.get("/center/sku-categories/{category_id}", response_model=SKUCategoryOut)
async def get_sku_category_by_id(
    category_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    result = await db.execute(
        select(SKUCategory).where(
            SKUCategory.id == category_id,
            SKUCategory.center_id == center_admin.center_id
        )
    )

    sku_category = result.scalar_one_or_none()

    if not sku_category:
        raise HTTPException(status_code=404, detail="SKU category not found")

    return sku_category

# Delete SKU Category
@router.delete("/center/sku-categories/{category_id}", status_code=204)
async def delete_sku_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(centeradmin_required)
):
    center_admin = await db.get(CenterAdmin, current_user["user_id"])
    if not center_admin:
        raise HTTPException(status_code=403, detail="Not a center admin")

    result = await db.execute(
        select(SKUCategory).where(
            SKUCategory.id == category_id,
            SKUCategory.center_id == center_admin.center_id
        )
    )

    sku_category = result.scalar_one_or_none()

    if not sku_category:
        raise HTTPException(status_code=404, detail="SKU category not found")

    await db.delete(sku_category)
    await db.commit()

    return {"detail": "SKU category deleted"}


#to get inventory profit for a center (centeradmin only, for their center)
@router.get("/settings/inventory-profit", summary="Get center inventory profit (centeradmin)")
async def get_inventory_profit(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No center assigned to this user")

    stmt = select(CenterOperationalSetting.inventory_profit).where(
        CenterOperationalSetting.center_id == center_id
    ).limit(1)

    res = await db.execute(stmt)
    profit = res.scalar_one_or_none()

    # Return as string to preserve Decimal precision in JSON
    return {"center_id": str(center_id), "inventory_profit": str(profit) if profit is not None else "0.00"}



