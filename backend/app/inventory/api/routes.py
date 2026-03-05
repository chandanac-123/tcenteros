from fastapi import APIRouter,Depends, HTTPException
from app.core.models.models import SKU
from app.inventory.models.models import Product, Stock
from app.settings.models.models import SKUCategory
from app.core.models.models import User
from app.core.dependencies import get_db, get_current_user
from sqlalchemy.orm import Session
from app.inventory.schema.schema import ProductCreateRequest
from app.core.security import generate_sku_code
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import centeradmin_required





router = APIRouter()

@router.post("/products")
async def create_product(
    request: ProductCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(centeradmin_required)
):

    center_id = current_user["center_id"]

    sku_code = await generate_sku_code(db, center_id)

    sku = SKU(
        sku_code=sku_code,
        name=request.name,
        sku_category_id=request.sku_category_id,
        center_id=center_id,
        description=request.description,
        base_price=request.base_price,
        unit_of_measure=request.unit_of_measure
    )

    db.add(sku)
    await db.flush()

    product = Product(
        id=sku.id,
        selling_price=request.selling_price,
        reorder_level=request.reorder_level,
        track_inventory=True
    )

    db.add(product)
    await db.flush()

    stock = Stock(
        product_id=product.id,
        quantity_available=0
    )

    db.add(stock)

    await db.commit()

    return {
        "message": "Product created successfully",
        "product_id": str(product.id),
        "sku_code": sku_code
    }
