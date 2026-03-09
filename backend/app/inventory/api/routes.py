from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path, status
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_async_session, centeradmin_required
from app.inventory.schema.schema import *
from app.core.models.models import SKU
from app.inventory.models.models import *
from app.core.security import generate_sku_code
from app.inventory.models.models import Sale, SaleItem, Product, Stock, StockTransaction
from app.settings.models.models import TaxCategory, TaxScope
from app.billing.models.models import PaymentOrder, PayerType, PayeeType, OrderType, ReferenceSchema, PaymentOrderStatus, PaymentMethod
import asyncio
from uuid import uuid4
from sqlalchemy import select,func, update, desc, delete
from datetime import datetime, date
from app.billing.models.models import PaymentOrder, PayerType, PayeeType, OrderType, ReferenceSchema, PaymentOrderStatus, Currency
from decimal import Decimal
from sqlalchemy.orm import selectinload


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

#list products endpoint for lookup (id + name only, centeradmin only)
@router.get("/products/lookup", summary="Lookup products (id + name only)")
async def list_products_lookup(
    q: Optional[str] = Query(None, description="Optional name filter (partial, case-insensitive)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    stmt = select(Product.id, Product.name).where(Product.center_id == center_id)
    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q}%"))
    stmt = stmt.order_by(Product.name).limit(limit)

    res = await db.execute(stmt)
    rows = res.all()

    products = [{"product_id": str(r[0]), "name": r[1]} for r in rows]
    return {"count": len(products), "products": products}

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
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    stmt = select(Product, Stock).outerjoin(Stock, Stock.product_id == Product.id).where(Product.center_id == center_id)

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

    # count distinct products (avoid duplication from join)
    count_subq = select(func.count()).select_from(
        select(Product.id).outerjoin(Stock, Stock.product_id == Product.id).where(Product.center_id == center_id)
        .where(*(stmt._where_criteria or []))
        .distinct()
        .subquery()
    )
    total_result = await db.execute(count_subq)
    total = total_result.scalar_one() or 0

    stmt = stmt.order_by(Product.name).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    rows = result.all()

    products = []
    for prod, stock in rows:
        products.append({
            "product_id": str(prod.id),
            "sku_code": getattr(prod, "sku_code", None),
            "name": prod.name,
            "base_price": float(prod.base_price) if prod.base_price is not None else None,
            "selling_price": float(getattr(prod, "selling_price", None)) if getattr(prod, "selling_price", None) is not None else None,
            "stock": int(stock.quantity_available) if stock and stock.quantity_available is not None else 0,
            "stock_id": str(stock.id) if stock else None,
            "last_cost": str(stock.last_cost) if stock and getattr(stock, "last_cost", None) is not None else None,
            "reorder_level": int(getattr(prod, "reorder_level", 0)) if getattr(prod, "reorder_level", None) is not None else 0,
            "status": prod.status.value if getattr(prod, "status", None) else None,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "products": products,
    }


@router.get("/products/{product_id}", summary="Get product by id (centeradmin)")
async def get_product_by_id(
    product_id: str = Path(..., description="Product ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    # Fetch product (Product is joined-table subclass of SKU)
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Enforce centeradmin scope
    if str(product.center_id) != str(current_admin.get("center_id")):
        raise HTTPException(status_code=403, detail="Not allowed to view this product")

    # Fetch stock quantity for response
    stmt = select(Stock.quantity_available).where(Stock.product_id == product.id)
    res = await db.execute(stmt)
    stock_qty = res.scalar_one_or_none() or 0

    return {
        "product_id": str(product.id),
        "sku_code": getattr(product, "sku_code", None),
        "sku_category_id": getattr(product, "sku_category_id", None),
        "name": getattr(product, "name", None),
        "description": getattr(product, "description", None),
        "base_price": float(product.base_price) if getattr(product, "base_price", None) is not None else None,
        "selling_price": float(getattr(product, "selling_price", None)) if getattr(product, "selling_price", None) is not None else None,
        "unit_of_measure": getattr(product, "unit_of_measure", None),
        "track_inventory": bool(getattr(product, "track_inventory", False)),
        "stock": int(stock_qty),
        "reorder_level": int(getattr(product, "reorder_level", 0)) if getattr(product, "reorder_level", None) is not None else 0,
        "status": product.status.value if getattr(product, "status", None) else None,
        "created_at": getattr(product, "created_at", None).isoformat() if getattr(product, "created_at", None) else None,
        "updated_at": getattr(product, "updated_at", None).isoformat() if getattr(product, "updated_at", None) else None,
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
    


@router.post("/stock/adjust")
async def add_stock(
    payload: StockAdjustIn,
    session: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(centeradmin_required),
):
    TRANSACTION_TYPE = "IN"

    # verify product exists
    product = await session.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # enforce centeradmin scope (avoid records for other centers)
    center_id = current_user.get("center_id")
    if not center_id or str(product.center_id) != str(center_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to modify this product")

    # compute quantities and amounts
    qty = int(payload.quantity)
    unit_cost = Decimal(payload.cost_price)
    subtotal = (unit_cost * Decimal(qty)).quantize(Decimal("0.01"))
    tax_amount = Decimal("0.00")
    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    payer_user_id = current_user.get("id") or current_user.get("user_id")

    async def _work():
        # 1) create StockTransaction
        stock_tx = StockTransaction(
            product_id=product.id,
            quantity=qty,
            transaction_type=TRANSACTION_TYPE,
            unit_cost=unit_cost,
            subtotal=subtotal,
            supplier_name=payload.supplier_name,
            invoice_number=payload.invoice_number,
            invoice_date=payload.invoice_date,
        )
        session.add(stock_tx)
        await session.flush()  # ensure stock_tx.id

        # 2) update/create Stock aggregate
        q = select(Stock).where(Stock.product_id == product.id).limit(1)
        res = await session.execute(q)
        stock = res.scalars().first()

        if stock:
            new_qty = (stock.quantity_available or 0) + qty
            stock.quantity_available = new_qty
            stock.last_cost = unit_cost
            session.add(stock)
        else:
            new_qty = qty
            stock = Stock(
                product_id=product.id,
                quantity_available=new_qty,
                last_cost=unit_cost,
            )
            session.add(stock)

        await session.flush()  # populate stock.id if new

        # update transaction balance_after and persist
        stock_tx.balance_after = new_qty
        session.add(stock_tx)
        await session.flush()

        # 3) create PaymentOrder linked to stock_tx
        po = PaymentOrder(
            payer_user_id=payer_user_id,
            payer_type=PayerType.center_admin,
            payee_type=PayeeType.center,
            center_id=center_id,
            order_type=OrderType.stock_purchase,
            reference_schema=ReferenceSchema.invoice,
            reference_id=stock_tx.id,
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=getattr(product, "currency", Currency.INR),
            status=PaymentOrderStatus.paid,
            payment_method=None,
        )
        session.add(po)
        await session.flush()

        return stock_tx, stock, po

    # perform work and explicitly commit (rollback on error)
    try:
        stock_tx, stock, po = await _work()
        await session.commit()
    except Exception as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add stock: {exc}") from exc

    # refresh to ensure we have latest DB state on objects
    try:
        await session.refresh(stock_tx)
        await session.refresh(stock)
        await session.refresh(po)
    except Exception:
        # non-fatal; objects are still safe to read
        pass

    return {
        "stock_transaction_id": str(stock_tx.id),
        "stock_id": str(stock.id),
        "payment_order_id": str(po.payment_order_id),
        "subtotal": str(subtotal),
        "tax": str(tax_amount),
        "total": str(total_amount),
    }


@router.get("/stock-history")
async def list_all_stock_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    product_id: Optional[str] = Query(None, description="Filter by product id"),
    transaction_type: Optional[str] = Query(None, description="IN or OUT"),
    date_from: Optional[date] = Query(None, description="From invoice/created date (inclusive)"),
    date_to: Optional[date] = Query(None, description="To invoice/created date (inclusive)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Return stock-add history (one row per StockTransaction) with:
      - product_id
      - product_name
      - available_quantity (current aggregate from `stocks`)
      - quantity_added (stock transaction quantity)
      - cost_price (unit_cost)
      - total (subtotal)
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Filter SKUs by center using a subquery (avoid duplicate joins)
    sku_ids_sel = select(SKU.id).where(SKU.center_id == center_id)
    where_clauses = [StockTransaction.product_id.in_(sku_ids_sel)]

    if product_id:
        where_clauses.append(StockTransaction.product_id == product_id)
    if transaction_type:
        where_clauses.append(StockTransaction.transaction_type == transaction_type.upper())

    created_at_attr = getattr(StockTransaction, "created_at", None)
    if date_from:
        if created_at_attr is not None:
            where_clauses.append(StockTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date >= date_from)
    if date_to:
        if created_at_attr is not None:
            where_clauses.append(StockTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date <= date_to)

    # Count total matching stock_transactions
    count_stmt = select(func.count()).select_from(StockTransaction).where(*where_clauses)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Main query: StockTransaction join Product, left join Stock (to get available quantity)
    stmt = (
        select(StockTransaction, Product, Stock)
        .join(Product, Product.id == StockTransaction.product_id)
        .outerjoin(Stock, Stock.product_id == Product.id)
        .where(*where_clauses)
    )

    # Order by created_at (if present) else by invoice_date
    order_col = created_at_attr if created_at_attr is not None else StockTransaction.invoice_date
    stmt = stmt.order_by(desc(order_col)).offset((page - 1) * page_size).limit(page_size)

    res = await db.execute(stmt)
    rows = res.all()

    out_rows = []
    for st, prod, stock in rows:
        out_rows.append({
            "product_id": str(prod.id),
            "product_name": getattr(prod, "name", None),
            "available_quantity": int(stock.quantity_available) if stock and stock.quantity_available is not None else 0,
            "quantity_added": int(st.quantity or 0),
            "cost_price": str(st.unit_cost) if getattr(st, "unit_cost", None) is not None else None,
            "total": str(st.subtotal) if getattr(st, "subtotal", None) is not None else None,
            "transaction_id": str(st.id),
            "invoice_date": st.invoice_date.isoformat() if st.invoice_date else None,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "rows": out_rows,
    }



@router.get("/stock-transactions")
async def list_stock_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    product_id: Optional[str] = Query(None, description="Filter by product id"),
    transaction_type: Optional[str] = Query(None, description="IN or OUT"),
    date_from: Optional[date] = Query(None, description="Filter transactions from this date (inclusive)"),
    date_to: Optional[date] = Query(None, description="Filter transactions up to this date (inclusive)"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # SKU id subquery for this center (avoids duplicate joins)
    sku_ids_sel = select(SKU.id).where(SKU.center_id == center_id)
    where_clauses = [StockTransaction.product_id.in_(sku_ids_sel)]

    if product_id:
        where_clauses.append(StockTransaction.product_id == product_id)
    if transaction_type:
        where_clauses.append(StockTransaction.transaction_type == transaction_type.upper())

    created_at_attr = getattr(StockTransaction, "created_at", None)
    if date_from:
        if created_at_attr is not None:
            where_clauses.append(StockTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date >= date_from)
    if date_to:
        if created_at_attr is not None:
            where_clauses.append(StockTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date <= date_to)

    # Count total rows
    count_stmt = select(func.count()).select_from(StockTransaction).join(
        Product, Product.id == StockTransaction.product_id
    ).where(*where_clauses)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Main query: join Product and left join Stock
    stmt = select(StockTransaction, Product, Stock).join(
        Product, Product.id == StockTransaction.product_id
    ).outerjoin(
        Stock, Stock.product_id == Product.id
    ).where(*where_clauses)

    order_col = created_at_attr if created_at_attr is not None else StockTransaction.invoice_date
    stmt = stmt.order_by(desc(order_col)).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    rows = result.all()

    transactions = []
    for st, prod, stock in rows:
        transactions.append({
            "id": str(st.id),
            "product_id": str(st.product_id),
            "product_name": getattr(prod, "name", None),
            "sku_code": getattr(prod, "sku_code", None),
            "transaction_type": st.transaction_type,
            "quantity": int(st.quantity or 0),
            "unit_cost": str(st.unit_cost) if getattr(st, "unit_cost", None) is not None else None,
            "subtotal": str(st.subtotal) if getattr(st, "subtotal", None) is not None else None,
            "balance_after": int(st.balance_after) if st.balance_after is not None else (int(stock.quantity_available) if stock and stock.quantity_available is not None else None),
            "supplier_name": st.supplier_name,
            "invoice_number": st.invoice_number,
            "invoice_date": st.invoice_date.isoformat() if st.invoice_date else None,
            "reference": st.reference,
            "created_at": st.created_at.isoformat() if getattr(st, "created_at", None) else None,
            "created_by": str(st.created_by) if getattr(st, "created_by", None) else None,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "transactions": transactions,
    }


#-----------sales/cart endpoints (pending Sale + SaleItem as cart + cart items; simple implementation for demo; no tax handling or discounts here; just a line-item cart with server-side subtotal/tax/total recompute on each change) -----------

# helper: fetch or create a pending Sale (cart) for this center + user
async def _get_or_create_cart(db: AsyncSession, center_id: str, user_id: str):
    # Prefer a per-user pending cart: one pending Sale per (center, user)
    stmt = select(Sale).where(
        Sale.center_id == center_id,
        Sale.status == "pending",
        Sale.created_by == user_id
    )
    res = await db.execute(stmt)
    cart = res.scalars().first()
    if cart:
        return cart

    # create new pending cart and explicitly set the owner (created_by)
    cart = Sale(
        center_id=center_id,
        subtotal_amount=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("0.00"),
        currency="INR",
        status="pending",
        created_by=user_id
    )
    db.add(cart)
    await db.flush()
    return cart

# Create a new pending cart for the center (no customer details saved)
@router.post("/sales/carts", status_code=status.HTTP_201_CREATED)
async def create_cart(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    cart = Sale(
        center_id=center_id,
        subtotal_amount=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("0.00"),
        currency="INR",
        status="pending",
        created_by=user_id
    )
    db.add(cart)
    try:
        await db.flush()
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create cart")
    return {"cart_id": str(cart.id)}


# List all pending carts for the caller's center (center-wide, not limited to creator)
@router.get("/sales/carts")
async def list_carts(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    stmt = select(Sale).where(Sale.center_id == center_id, Sale.status == "pending").order_by(Sale.created_at.desc())
    res = await db.execute(stmt)
    carts = res.unique().scalars().all()

    out = []
    for c in carts:
        out.append({
            "cart_id": str(c.id),
            "subtotal": str(c.subtotal_amount),
            "tax": str(c.tax_amount),
            "total": str(c.total_amount),
            "created_by": str(getattr(c, "created_by", None)) if getattr(c, "created_by", None) else None,
            "created_at": getattr(c, "created_at", None).isoformat() if getattr(c, "created_at", None) else None,
        })
    return {"count": len(out), "carts": out}


# Cancel (delete) a pending cart and its items. Only allowed for carts belonging to the same center and that are still pending.
@router.delete("/sales/carts/{cart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart(
    cart_id: str = Path(..., description="Cart ID to cancel"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    cart = await db.get(Sale, cart_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    if str(cart.center_id) != str(center_id):
        raise HTTPException(status_code=403, detail="Not allowed to cancel this cart")
    if cart.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending carts can be cancelled")

    try:
        # delete items first
        await db.execute(delete(SaleItem).where(SaleItem.sale_id == cart.id))
        # delete cart row
        await db.execute(delete(Sale).where(Sale.id == cart.id))
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel cart: {exc}") from exc

    return




# POST add item(s) — corrected add_cart_item
# - Top-level list -> create a new cart for the batch
# - payload dict: supports 'cart_id' to add to specific cart, or 'create_cart' to force a new cart, or 'items' array, or single product_id + quantity
# - No customer data is stored
@router.post("/sales/cart/items", status_code=status.HTTP_201_CREATED)
async def add_cart_item(
    payload: Any = Body(...),
    cart_id: Optional[str] = Query(None, description="Optional cart id. Use 'new' to create a new cart."),
    create_cart: bool = Query(False, description="If true, always create a new cart for this request."),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")

    # determine incoming items and implicit create_new behavior from the body
    if isinstance(payload, list):
        lines = payload
        body_requested_create_new = True
    elif isinstance(payload, dict):
        if "items" in payload and isinstance(payload["items"], list):
            lines = payload["items"]
        elif "product_id" in payload:
            lines = [payload]
        else:
            raise HTTPException(status_code=400, detail="payload must contain 'product_id' or 'items'")
        body_requested_create_new = bool(payload.get("create_cart") or payload.get("create_new") or (isinstance(payload.get("cart_id"), str) and payload.get("cart_id").lower() == "new"))
    else:
        raise HTTPException(status_code=400, detail="invalid payload")

    if not lines:
        raise HTTPException(status_code=400, detail="no items provided")

    # Decision precedence:
    # 1) Query param `cart_id` if provided (and not "new")
    # 2) Query param `create_cart` true forces new cart
    # 3) Body top-level list or body create flags request new cart
    # 4) Otherwise use per-user pending cart
    created_new_cart = False
    added = []

    try:
        # Create new cart when requested via query or body
        if (cart_id and isinstance(cart_id, str) and cart_id.lower() == "new") or create_cart or body_requested_create_new:
            if cart_id and isinstance(cart_id, str) and cart_id.lower() != "new" and create_cart:
                raise HTTPException(status_code=400, detail="cannot specify both 'cart_id' and 'create_cart'")
            cart = Sale(
                center_id=center_id,
                subtotal_amount=Decimal("0.00"),
                tax_amount=Decimal("0.00"),
                total_amount=Decimal("0.00"),
                currency="INR",
                status="pending",
                created_by=user_id
            )
            db.add(cart)
            await db.flush()
            created_new_cart = True
        else:
            # Resolve cart: explicit cart_id via query -> validate; otherwise use per-user pending cart
            if cart_id:
                cart = await db.get(Sale, cart_id)
                if not cart:
                    raise HTTPException(status_code=404, detail="cart not found")
                if str(cart.center_id) != str(center_id) or cart.status != "pending":
                    raise HTTPException(status_code=403, detail="Not allowed to modify this cart")
                # NOTE: ownership check relaxed — any centeradmin in same center may operate pending carts
            else:
                cart = await _get_or_create_cart(db, center_id, user_id)

        # Add items to cart (increment existing or create new item)
        for idx, line in enumerate(lines):
            product_id = line.get("product_id")
            try:
                qty = int(line.get("quantity", 1))
            except Exception:
                raise HTTPException(status_code=400, detail=f"invalid quantity for item {idx}")
            if qty <= 0:
                raise HTTPException(status_code=400, detail="quantity must be > 0")

            prod = await db.get(Product, product_id)
            if not prod:
                raise HTTPException(status_code=404, detail=f"product {product_id} not found")
            if str(getattr(prod, "center_id", None)) != str(center_id):
                raise HTTPException(status_code=403, detail="Not allowed to add product from another center")

            unit_price = getattr(prod, "selling_price", None) or getattr(prod, "base_price", None)
            if unit_price is None:
                raise HTTPException(status_code=400, detail=f"product {product_id} has no price")
            unit_price = Decimal(str(unit_price))

            stmt = select(SaleItem).where(SaleItem.sale_id == cart.id, SaleItem.product_id == prod.id).limit(1)
            res = await db.execute(stmt)
            item = res.scalars().first()

            if item:
                item.quantity = item.quantity + qty
                item.line_subtotal = (Decimal(str(item.unit_price)) * int(item.quantity)).quantize(Decimal("0.01"))
                db.add(item)
            else:
                item = SaleItem(
                    sale_id=cart.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=unit_price,
                    line_subtotal=(unit_price * Decimal(qty)).quantize(Decimal("0.01")),
                )
                db.add(item)
                await db.flush()

            added.append({"cart_item_id": str(item.id), "product_id": str(prod.id), "quantity": int(qty)})

        # Recompute totals for the cart (server-authoritative)
        stmt = select(func.coalesce(func.sum(SaleItem.line_subtotal), 0)).where(SaleItem.sale_id == cart.id)
        res = await db.execute(stmt)
        subtotal = Decimal(str(res.scalar_one() or "0.00")).quantize(Decimal("0.01"))
        cart.subtotal_amount = subtotal
        cart.tax_amount = Decimal("0.00")
        cart.total_amount = subtotal
        db.add(cart)

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add items to cart: {exc}") from exc

    return {
        "message": "items added",
        "cart_id": str(cart.id),
        "created_new_cart": created_new_cart,
        "added_count": len(added),
        "items": added
    }


# PATCH update a cart item quantity (ownership check relaxed)
@router.patch("/sales/cart/items/{item_id}")
async def update_cart_item(
    item_id: str,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    new_qty = int(payload.get("quantity", 0))
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="quantity must be >= 0")
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")

    try:
        # Try treat path param as SaleItem.id first (select only columns)
        stmt = select(SaleItem.id, SaleItem.sale_id, SaleItem.unit_price).where(SaleItem.id == item_id).limit(1)
        res = await db.execute(stmt)
        row = res.first()

        # Fallback: interpret path param as product_id and find the SaleItem in user's pending cart
        if row is None:
            stmt = select(Sale).where(
                Sale.center_id == center_id,
                Sale.status == "pending",
                Sale.created_by == user_id
            ).limit(1)
            res = await db.execute(stmt)
            cart = res.scalar_one_or_none()
            if cart:
                stmt2 = select(SaleItem.id, SaleItem.sale_id, SaleItem.unit_price).where(
                    SaleItem.sale_id == cart.id,
                    SaleItem.product_id == item_id
                ).limit(1)
                res2 = await db.execute(stmt2)
                row = res2.first()

        if row is None:
            raise HTTPException(status_code=404, detail="Cart item not found")

        item_pk, sale_id, unit_price = row[0], row[1], row[2]

        # load cart (ORM is fine for cart)
        cart = await db.get(Sale, sale_id)
        if not cart or str(cart.center_id) != str(center_id) or cart.status != "pending":
            raise HTTPException(status_code=403, detail="Not allowed to modify this cart item")

        # NOTE: ownership check removed — any centeradmin in same center may modify pending carts

        if new_qty == 0:
            await db.execute(delete(SaleItem).where(SaleItem.id == item_pk))
        else:
            # compute new line_subtotal and run SQL UPDATE
            unit_price_dec = Decimal(str(unit_price))
            new_line_subtotal = (unit_price_dec * Decimal(int(new_qty))).quantize(Decimal("0.01"))
            await db.execute(
                update(SaleItem)
                .where(SaleItem.id == item_pk)
                .values(quantity=int(new_qty), line_subtotal=new_line_subtotal)
            )

        # recompute cart totals via query
        stmt = select(func.coalesce(func.sum(SaleItem.line_subtotal), 0)).where(SaleItem.sale_id == cart.id)
        res = await db.execute(stmt)
        subtotal = Decimal(str(res.scalar_one() or "0.00")).quantize(Decimal("0.01"))
        cart.subtotal_amount = subtotal
        cart.tax_amount = Decimal("0.00")
        cart.total_amount = subtotal
        db.add(cart)

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update cart item: {exc}") from exc

    return {"message": "cart updated", "cart_id": str(cart.id)}


# DELETE remove cart item (ownership check relaxed)
@router.delete("/sales/cart/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(item_id: str, db: AsyncSession = Depends(get_async_session), current_admin: dict = Depends(centeradmin_required)):
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")

    try:
        # Try by SaleItem.id first (select only columns)
        stmt = select(SaleItem.id, SaleItem.sale_id).where(SaleItem.id == item_id).limit(1)
        res = await db.execute(stmt)
        row = res.first()

        # Fallback: treat path param as product_id and find item in user's pending cart
        if row is None:
            stmt = select(Sale).where(
                Sale.center_id == center_id,
                Sale.status == "pending",
                Sale.created_by == user_id
            ).limit(1)
            res = await db.execute(stmt)
            cart = res.scalar_one_or_none()
            if cart:
                stmt2 = select(SaleItem.id, SaleItem.sale_id).where(SaleItem.sale_id == cart.id, SaleItem.product_id == item_id).limit(1)
                res2 = await db.execute(stmt2)
                row = res2.first()

        if row is None:
            raise HTTPException(status_code=404, detail="Cart item not found")

        item_pk, sale_id = row[0], row[1]

        # load and validate cart
        cart = await db.get(Sale, sale_id)
        if not cart or str(cart.center_id) != str(center_id) or cart.status != "pending":
            raise HTTPException(status_code=403, detail="Not allowed")

        # NOTE: ownership check removed — any centeradmin in same center may modify pending carts

        # SQL delete
        await db.execute(delete(SaleItem).where(SaleItem.id == item_pk))

        # recompute cart totals (query the DB)
        stmt = select(func.coalesce(func.sum(SaleItem.line_subtotal), 0)).where(SaleItem.sale_id == cart.id)
        res = await db.execute(stmt)
        subtotal = Decimal(str(res.scalar_one() or "0.00")).quantize(Decimal("0.01"))
        cart.subtotal_amount = subtotal
        cart.tax_amount = Decimal("0.00")
        cart.total_amount = subtotal
        db.add(cart)

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete cart item: {exc}") from exc

    return


# Helper: compute subtotal, tax and total for a cart (TaxScope hardcoded to product)
async def _compute_cart_totals(db: AsyncSession, cart, tax_category_id: Optional[str] = None):
    from app.settings.models.models import TaxCategory, TaxScope
    from app.inventory.models.models import SaleItem, Product

    # load items
    stmt = select(SaleItem).where(SaleItem.sale_id == cart.id)
    res = await db.execute(stmt)
    items = res.scalars().all()

    subtotal = Decimal("0.00")
    for it in items:
        product = await db.get(Product, it.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {it.product_id}")
        unit_price = getattr(product, "selling_price", None) or getattr(product, "base_price", None)
        if unit_price is None:
            raise HTTPException(status_code=400, detail=f"Product has no price: {it.product_id}")
        unit_price_dec = Decimal(str(unit_price))
        line = (unit_price_dec * int(it.quantity)).quantize(Decimal("0.01"))
        subtotal += line

    # Tax: hardcode tax_scope == TaxScope.product
    tax_percentage = Decimal("0.00")
    selected_tax = None
    if tax_category_id:
        stmt = select(TaxCategory).where(
            TaxCategory.id == tax_category_id,
            TaxCategory.tax_scope == TaxScope.product,
            TaxCategory.is_active == True
        )
        res = await db.execute(stmt)
        selected_tax = res.scalar_one_or_none()
        if selected_tax is None:
            # Provided tax_category_id is invalid for product scope
            raise HTTPException(status_code=400, detail="Invalid tax_category_id or tax category not applicable for products")
        tax_percentage = Decimal(str(selected_tax.tax_percentage or "0.00"))
    else:
        # Pick first active product-scoped tax category if any
        stmt = select(TaxCategory).where(
            TaxCategory.tax_scope == TaxScope.product,
            TaxCategory.is_active == True
        ).limit(1)
        res = await db.execute(stmt)
        selected_tax = res.scalar_one_or_none()
        if selected_tax:
            tax_percentage = Decimal(str(selected_tax.tax_percentage or "0.00"))

    tax_amount = (subtotal * (tax_percentage / Decimal("100.0"))).quantize(Decimal("0.01"))
    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    return {
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "selected_tax": selected_tax,
        "tax_percentage": tax_percentage,
    }


@router.get("/sales/cart/amount")
async def get_cart_amount(
    cart_id: Optional[str] = Query(None, description="Optional cart id. If omitted, uses caller's pending cart"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Return the previewed amounts for the cart:
      - If `cart_id` is omitted, uses the caller's pending cart.
      - Tax category selection is automatic: the code will pick the first active TaxCategory
        with `tax_scope == TaxScope.product`. If none exists, tax is treated as 0.00.
    """
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")

    if cart_id:
        cart = await db.get(Sale, cart_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
    else:
        cart = await _get_or_create_cart(db, center_id, user_id)

    # preview only for pending carts
    if not cart or cart.status != "pending":
        raise HTTPException(status_code=404, detail="Pending cart not found")

    # No tax_category_id passed — helper will pick the active product-scoped tax category if any
    totals = await _compute_cart_totals(db, cart, tax_category_id=None)

    return {
        "cart_id": str(cart.id),
        "subtotal": str(totals["subtotal"]),
        "tax": str(totals["tax_amount"]),
        "total": str(totals["total_amount"]),
        "tax_category_id": str(totals["selected_tax"].id) if totals["selected_tax"] else None,
        "tax_percentage": str(totals["tax_percentage"]),
    }




# POST checkout for an existing cart (cart_id via body or use current pending cart)
@router.post("/sales/cart/checkout", status_code=status.HTTP_201_CREATED)
async def checkout_cart(body: dict = Body(None), db: AsyncSession = Depends(get_async_session), current_admin: dict = Depends(centeradmin_required)):
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")

    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    cart_id = body.get("cart_id") if body else None
    payment = body.get("payment") if body else None
    tax_category_id = body.get("tax_category_id") if body else None

    force_paid_flag = bool(
        (body and body.get("force_paid"))
        or (payment and payment.get("force_paid"))
        or (payment and payment.get("force"))
        or (body and body.get("force"))
    )

    if cart_id:
        cart = await db.get(Sale, cart_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
    else:
        cart = await _get_or_create_cart(db, center_id, user_id)

    if not cart or cart.status != "pending":
        raise HTTPException(status_code=400, detail="Cart not found or not pending")

    # load items
    stmt = select(SaleItem).where(SaleItem.sale_id == cart.id)
    res = await db.execute(stmt)
    items = res.scalars().all()
    if not items:
        raise HTTPException(status_code=400, detail="Cart has no items")

    # recompute authoritative totals
    totals = await _compute_cart_totals(db, cart, tax_category_id)
    subtotal = totals["subtotal"]
    tax_amount = totals["tax_amount"]
    total_amount = totals["total_amount"]

    # Determine paid / payment details
    paid = False
    pay_amount = Decimal("0.00")
    if payment and payment.get("amount") is not None:
        try:
            pay_amount = Decimal(str(payment.get("amount")))
        except Exception:
            pay_amount = Decimal("0.00")
    if pay_amount >= total_amount and total_amount > Decimal("0.00"):
        paid = True
    if force_paid_flag:
        paid = True

    pm_value = None
    if payment and "method" in payment:
        try:
            pm_value = PaymentMethod[payment["method"]]
        except Exception:
            pm_value = None

    # Safe enum helpers
    def _pick_order_type():
        member = getattr(OrderType, "sale", None)
        if member is not None:
            return member
        return next(iter(OrderType))

    def _pick_reference_schema():
        member = getattr(ReferenceSchema, "invoice", None)
        if member is not None:
            return member
        return next(iter(ReferenceSchema))

    order_type_member = _pick_order_type()
    reference_schema_member = _pick_reference_schema()

    created_stock_tx_ids = []
    po_id = None
    stock_after = {}

    # Execute all work in ONE transaction
    try:
        # persist authoritative prices on items
        for it in items:
            product = await db.get(Product, it.product_id)
            if not product:
                raise HTTPException(status_code=400, detail=f"Product {it.product_id} not found")
            unit_price = getattr(product, "selling_price", None) or getattr(product, "base_price", None)
            if unit_price is None:
                raise HTTPException(status_code=400, detail=f"Product {it.product_id} has no price")
            it.unit_price = Decimal(str(unit_price))
            it.line_subtotal = (it.unit_price * int(it.quantity)).quantize(Decimal("0.01"))
            db.add(it)
        
        await db.flush()

        # Create PaymentOrder if payment info present
        if payment or paid:
            po = PaymentOrder(
                payer_user_id=user_id,
                payer_type=PayerType.center_admin,
                payee_type=PayeeType.center,
                center_id=center_id,
                order_type=order_type_member,
                reference_schema=reference_schema_member,
                reference_id=cart.id,
                subtotal_amount=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                currency=getattr(cart, "currency", Currency.INR),
                status=PaymentOrderStatus.paid if paid else PaymentOrderStatus.pending,
                payment_method=pm_value,
            )
            db.add(po)
            await db.flush()
            po_id = getattr(po, "payment_order_id", None) or getattr(po, "id", None)

        # Only decrease stock and create OUT transactions when paid
        if paid:
            for it in items:
                qty = int(it.quantity)
                unit_cost = Decimal(str(it.unit_price or "0.00"))

                # Atomic stock decrement
                upd = (
                    update(Stock)
                    .where(Stock.product_id == it.product_id, Stock.quantity_available >= qty)
                    .values(quantity_available=Stock.quantity_available - qty, last_cost=unit_cost)
                    .returning(Stock.id, Stock.quantity_available, Stock.last_cost)
                )
                result = await db.execute(upd)
                row = result.fetchone()
                if row is None:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for product {it.product_id}")

                stock_id, new_qty, last_cost = row

                # Create OUT StockTransaction
                stock_tx = StockTransaction(
                    product_id=it.product_id,
                    quantity=qty,
                    transaction_type="OUT",
                    unit_cost=unit_cost,
                    subtotal=(unit_cost * qty).quantize(Decimal("0.01")),
                    reference=f"sale:{cart.id}",
                    balance_after=new_qty,
                    created_by=user_id,
                )
                db.add(stock_tx)
                await db.flush()
                
                created_stock_tx_ids.append(str(stock_tx.id))
                stock_after[str(it.product_id)] = int(new_qty)

        # Finalize sale
        cart.subtotal_amount = subtotal
        cart.tax_amount = tax_amount
        cart.total_amount = total_amount
        if paid:
            cart.status = "completed"
        cart.updated_at = datetime.utcnow()
        db.add(cart)
        
        # CRITICAL: Commit the transaction
        await db.commit()
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {exc}") from exc

    # Best-effort refresh
    try:
        await db.refresh(cart)
    except Exception:
        pass

    if paid:
        payment_status = "paid"
    elif payment:
        payment_status = "pending"
    else:
        payment_status = "unpaid"

    return {
        "cart_id": str(cart.id),
        "sale_id": str(cart.id),
        "payment_order_id": str(po_id) if po_id else None,
        "payment_status": payment_status,
        "subtotal": str(subtotal),
        "tax": str(tax_amount),
        "total": str(total_amount),
        "stock_transaction_ids": created_stock_tx_ids,
        "stock_after": stock_after,
        "status": cart.status,
    }



@router.get("/pos/sales", summary="POS - List all sales transactions")
async def list_pos_sales(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    status: Optional[str] = Query(None, description="Filter by status: pending, completed, cancelled"),
    date_from: Optional[date] = Query(None, description="Filter sales from this date (inclusive)"),
    date_to: Optional[date] = Query(None, description="Filter sales up to this date (inclusive)"),
    search: Optional[str] = Query(None, description="Search by sale ID or items"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status: paid, pending, unpaid"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    POS Sales List - View all sales transactions with items and payment details.
    Returns completed and pending sales with full details for POS display.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Build filters
    where_clauses = [Sale.center_id == center_id]
    
    if status:
        where_clauses.append(Sale.status == status.lower())
    
    if date_from:
        where_clauses.append(Sale.created_at >= datetime.combine(date_from, datetime.min.time()))
    
    if date_to:
        where_clauses.append(Sale.created_at <= datetime.combine(date_to, datetime.max.time()))
    
    if search:
        where_clauses.append(Sale.id.cast(String).ilike(f"%{search}%"))

    # Count total sales
    count_stmt = select(func.count()).select_from(Sale).where(*where_clauses)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Fetch sales with items (eager loading)
    stmt = (
        select(Sale)
        .options(selectinload(Sale.items).selectinload(SaleItem.product))
        .where(*where_clauses)
        .order_by(Sale.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    
    result = await db.execute(stmt)
    sales = result.scalars().all()

    # Fetch payment orders for these sales
    sale_ids = [str(sale.id) for sale in sales]
    payment_orders = {}
    
    if sale_ids:
        po_stmt = select(PaymentOrder).where(
            PaymentOrder.reference_id.in_(sale_ids),
            PaymentOrder.reference_schema == ReferenceSchema.invoice
        )
        po_result = await db.execute(po_stmt)
        pos = po_result.scalars().all()
        payment_orders = {str(po.reference_id): po for po in pos}

    # Build response
    sales_data = []
    for sale in sales:
        # Get payment order
        po = payment_orders.get(str(sale.id))
        
        # Determine payment status
        if po:
            if po.status == PaymentOrderStatus.paid:
                payment_status_value = "paid"
            elif po.status == PaymentOrderStatus.pending:
                payment_status_value = "pending"
            else:
                payment_status_value = "unpaid"
        else:
            payment_status_value = "unpaid"
        
        # Skip if payment_status filter doesn't match
        if payment_status and payment_status_value != payment_status.lower():
            continue

        # Build items list
        items_list = []
        for item in sale.items:
            items_list.append({
                "product_id": str(item.product_id),
                "product_name": item.product.name if item.product else item.product_name,
                "sku_code": item.product.sku_code if item.product else item.sku_code,
                "quantity": int(item.quantity),
                "unit_price": str(item.unit_price),
                "line_subtotal": str(item.line_subtotal),
            })

        sales_data.append({
            "sale_id": str(sale.id),
            "sale_number": str(sale.id)[:8].upper(),  # Short display ID
            "status": sale.status,
            "payment_status": payment_status_value,
            "subtotal": str(sale.subtotal_amount),
            "tax": str(sale.tax_amount or "0.00"),
            "total": str(sale.total_amount),
            "currency": sale.currency or "INR",
            "items_count": len(sale.items),
            "items": items_list,
            "payment_method": po.payment_method.value if po and po.payment_method else None,
            "payment_order_id": str(po.payment_order_id) if po else None,
            "created_at": sale.created_at.isoformat() if sale.created_at else None,
            "created_by": str(sale.created_by) if sale.created_by else None,
            "note": sale.note,
        })

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "sales": sales_data,
    }


@router.get("/pos/sales/{sale_id}", summary="POS - Get sale details")
async def get_pos_sale_details(
    sale_id: str = Path(..., description="Sale ID"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get detailed information for a specific sale transaction (receipt view).
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Fetch sale with items
    stmt = (
        select(Sale)
        .options(selectinload(Sale.items).selectinload(SaleItem.product))
        .where(Sale.id == sale_id, Sale.center_id == center_id)
    )
    result = await db.execute(stmt)
    sale = result.scalar_one_or_none()
    
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Fetch payment order
    po_stmt = select(PaymentOrder).where(
        PaymentOrder.reference_id == sale.id,
        PaymentOrder.reference_schema == ReferenceSchema.invoice
    )
    po_result = await db.execute(po_stmt)
    po = po_result.scalar_one_or_none()

    # Fetch stock transactions for this sale
    st_stmt = select(StockTransaction).where(
        StockTransaction.reference == f"sale:{sale.id}"
    )
    st_result = await db.execute(st_stmt)
    stock_transactions = st_result.scalars().all()

    # Payment status
    if po:
        if po.status == PaymentOrderStatus.paid:
            payment_status_value = "paid"
        elif po.status == PaymentOrderStatus.pending:
            payment_status_value = "pending"
        else:
            payment_status_value = "unpaid"
    else:
        payment_status_value = "unpaid"

    # Build items
    items_list = []
    for item in sale.items:
        items_list.append({
            "item_id": str(item.id),
            "product_id": str(item.product_id),
            "product_name": item.product.name if item.product else item.product_name,
            "sku_code": item.product.sku_code if item.product else item.sku_code,
            "quantity": int(item.quantity),
            "unit_price": str(item.unit_price),
            "line_subtotal": str(item.line_subtotal),
        })

    # Build stock movements
    stock_movements = []
    for st in stock_transactions:
        stock_movements.append({
            "transaction_id": str(st.id),
            "product_id": str(st.product_id),
            "quantity": int(st.quantity),
            "balance_after": int(st.balance_after) if st.balance_after else None,
            "transaction_type": st.transaction_type,
        })

    return {
        "sale_id": str(sale.id),
        "sale_number": str(sale.id)[:8].upper(),
        "status": sale.status,
        "payment_status": payment_status_value,
        "subtotal": str(sale.subtotal_amount),
        "tax": str(sale.tax_amount or "0.00"),
        "tax_percentage": str(sale.tax_percentage or "0.00"),
        "total": str(sale.total_amount),
        "currency": sale.currency or "INR",
        "items": items_list,
        "stock_movements": stock_movements,
        "payment": {
            "payment_order_id": str(po.payment_order_id) if po else None,
            "method": po.payment_method.value if po and po.payment_method else None,
            "status": payment_status_value,
            "paid_amount": str(po.total_amount) if po else "0.00",
        } if po else None,
        "created_at": sale.created_at.isoformat() if sale.created_at else None,
        "updated_at": sale.updated_at.isoformat() if sale.updated_at else None,
        "created_by": str(sale.created_by) if sale.created_by else None,
        "note": sale.note,
    }


@router.get("/pos/sales/today/summary", summary="POS - Today's sales summary")
async def get_today_sales_summary(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get summary of today's sales for POS dashboard.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    # Total sales count and amounts
    stmt = select(
        func.count(Sale.id).label("total_sales"),
        func.coalesce(func.sum(Sale.total_amount), 0).label("total_revenue"),
        func.coalesce(func.sum(Sale.subtotal_amount), 0).label("total_subtotal"),
        func.coalesce(func.sum(Sale.tax_amount), 0).label("total_tax"),
    ).where(
        Sale.center_id == center_id,
        Sale.created_at >= today_start,
        Sale.created_at <= today_end,
        Sale.status == "completed"
    )
    
    result = await db.execute(stmt)
    summary = result.first()

    # Completed vs pending
    completed_stmt = select(func.count()).select_from(Sale).where(
        Sale.center_id == center_id,
        Sale.created_at >= today_start,
        Sale.created_at <= today_end,
        Sale.status == "completed"
    )
    completed_result = await db.execute(completed_stmt)
    completed_count = completed_result.scalar_one() or 0

    pending_stmt = select(func.count()).select_from(Sale).where(
        Sale.center_id == center_id,
        Sale.created_at >= today_start,
        Sale.created_at <= today_end,
        Sale.status == "pending"
    )
    pending_result = await db.execute(pending_stmt)
    pending_count = pending_result.scalar_one() or 0

    return {
        "date": date.today().isoformat(),
        "total_sales": summary.total_sales or 0,
        "completed_sales": completed_count,
        "pending_sales": pending_count,
        "total_revenue": str(summary.total_revenue or "0.00"),
        "total_subtotal": str(summary.total_subtotal or "0.00"),
        "total_tax": str(summary.total_tax or "0.00"),
        "currency": "INR",
    }