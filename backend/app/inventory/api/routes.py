from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_async_session, centeradmin_required
from app.inventory.schema.schema import ProductCreateRequest, ProductUpdateRequest, StockAdjustRequest, StockOut
from app.core.models.models import SKU
from app.inventory.models.models import Product, Stock, StockTransaction
from app.core.security import generate_sku_code
import asyncio
from uuid import uuid4
from sqlalchemy import select,func
from datetime import datetime


router = APIRouter()


async def _call_maybe_async(func, *args, **kwargs):
    if asyncio.iscoroutinefunction(func):
        return await func(*args, **kwargs)
    return await asyncio.to_thread(func, *args, **kwargs)


async def _generate_unique_sku_code(db: AsyncSession, center_id):
    try:
        code = await _call_maybe_async(generate_sku_code, db, center_id)
    except Exception:
        code = None
    if not code:
        code = f"SKU-{uuid4().hex[:10].upper()}"
    # ensure uniqueness (best-effort)
    stmt = select(SKU.id).where(SKU.sku_code == code)
    res = await db.execute(stmt)
    if res.scalar_one_or_none() is None:
        return code
    # fallback different uuid if collision
    return f"SKU-{uuid4().hex[:10].upper()}"

#create product endpoint
@router.post("/products")
async def create_product(
    payload: ProductCreateRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(centeradmin_required),
):
    center_id = current_user.get("center_id")
    if not center_id:
        raise HTTPException(status_code=400, detail="center_id missing in current user token")

    if not payload.name:
        raise HTTPException(status_code=400, detail="`name` is required")
    if payload.base_price is None:
        raise HTTPException(status_code=400, detail="`base_price` is required")
    if payload.selling_price is None:
        raise HTTPException(status_code=400, detail="`selling_price` is required")

    # Generate SKU code (use your existing generator; fallback if needed)
    try:
        sku_code = await _generate_unique_sku_code(db, center_id, generate_sku_code)
    except Exception:
        sku_code = f"SKU-{uuid4().hex[:10].upper()}"

    try:
        # IMPORTANT: instantiate Product (subclass) with base SKU attributes + product attributes.
        product = Product(
            sku_code=sku_code,                # from SKU
            name=payload.name,                # from SKU
            sku_category_id=payload.sku_category_id,
            center_id=center_id,
            description=payload.description,
            base_price=payload.base_price,
            unit_of_measure=payload.unit_of_measure,
            # Product-specific fields:
            selling_price=payload.selling_price,
            reorder_level=payload.reorder_level or 0,
            track_inventory=True,
        )

        db.add(product)
        await db.flush()  # ensures product.id is populated and will cause insertion of shared.sku + inventory.products

        # Create stock row referencing the product.id
        stock = Stock(product_id=product.id, quantity_available=0)
        db.add(stock)

        await db.commit()
    except IntegrityError as ie:
        await db.rollback()
        print("DB IntegrityError creating product:", ie)
        raise HTTPException(status_code=500, detail=f"Database integrity error: {ie}")
    except Exception as exc:
        await db.rollback()
        print("Unexpected error creating product:", exc)
        raise HTTPException(status_code=500, detail=f"Failed to create product: {exc}") from exc

    return {"message": "Product created successfully", "product_id": str(product.id), "sku_code": sku_code}



#list products endpoint with pagination, filtering by name, price range, stock range (centeradmin only)
@router.get("/products", summary="List products (centeradmin)")
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    name: Optional[str] = Query(None, description="Search by product name (partial, case-insensitive)"),
    price_min: Optional[float] = Query(None, description="Minimum base price"),
    price_max: Optional[float] = Query(None, description="Maximum base price"),
    stock_min: Optional[int] = Query(None, description="Minimum stock quantity"),
    stock_max: Optional[int] = Query(None, description="Maximum stock quantity"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    # Ensure center context
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Build base query: select Product and stock quantity (left join)
    stmt = select(Product, Stock.quantity_available).outerjoin(Stock, Stock.product_id == Product.id).where(Product.center_id == center_id)

    # Collect filters
    if name:
        stmt = stmt.where(Product.name.ilike(f"%{name}%"))
    if price_min is not None:
        stmt = stmt.where(Product.base_price >= price_min)
    if price_max is not None:
        stmt = stmt.where(Product.base_price <= price_max)
    if stock_min is not None:
        stmt = stmt.where(Stock.quantity_available >= stock_min)
    if stock_max is not None:
        stmt = stmt.where(Stock.quantity_available <= stock_max)

    # Count total (distinct products). Use a subquery to avoid duplication from join
    count_subq = select(func.count()).select_from(
        select(Product.id).outerjoin(Stock, Stock.product_id == Product.id).where(Product.center_id == center_id)
        .where(*(stmt._where_criteria or []))  # reuse where criteria (SQLAlchemy internals)
        .distinct()
        .subquery()
    )
    total_result = await db.execute(count_subq)
    total = total_result.scalar_one() or 0

    # Pagination + ordering
    stmt = stmt.order_by(Product.name).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    rows = result.all()

    products = []
    for prod, stock_qty in rows:
        products.append({
            "product_id": str(prod.id),
            "sku_code": getattr(prod, "sku_code", None),
            "name": prod.name,
            "base_price": float(prod.base_price) if prod.base_price is not None else None,
            "selling_price": float(getattr(prod, "selling_price", None)) if getattr(prod, "selling_price", None) is not None else None,
            "stock": int(stock_qty) if stock_qty is not None else 0,
            "reorder_level": int(getattr(prod, "reorder_level", 0)) if getattr(prod, "reorder_level", None) is not None else 0,
            "status": prod.status.value if getattr(prod, "status", None) else None,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "products": products,
    }


@router.patch("/products/{product_id}")
async def patch_product(
    product_id: str = Path(..., description="Product ID"),
    payload: ProductUpdateRequest = None,
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    # Fetch product (Product is subclass of SKU)
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Enforce centeradmin scope
    if str(product.center_id) != str(current_admin.get("center_id")):
        raise HTTPException(status_code=403, detail="Not allowed to update this product")

    update_data = payload.dict(exclude_unset=True) if payload else {}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # If sku_code is being changed, ensure uniqueness
    if "sku_code" in update_data:
        new_code = update_data["sku_code"]
        if new_code:
            stmt = select(SKU.id).where(SKU.sku_code == new_code, SKU.id != product.id)
            res = await db.execute(stmt)
            if res.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="sku_code already exists")

    # Apply updates to product instance (Product inherits SKU fields)
    sku_fields = ("name", "sku_code", "sku_category_id", "description", "base_price", "unit_of_measure", "status")
    product_fields = ("selling_price", "reorder_level", "track_inventory")

    for key, value in update_data.items():
        # Stock is handled separately below
        if key == "quantity_available":
            continue
        if key in sku_fields or key in product_fields:
            setattr(product, key, value)

    # Handle stock update if provided
    if "quantity_available" in update_data:
        qty = update_data["quantity_available"]
        stmt = select(Stock).where(Stock.product_id == product.id)
        res = await db.execute(stmt)
        stock = res.scalar_one_or_none()
        if stock:
            stock.quantity_available = qty
        else:
            stock = Stock(product_id=product.id, quantity_available=qty)
            db.add(stock)

    # Commit and return updated product summary
    try:
        await db.commit()
        await db.refresh(product)
    except IntegrityError as ie:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {ie}") from ie
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {exc}") from exc

    # Fetch stock quantity for response
    stmt = select(Stock.quantity_available).where(Stock.product_id == product.id)
    res = await db.execute(stmt)
    stock_qty = res.scalar_one_or_none() or 0

    return {
        "product_id": str(product.id),
        "sku_code": getattr(product, "sku_code", None),
        "name": product.name,
        "base_price": float(product.base_price) if product.base_price is not None else None,
        "selling_price": float(product.selling_price) if getattr(product, "selling_price", None) is not None else None,
        "stock": int(stock_qty),
        "reorder_level": int(product.reorder_level) if getattr(product, "reorder_level", None) is not None else 0,
        "status": product.status.value if getattr(product, "status", None) else None,
    }


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str = Path(..., description="Product ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    # 1) Fetch product (Product is joined-table subclass of SKU)
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2) Ensure centeradmin is allowed to delete this product
    if str(product.center_id) != str(current_admin.get("center_id")):
        raise HTTPException(status_code=403, detail="Not allowed to delete this product")

    try:
        # 3) Remove stock row if present
        stmt = select(Stock).where(Stock.product_id == product.id)
        res = await db.execute(stmt)
        stock = res.scalar_one_or_none()
        if stock:
            await db.delete(stock)

        # 4) Delete the product instance (will remove subclass row; base row (SKU) is removed as part of same mapped instance)
        await db.delete(product)

        await db.commit()
        # 204 No Content; fastapi will return an empty body
        return
    except IntegrityError as ie:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {ie}") from ie
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {exc}") from exc
    


#stock adjustment endpoint (centeradmin only)
@router.post("/stocks/adjust", response_model=StockOut)
async def adjust_stock(
    payload: StockAdjustRequest,
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    # Validate transaction_type
    tx_type = (payload.transaction_type or "IN").upper()
    if tx_type not in ("IN", "OUT"):
        raise HTTPException(status_code=400, detail="transaction_type must be 'IN' or 'OUT'")

    # Lookup product
    stmt = select(Product).where(Product.id == payload.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Enforce centeradmin scope
    admin_center = current_admin.get("center_id")
    if not admin_center or str(product.center_id) != str(admin_center):
        raise HTTPException(status_code=403, detail="Not allowed to modify stock for this product")

    # Get or create stock
    stock_stmt = select(Stock).where(Stock.product_id == product.id)
    stock_res = await db.execute(stock_stmt)
    stock = stock_res.scalar_one_or_none()

    # Determine new balance
    qty = int(payload.quantity)
    if qty <= 0:
        raise HTTPException(status_code=400, detail="quantity must be a positive integer")

    if not stock:
        if tx_type == "OUT":
            raise HTTPException(status_code=400, detail="Cannot perform OUT transaction: no existing stock")
        stock = Stock(product_id=product.id, quantity_available=0)
        db.add(stock)
        await db.flush()  # ensure stock.id available

    current_balance = stock.quantity_available or 0
    if tx_type == "IN":
        new_balance = current_balance + qty
    else:  # OUT
        if qty > current_balance:
            raise HTTPException(status_code=400, detail="Insufficient stock for OUT transaction")
        new_balance = current_balance - qty

    # Create stock transaction record
    stock_tx = StockTransaction(
        product_id=product.id,
        transaction_type=tx_type,
        quantity=qty,
        balance_after=new_balance,
        supplier_name=payload.supplier_name,
        invoice_number=payload.invoice_number,
        invoice_date=payload.invoice_date,
        reference=payload.reference,
    )
    db.add(stock_tx)

    # Update stock balance and audit fields
    stock.quantity_available = new_balance
    stock.updated_at = datetime.utcnow()

    try:
        await db.commit()
    except IntegrityError as ie:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database integrity error: {ie}") from ie
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to adjust stock: {exc}") from exc

    return StockOut(product_id=product.id, quantity_available=stock.quantity_available)