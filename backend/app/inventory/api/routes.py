from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import get_async_session, centeradmin_required
from app.inventory.schema.schema import ProductCreateRequest, ProductUpdateRequest, StockAdjustRequest, StockOut, StockAdjustIn, StockHistoryRow, AllStockHistoryResponse
from app.core.models.models import SKU
from app.inventory.models.models import Product, Stock, StockTransaction
from app.core.security import generate_sku_code
import asyncio
from uuid import uuid4
from sqlalchemy import select,func, update, desc
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
    # Hardcode transaction_type = "IN"
    TRANSACTION_TYPE = "IN"

    # verify product exists
    product = await session.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    qty = int(payload.quantity)
    unit_cost = Decimal(payload.cost_price)
    subtotal = (unit_cost * Decimal(qty)).quantize(Decimal("0.01"))
    tax_amount = Decimal("0.00")
    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    # derive payer and center ids from current_user dict
    payer_user_id = current_user.get("id") or current_user.get("user_id")
    center_id = current_user.get("center_id")

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
        await session.flush()  # populate stock_tx.id

        # 2) update or create Stock aggregate row
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
                last_cost=unit_cost
            )
            session.add(stock)

        await session.flush()  # populate stock.id if new

        # update transaction balance_after to reflect new aggregate
        stock_tx.balance_after = new_qty
        session.add(stock_tx)
        await session.flush()

        # 3) create PaymentOrder for this incoming stock
        po = PaymentOrder(
            payer_user_id=payer_user_id,
            payer_type=PayerType.center_admin,
            payee_type=PayeeType.center,
            center_id=center_id,
            order_type=OrderType.stock_purchase,
            reference_schema=ReferenceSchema.invoice,
            reference_id=stock_tx.id,  # link to stock transaction primary key
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

    # If a transaction is already active on this session, run work directly;
    # otherwise open a new transaction context here.
    if session.get_transaction() is None:
        async with session.begin():
            stock_tx, stock, po = await _work()
    else:
        # Already in a transaction (dependency or caller), just perform actions.
        stock_tx, stock, po = await _work()

    return {
        "stock_transaction_id": str(stock_tx.id),
        "stock_id": str(stock.id),
        "payment_order_id": str(po.payment_order_id),
        "subtotal": str(subtotal),
        "tax": str(tax_amount),
        "total": str(total_amount),
    }


@router.get("/stock-history", response_model=AllStockHistoryResponse)
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
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Base join: StockTransaction JOIN Product, left join Stock (aggregate)
    stmt = select(StockTransaction, Product, Stock).join(
        Product, Product.id == StockTransaction.product_id
    ).outerjoin(
        Stock, Stock.product_id == Product.id
    ).where(Product.center_id == center_id)

    # Apply filters
    if product_id:
        stmt = stmt.where(StockTransaction.product_id == product_id)
    if transaction_type:
        stmt = stmt.where(StockTransaction.transaction_type == transaction_type.upper())
    if date_from:
        if hasattr(StockTransaction, "created_at"):
            stmt = stmt.where(StockTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))
        else:
            stmt = stmt.where(StockTransaction.invoice_date >= date_from)
    if date_to:
        if hasattr(StockTransaction, "created_at"):
            stmt = stmt.where(StockTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))
        else:
            stmt = stmt.where(StockTransaction.invoice_date <= date_to)

    # Count total
    count_stmt = select(func.count()).select_from(StockTransaction).join(
        Product, Product.id == StockTransaction.product_id
    ).where(Product.center_id == center_id)
    if product_id:
        count_stmt = count_stmt.where(StockTransaction.product_id == product_id)
    if transaction_type:
        count_stmt = count_stmt.where(StockTransaction.transaction_type == transaction_type.upper())
    if date_from:
        if hasattr(StockTransaction, "created_at"):
            count_stmt = count_stmt.where(StockTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))
        else:
            count_stmt = count_stmt.where(StockTransaction.invoice_date >= date_from)
    if date_to:
        if hasattr(StockTransaction, "created_at"):
            count_stmt = count_stmt.where(StockTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))
        else:
            count_stmt = count_stmt.where(StockTransaction.invoice_date <= date_to)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Ordering + pagination (most recent first)
    # prefer created_at when present
    order_col = getattr(StockTransaction, "created_at", StockTransaction.invoice_date)
    stmt = stmt.order_by(desc(order_col)).offset((page - 1) * page_size).limit(page_size)

    res = await db.execute(stmt)
    rows = res.all()

    items = []
    for st, prod, stock in rows:
        items.append(StockHistoryRow(
            product_id=prod.id,
            product_name=getattr(prod, "name", None),
            sku_code=getattr(prod, "sku_code", None),
            current_quantity=int(stock.quantity_available) if stock and stock.quantity_available is not None else 0,
            transaction_id=st.id,
            created_at=getattr(st, "created_at", None),
            invoice_date=st.invoice_date,
            transaction_type=st.transaction_type,
            quantity=int(st.quantity or 0),
            unit_cost=st.unit_cost or 0,
            subtotal=st.subtotal or 0,
            balance_after=int(st.balance_after) if st.balance_after is not None else None,
            supplier_name=st.supplier_name,
            invoice_number=st.invoice_number,
        ))

    return AllStockHistoryResponse(
        page=page,
        page_size=page_size,
        total=total,
        rows=items,
    )    


#stock transactions listing endpoint with pagination and filtering (centeradmin only)
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
    """
    List stock transactions for products in the logged-in centeradmin's center.
    Includes monetary fields (`unit_cost`, `subtotal`) and aggregate `balance_after`.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Base join: StockTransaction -> Product, left join Stock (to show current aggregate)
    stmt = select(StockTransaction, Product, Stock).join(
        Product, Product.id == StockTransaction.product_id
    ).outerjoin(
        Stock, Stock.product_id == Product.id
    ).where(Product.center_id == center_id)

    # Apply filters
    if product_id:
        stmt = stmt.where(StockTransaction.product_id == product_id)
    if transaction_type:
        stmt = stmt.where(StockTransaction.transaction_type == transaction_type.upper())
    if date_from:
        if hasattr(StockTransaction, "created_at"):
            stmt = stmt.where(StockTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))
        else:
            stmt = stmt.where(StockTransaction.invoice_date >= date_from)
    if date_to:
        if hasattr(StockTransaction, "created_at"):
            stmt = stmt.where(StockTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))
        else:
            stmt = stmt.where(StockTransaction.invoice_date <= date_to)

    # Count total rows
    count_stmt = select(func.count()).select_from(StockTransaction).join(
        Product, Product.id == StockTransaction.product_id
    ).where(Product.center_id == center_id)
    if product_id:
        count_stmt = count_stmt.where(StockTransaction.product_id == product_id)
    if transaction_type:
        count_stmt = count_stmt.where(StockTransaction.transaction_type == transaction_type.upper())
    if date_from:
        if hasattr(StockTransaction, "created_at"):
            count_stmt = count_stmt.where(StockTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))
        else:
            count_stmt = count_stmt.where(StockTransaction.invoice_date >= date_from)
    if date_to:
        if hasattr(StockTransaction, "created_at"):
            count_stmt = count_stmt.where(StockTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))
        else:
            count_stmt = count_stmt.where(StockTransaction.invoice_date <= date_to)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Order by most recent (prefer created_at if available), apply pagination
    order_col = getattr(StockTransaction, "created_at", StockTransaction.invoice_date)
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