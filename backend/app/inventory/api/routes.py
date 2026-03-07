from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path, status
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_async_session, centeradmin_required
from app.inventory.schema.schema import *
from app.core.models.models import SKU
from app.inventory.models.models import *
from app.core.security import generate_sku_code
import asyncio
from uuid import uuid4
from sqlalchemy import select,func, update, desc, delete
from datetime import datetime, date
from app.billing.models.models import PaymentOrder, PayerType, PayeeType, OrderType, ReferenceSchema, PaymentOrderStatus, Currency
from decimal import Decimal



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

# GET current cart
@router.get("/sales/cart")
async def get_cart(db: AsyncSession = Depends(get_async_session), current_admin: dict = Depends(centeradmin_required)):
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")
    cart = await _get_or_create_cart(db, center_id, user_id)
    # load items
    stmt = select(SaleItem).where(SaleItem.sale_id == cart.id)
    res = await db.execute(stmt)
    items = res.scalars().all()
    items_out = []
    for it in items:
        items_out.append({
            "cart_item_id": str(it.id),
            "product_id": str(it.product_id),
            "product_name": it.product_name,
            "sku_code": it.sku_code,
            "quantity": int(it.quantity),
            "unit_price": str(it.unit_price),
            "line_subtotal": str(it.line_subtotal),
        })
    return {
        "cart_id": str(cart.id),
        "subtotal": str(cart.subtotal_amount),
        "tax": str(cart.tax_amount),
        "total": str(cart.total_amount),
        "items": items_out,
    }

# POST add item (or increase qty if product already in cart)
@router.post("/sales/cart/items", status_code=status.HTTP_201_CREATED)
async def add_cart_item(payload: Any = Body(...), db: AsyncSession = Depends(get_async_session), current_admin: dict = Depends(centeradmin_required)):
    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")

    # Normalize payload to a list of lines
    if isinstance(payload, list):
        lines = payload
    elif isinstance(payload, dict):
        if "items" in payload and isinstance(payload["items"], list):
            lines = payload["items"]
        elif "product_id" in payload:
            lines = [payload]
        else:
            raise HTTPException(status_code=400, detail="payload must contain 'product_id' or 'items'")
    else:
        raise HTTPException(status_code=400, detail="invalid payload")

    if not lines:
        raise HTTPException(status_code=400, detail="no items provided")

    added = []
    try:
        # Create/load cart and apply all item changes in one logical operation
        cart = await _get_or_create_cart(db, center_id, user_id)

        for idx, line in enumerate(lines):
            product_id = line.get("product_id")
            try:
                qty = int(line.get("quantity", 1))
            except Exception:
                raise HTTPException(status_code=400, detail=f"invalid quantity for item {idx}")
            if qty <= 0:
                raise HTTPException(status_code=400, detail="quantity must be > 0")

            # validate product & center
            prod = await db.get(Product, product_id)
            if not prod:
                raise HTTPException(status_code=404, detail=f"Product not found: {product_id}")
            if str(getattr(prod, "center_id", None)) != str(center_id):
                raise HTTPException(status_code=403, detail=f"Not allowed to add product: {product_id}")

            unit_price = getattr(prod, "selling_price", None) or getattr(prod, "base_price", None)
            if unit_price is None:
                raise HTTPException(status_code=400, detail=f"Product has no price: {product_id}")
            unit_price = Decimal(str(unit_price))

            # find existing item in cart
            stmt = select(SaleItem).where(SaleItem.sale_id == cart.id, SaleItem.product_id == prod.id).limit(1)
            res = await db.execute(stmt)
            item = res.scalars().first()

            if item:
                item.quantity = (item.quantity or 0) + qty
                item.line_subtotal = (Decimal(item.quantity) * unit_price).quantize(Decimal("0.01"))
                db.add(item)
                await db.flush()  # ensure item.id available
            else:
                item = SaleItem(
                    sale_id=cart.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=unit_price,
                    line_subtotal=(unit_price * qty).quantize(Decimal("0.01")),
                    product_name=getattr(prod, "name", None),
                    sku_code=getattr(prod, "sku_code", None),
                )
                db.add(item)
                await db.flush()  # populate item.id

            # record what was added for response (include cart_item_id)
            added.append({"cart_item_id": str(item.id), "product_id": str(prod.id), "quantity": int(qty)})

        # recompute cart subtotal/tax/total once
        stmt = select(func.coalesce(func.sum(SaleItem.line_subtotal), 0)).where(SaleItem.sale_id == cart.id)
        res = await db.execute(stmt)
        subtotal = Decimal(str(res.scalar_one() or "0.00")).quantize(Decimal("0.01"))
        cart.subtotal_amount = subtotal
        cart.tax_amount = Decimal("0.00")
        cart.total_amount = subtotal
        db.add(cart)

        # commit the changes (single commit for the entire batch)
        await db.commit()
    except HTTPException:
        # re-raise HTTP errors after rollback
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add items to cart: {exc}") from exc

    return {"message": "items added", "cart_id": str(cart.id), "added_count": len(added), "items": added}


# PATCH update a cart item quantity (set exact quantity)
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
        # Try treat path param as SaleItem.id first (select only columns to avoid ORM instance)
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

        # ownership check
        if getattr(cart, "created_by", None) and str(cart.created_by) != str(user_id):
            raise HTTPException(status_code=403, detail="Not allowed to modify this cart item")

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


# DELETE remove cart item
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

        # ownership check
        if getattr(cart, "created_by", None) and str(cart.created_by) != str(user_id):
            raise HTTPException(status_code=403, detail="Not allowed")

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

# POST checkout for an existing cart (cart_id via body or use current pending cart)
@router.post("/sales/cart/checkout", status_code=status.HTTP_201_CREATED)
async def checkout_cart(body: dict = Body(None), db: AsyncSession = Depends(get_async_session), current_admin: dict = Depends(centeradmin_required)):
    """
    Checkout an existing pending cart (Sale with status 'pending'). This will:
      - validate stock per item (lock rows)
      - create StockTransaction (OUT), update Stock
      - create PaymentOrder and mark sale status

    Tax category selection:
      - If caller provides `tax_category_id` it must exist, be active and have tax_scope == TaxScope.product.
      - If caller doesn't provide it, the endpoint will pick the first active TaxCategory with tax_scope == TaxScope.product (if any).
      - If no applicable tax category exists, tax is treated as 0.00.
    """
    from app.inventory.models.models import Sale, SaleItem, Product, Stock, StockTransaction
    from app.settings.models.models import TaxCategory, TaxScope
    from app.billing.models.models import PaymentOrder, PayerType, PayeeType, OrderType, ReferenceSchema, PaymentOrderStatus, PaymentMethod

    center_id = current_admin.get("center_id")
    user_id = current_admin.get("id") or current_admin.get("user_id")
    cart_id = body.get("cart_id") if body else None
    payment = body.get("payment") if body else None
    tax_category_id = body.get("tax_category_id") if body else None
    client_reference = body.get("client_reference") if body else None

    # load cart
    if cart_id:
        cart = await db.get(Sale, cart_id)
    else:
        cart = await _get_or_create_cart(db, center_id, user_id)
    if not cart or cart.status != "pending":
        raise HTTPException(status_code=404, detail="Pending cart not found")

    # load items
    stmt = select(SaleItem).where(SaleItem.sale_id == cart.id)
    res = await db.execute(stmt)
    items = res.scalars().all()
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # revalidate prices and compute subtotal (server authoritative)
    subtotal = Decimal("0.00")
    for it in items:
        product = await db.get(Product, it.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {it.product_id}")
        unit_price = getattr(product, "selling_price", None) or getattr(product, "base_price", None)
        if unit_price is None:
            raise HTTPException(status_code=400, detail=f"Product has no price: {it.product_id}")
        it.unit_price = Decimal(str(unit_price))
        it.line_subtotal = (it.unit_price * int(it.quantity)).quantize(Decimal("0.01"))
        db.add(it)
        subtotal += it.line_subtotal

    # Resolve tax category and percentage:
    tax_percentage = Decimal("0.00")
    selected_tax = None
    if tax_category_id:
        # validate provided tax category: must exist, be active and have tax_scope == product
        stmt = select(TaxCategory).where(
            TaxCategory.id == tax_category_id,
            TaxCategory.tax_scope == TaxScope.product,
            TaxCategory.is_active == True
        )
        res = await db.execute(stmt)
        selected_tax = res.scalar_one_or_none()
        if selected_tax is None:
            raise HTTPException(status_code=400, detail="Invalid tax_category_id or tax category not applicable for products")
        tax_percentage = Decimal(str(selected_tax.tax_percentage or "0.00"))
    else:
        # pick a default active product-scoped tax category (if any)
        stmt = select(TaxCategory).where(
            TaxCategory.tax_scope == TaxScope.product,
            TaxCategory.is_active == True
        ).limit(1)
        res = await db.execute(stmt)
        selected_tax = res.scalar_one_or_none()
        if selected_tax:
            tax_percentage = Decimal(str(selected_tax.tax_percentage or "0.00"))
            tax_category_id = selected_tax.id  # fill for storing on the sale/cart

    tax_amount = (subtotal * (tax_percentage / Decimal("100.0"))).quantize(Decimal("0.01"))
    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    # now perform stock locking and adjustments in a transaction
    async with db.begin():
        created_stock_tx_ids = []
        for it in items:
            prod = await db.get(Product, it.product_id)
            if getattr(prod, "track_inventory", True):
                q = select(Stock).where(Stock.product_id == prod.id).with_for_update()
                r = await db.execute(q)
                stock = r.scalars().first()
                current_qty = stock.quantity_available if stock else 0
                if current_qty < int(it.quantity):
                    raise HTTPException(status_code=409, detail={"product_id": str(prod.id), "available": current_qty, "required": int(it.quantity)})
                new_qty = current_qty - int(it.quantity)
                stock.quantity_available = new_qty
                db.add(stock)
                tx_unit_cost = stock.last_cost if stock and stock.last_cost is not None else it.unit_price
                stock_tx = StockTransaction(
                    product_id=prod.id,
                    transaction_type="OUT",
                    quantity=int(it.quantity),
                    unit_cost=tx_unit_cost,
                    subtotal=(Decimal(tx_unit_cost) * int(it.quantity)).quantize(Decimal("0.01")),
                    balance_after=new_qty,
                    reference=str(cart.id),
                )
                db.add(stock_tx)
                await db.flush()
                created_stock_tx_ids.append(str(stock_tx.id))

        # update cart totals, tax info and status
        cart.subtotal_amount = subtotal
        cart.tax_amount = tax_amount
        cart.total_amount = total_amount
        if selected_tax:
            cart.tax_category_id = selected_tax.id
            cart.tax_percentage = tax_percentage
        paid = False
        if payment and payment.get("amount"):
            pay_amount = Decimal(str(payment.get("amount")))
            paid = pay_amount >= total_amount
        cart.status = "paid" if paid else "pending"
        cart.note = client_reference or cart.note
        db.add(cart)

        po_id = None
        if payment and payment.get("amount"):
            pay_amount = Decimal(str(payment.get("amount")))
            pm = payment.get("method")
            po = PaymentOrder(
                payer_user_id=user_id,
                payer_type=PayerType.center_admin,
                payee_type=PayeeType.center,
                center_id=center_id,
                order_type=OrderType.add_on,
                reference_schema=ReferenceSchema.invoice,
                reference_id=cart.id,
                subtotal_amount=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                currency=getattr(cart, "currency", "INR"),
                status=PaymentOrderStatus.paid if pay_amount >= total_amount else PaymentOrderStatus.pending,
                payment_method=PaymentMethod[pm] if pm and pm in PaymentMethod.__members__ else None,
            )
            db.add(po)
            await db.flush()
            po_id = po.payment_order_id

    return {
        "cart_id": str(cart.id),
        "sale_id": str(cart.id),
        "payment_order_id": str(po_id) if po_id else None,
        "subtotal": str(subtotal),
        "tax": str(tax_amount),
        "total": str(total_amount),
        "stock_transaction_ids": created_stock_tx_ids,
        "status": cart.status,
    }