from sqlalchemy.ext.asyncio import AssyncSession
from app.settings.models.models import CenterCategory
from app.s3.service  import upload_file, get_file_url




async def create_center_category_superadmin(
        db: AssyncSession,
        name:str,
        image_file:None,

):
    #upload image file to s3 and get the url
    image_key = None
    image_url = None

    if image_file:
        image_key = upload_file(image_file)
        image_url = get_file_url(image_key)

    #create db object
    center_category = CenterCategory(
        name=name
    )
    db.add(center_category)
    await db.commit()
    await db.refresh(center_category)
    return {
        "message" : True,
        "id" : str(center_category.id),
        "name" : center_category.name,
        "image_url" : image_url,
        "status" : center_category.status
    }