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
from sqlalchemy import select,func, update, desc, delete, or_
from datetime import datetime, date, timedelta
from app.billing.models.models import PaymentOrder, PayerType, PayeeType, OrderType, ReferenceSchema, PaymentOrderStatus, Currency
from decimal import Decimal
from sqlalchemy.orm import selectinload
from fastapi.responses import StreamingResponse
from app.inventory.utils.reports import ReportGenerator
from app.accounts.inventory_helper import post_inventory_sale_journal, post_inventory_purchase_journal
import io
import pandas as pd


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


@router.get("/dashboard", summary="Inventory Dashboard")
async def get_inventory_dashboard(
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get comprehensive inventory dashboard data.
    
    Returns:
    - Total products
    - Total stock quantity
    - Total stock value
    - Low stock items count
    - Today's sales
    - Stock distribution chart (monthly: in stock, low stock, out of stock)
    - Sales trend chart (monthly sales and purchases)
    """
    from sqlalchemy import extract, case
    from calendar import monthrange
    
    center_id = current_admin["center_id"]
    today = date.today()
    current_year = today.year
    
    # ===== 1. TOTAL PRODUCTS =====
    total_products_query = select(func.count(Product.id)).where(
        Product.center_id == center_id,
        Product.status == "active"
    )
    total_products_result = await db.execute(total_products_query)
    total_products = total_products_result.scalar_one() or 0
    
    # ===== 2. TOTAL STOCK QUANTITY =====
    # Join Product with Stock to get total quantity
    total_stock_query = select(
        func.coalesce(func.sum(Stock.quantity_available), 0)
    ).select_from(Product).join(
        Stock, Product.id == Stock.product_id
    ).where(
        Product.center_id == center_id,
        Product.status == "active"
    )
    total_stock_result = await db.execute(total_stock_query)
    total_stock_quantity = int(total_stock_result.scalar_one() or 0)
    
    # ===== 3. TOTAL STOCK VALUE =====
    # Stock value = quantity_available * base_price (from SKU parent)
    stock_value_query = select(
        func.coalesce(
            func.sum(Stock.quantity_available * Product.base_price), 
            0
        )
    ).select_from(Product).join(
        Stock, Product.id == Stock.product_id
    ).where(
        Product.center_id == center_id,
        Product.status == "active"
    )
    stock_value_result = await db.execute(stock_value_query)
    total_stock_value = float(stock_value_result.scalar_one() or 0)
    
    # ===== 4. LOW STOCK ITEMS =====
    # Products where quantity_available <= reorder_level
    low_stock_query = select(func.count(Product.id)).select_from(
        Product
    ).join(
        Stock, Product.id == Stock.product_id
    ).where(
        Product.center_id == center_id,
        Product.status == "active",
        Stock.quantity_available <= Product.reorder_level,
        Stock.quantity_available > 0
    )
    low_stock_result = await db.execute(low_stock_query)
    low_stock_items = int(low_stock_result.scalar_one() or 0)
    
    # ===== 5. TODAY'S SALES =====
    # Count completed sales for today
    today_sales_query = select(
        func.count(Sale.id)
    ).where(
        Sale.center_id == center_id,
        Sale.status == "completed",
        func.date(Sale.created_at) == today
    )
    today_sales_result = await db.execute(today_sales_query)
    today_sales = int(today_sales_result.scalar_one() or 0)
    
    # Today's sales amount
    today_sales_amount_query = select(
        func.coalesce(func.sum(Sale.total_amount), 0)
    ).where(
        Sale.center_id == center_id,
        Sale.status == "completed",
        func.date(Sale.created_at) == today
    )
    today_sales_amount_result = await db.execute(today_sales_amount_query)
    today_sales_amount = float(today_sales_amount_result.scalar_one() or 0)
    
    # ===== 6. STOCK DISTRIBUTION CHART (Monthly) =====
    # For each month, calculate:
    # - In stock: products with quantity > reorder_level
    # - Low stock: products with 0 < quantity <= reorder_level
    # - Out of stock: products with quantity = 0
    
    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    
    stock_distribution_chart = []
    
    for month_num in range(1, 13):
        # Get the last day of the month
        days_in_month = monthrange(current_year, month_num)[1]
        
        # For historical months, we'd need to track stock history
        # For simplicity, we'll use current stock levels for all months
        # In a production system, you'd want to snapshot stock levels or use stock_transactions
        
        # If month is in the future, show zero
        if month_num > today.month and current_year == today.year:
            stock_distribution_chart.append({
                "month": month_names[month_num - 1],
                "in_stock": 0,
                "low_stock": 0,
                "out_of_stock": 0
            })
            continue
        
        # Count products by stock status for this month
        # Using current stock levels as a proxy (ideal would be historical snapshots)
        stock_status_query = select(
            func.count(case(
                (Stock.quantity_available > Product.reorder_level, 1)
            )).label("in_stock"),
            func.count(case(
                (
                    (Stock.quantity_available > 0) & 
                    (Stock.quantity_available <= Product.reorder_level), 
                    1
                )
            )).label("low_stock"),
            func.count(case(
                (Stock.quantity_available == 0, 1)
            )).label("out_of_stock")
        ).select_from(Product).join(
            Stock, Product.id == Stock.product_id
        ).where(
            Product.center_id == center_id,
            Product.status == "active"
        )
        
        stock_status_result = await db.execute(stock_status_query)
        stock_status = stock_status_result.one()
        
        stock_distribution_chart.append({
            "month": month_names[month_num - 1],
            "in_stock": int(stock_status.in_stock or 0),
            "low_stock": int(stock_status.low_stock or 0),
            "out_of_stock": int(stock_status.out_of_stock or 0)
        })
    
    # ===== 7. SALES TREND CHART (Monthly Sales and Purchases) =====
    # Monthly sales data
    monthly_sales_query = select(
        extract('month', Sale.created_at).label('month'),
        func.coalesce(func.sum(Sale.total_amount), 0).label('sales_amount')
    ).where(
        Sale.center_id == center_id,
        Sale.status == "completed",
        extract('year', Sale.created_at) == current_year
    ).group_by('month')
    
    sales_result = await db.execute(monthly_sales_query)
    monthly_sales = {int(row.month): float(row.sales_amount) for row in sales_result}
    
    # Monthly purchases data (from StockTransaction with transaction_type = 'purchase')
    # Get product IDs for this center first
    product_ids_query = select(Product.id).where(Product.center_id == center_id)
    product_ids_result = await db.execute(product_ids_query)
    product_ids = [str(row[0]) for row in product_ids_result.all()]
    
    monthly_purchases = {}
    if product_ids:
        monthly_purchases_query = select(
            extract('month', StockTransaction.created_at).label('month'),
            func.coalesce(func.sum(StockTransaction.subtotal), 0).label('purchase_amount')
        ).where(
            StockTransaction.product_id.in_(product_ids),
            StockTransaction.transaction_type == 'IN',
            extract('year', StockTransaction.created_at) == current_year
        ).group_by('month')
        
        purchases_result = await db.execute(monthly_purchases_query)
        monthly_purchases = {int(row.month): float(row.purchase_amount) for row in purchases_result}
    
    # Build sales trend array for all 12 months
    sales_trend_chart = []
    for month_num in range(1, 13):
        sales_trend_chart.append({
            "month": month_names[month_num - 1],
            "sales": round(monthly_sales.get(month_num, 0), 2),
            "purchases": round(monthly_purchases.get(month_num, 0), 2)
        })
    
    return {
        "center_id": str(center_id),
        "generated_at": datetime.now().isoformat(),
        "total_products": int(total_products),
        "total_stock_quantity": total_stock_quantity,
        "total_stock_value": round(total_stock_value, 2),
        "low_stock_items": low_stock_items,
        "today_sales": {
            "count": today_sales,
            "amount": round(today_sales_amount, 2)
        },
        "stock_distribution_chart": stock_distribution_chart,
        "sales_trend_chart": sales_trend_chart
    }


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
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
   
    TRANSACTION_TYPE = "IN"

    # verify product exists
    product = await db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # enforce centeradmin scope (avoid records for other centers)
    center_id = current_admin.get("center_id")
    if not center_id or str(product.center_id) != str(center_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to modify this product")

    # compute quantities and amounts
    qty = int(payload.quantity)
    unit_cost = Decimal(payload.cost_price)
    subtotal = (unit_cost * Decimal(qty)).quantize(Decimal("0.01"))
    tax_amount = Decimal("0.00")
    total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

    payer_user_id = current_admin.get("id") or current_admin.get("user_id")

    try:
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
            created_by=payer_user_id,
        )
        db.add(stock_tx)
        await db.flush()  # ensure stock_tx.id

        # 2) update/create Stock aggregate
        q = select(Stock).where(Stock.product_id == product.id).limit(1)
        res = await db.execute(q)
        stock = res.scalars().first()

        if stock:
            new_qty = int(stock.quantity_available) + qty
            stock.quantity_available = new_qty
            stock.last_cost = unit_cost
        else:
            stock = Stock(
                product_id=product.id,
                quantity_available=qty,
                last_cost=unit_cost,
            )
            db.add(stock)
            new_qty = qty

        await db.flush()  # populate stock.id if new

        # update transaction balance_after and persist
        stock_tx.balance_after = new_qty
        db.add(stock_tx)
        await db.flush()

        # 3) create PaymentOrder linked to stock_tx
        po = PaymentOrder(
            payer_user_id=payer_user_id,
            payer_type=PayerType.center_admin,
            payee_type=PayeeType.center,
            center_id=center_id,
            order_type=OrderType.inventory_purchase,
            reference_schema=ReferenceSchema.invoice,
            reference_id=stock_tx.id,
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=getattr(product, "currency", Currency.INR),
            status=PaymentOrderStatus.paid,
            payment_method=None,
        )
        db.add(po)
        await db.flush()

        # --- ACCOUNTING INTEGRATION ---
        class PurchaseObj:
            # Minimal object to pass to the helper
            def __init__(self, id, center_id, subtotal_amount, tax_amount, total_amount):
                self.id = id
                self.center_id = center_id
                self.subtotal_amount = subtotal_amount
                self.tax_amount = tax_amount
                self.total_amount = total_amount

        purchase = PurchaseObj(
            id=stock_tx.id,
            center_id=center_id,
            subtotal_amount=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
        )

        await db.commit()
        await post_inventory_purchase_journal(
            db,
            purchase=purchase,
            created_by=payer_user_id
        )

    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add stock: {exc}") from exc

    # refresh to ensure we have latest DB state on objects
    try:
        await db.refresh(stock_tx)
        await db.refresh(stock)
        await db.refresh(po)
    except Exception:
        pass

    return {
        "stock_transaction_id": str(stock_tx.id),
        "stock_id": str(stock.id),
        "payment_order_id": str(po.payment_order_id),
        "subtotal": str(subtotal),
        "tax": str(tax_amount),
        "total": str(total_amount),
    }



# @router.post("/stock/adjust")
# async def add_stock(
#     payload: StockAdjustIn,
#     session: AsyncSession = Depends(get_async_session),
#     current_user: dict = Depends(centeradmin_required),
# ):
#     TRANSACTION_TYPE = "IN"

#     # verify product exists
#     product = await session.get(Product, payload.product_id)
#     if product is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

#     # enforce centeradmin scope (avoid records for other centers)
#     center_id = current_user.get("center_id")
#     if not center_id or str(product.center_id) != str(center_id):
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to modify this product")

#     # compute quantities and amounts
#     qty = int(payload.quantity)
#     unit_cost = Decimal(payload.cost_price)
#     subtotal = (unit_cost * Decimal(qty)).quantize(Decimal("0.01"))
#     tax_amount = Decimal("0.00")
#     total_amount = (subtotal + tax_amount).quantize(Decimal("0.01"))

#     payer_user_id = current_user.get("id") or current_user.get("user_id")

#     async def _work():
#         # 1) create StockTransaction
#         stock_tx = StockTransaction(
#             product_id=product.id,
#             quantity=qty,
#             transaction_type=TRANSACTION_TYPE,
#             unit_cost=unit_cost,
#             subtotal=subtotal,
#             supplier_name=payload.supplier_name,
#             invoice_number=payload.invoice_number,
#             invoice_date=payload.invoice_date,
#         )
#         session.add(stock_tx)
#         await session.flush()  # ensure stock_tx.id

#         # 2) update/create Stock aggregate
#         q = select(Stock).where(Stock.product_id == product.id).limit(1)
#         res = await session.execute(q)
#         stock = res.scalars().first()

#         if stock:
#             new_qty = (stock.quantity_available or 0) + qty
#             stock.quantity_available = new_qty
#             stock.last_cost = unit_cost
#             session.add(stock)
#         else:
#             new_qty = qty
#             stock = Stock(
#                 product_id=product.id,
#                 quantity_available=new_qty,
#                 last_cost=unit_cost,
#             )
#             session.add(stock)

#         await session.flush()  # populate stock.id if new

#         # update transaction balance_after and persist
#         stock_tx.balance_after = new_qty
#         session.add(stock_tx)
#         await session.flush()

#         # 3) create PaymentOrder linked to stock_tx
#         po = PaymentOrder(
#             payer_user_id=payer_user_id,
#             payer_type=PayerType.center_admin,
#             payee_type=PayeeType.center,
#             center_id=center_id,
#             order_type=OrderType.stock_purchase,
#             reference_schema=ReferenceSchema.invoice,
#             reference_id=stock_tx.id,
#             subtotal_amount=subtotal,
#             tax_amount=tax_amount,
#             total_amount=total_amount,
#             currency=getattr(product, "currency", Currency.INR),
#             status=PaymentOrderStatus.paid,
#             payment_method=None,
#         )
#         session.add(po)
#         await session.flush()

#         return stock_tx, stock, po

#     # perform work and explicitly commit (rollback on error)
#     try:
#         stock_tx, stock, po = await _work()
#         await session.commit()
#     except Exception as exc:
#         await session.rollback()
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add stock: {exc}") from exc

#     # refresh to ensure we have latest DB state on objects
#     try:
#         await session.refresh(stock_tx)
#         await session.refresh(stock)
#         await session.refresh(po)
#     except Exception:
#         # non-fatal; objects are still safe to read
#         pass

#     return {
#         "stock_transaction_id": str(stock_tx.id),
#         "stock_id": str(stock.id),
#         "payment_order_id": str(po.payment_order_id),
#         "subtotal": str(subtotal),
#         "tax": str(tax_amount),
#         "total": str(total_amount),
#     }


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
    Return the previewed amounts for the cart with product details:
      - If `cart_id` is omitted, uses the caller's pending cart.
      - Tax category selection is automatic: the code will pick the first active TaxCategory
        with `tax_scope == TaxScope.product`. If none exists, tax is treated as 0.00.
      - Returns list of products with cart_item_id, id, name, quantity, unit_price, and line_total
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

    # Load items with products
    stmt = (
        select(SaleItem, Product)
        .join(Product, Product.id == SaleItem.product_id)
        .where(SaleItem.sale_id == cart.id)
        .order_by(SaleItem.created_at)
    )
    result = await db.execute(stmt)
    items_with_products = result.all()

    # Build product list with details
    products = []
    for item, product in items_with_products:
        products.append({
            "cart_item_id": str(item.id),
            "product_id": str(product.id),
            "product_name": product.name,
            "sku_code": product.sku_code,
            "quantity": int(item.quantity),
            "unit_price": str(item.unit_price),
            "line_total": str(item.line_subtotal),
        })

    # No tax_category_id passed — helper will pick the active product-scoped tax category if any
    totals = await _compute_cart_totals(db, cart, tax_category_id=None)

    return {
        "cart_id": str(cart.id),
        "products": products,
        "items_count": len(products),
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
        
        
        await db.commit()
        await db.refresh(cart)

        # --- ACCOUNTING INTEGRATION ---
        if paid:
            await post_inventory_sale_journal(
                db,
                sale=cart,
                created_by=current_admin["user_id"]
            )
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {exc}") from exc

    # Best-effort refresh
    # try:
    #     await db.refresh(cart)
    # except Exception:
    #     pass

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


# Add these endpoints after your existing routes

@router.get("/reports/types", summary="Get available report types")
async def get_report_types(
    current_admin: dict = Depends(centeradmin_required),
):
    """
    List all available report types for the center admin.
    """
    return {
        "report_types": [
            {
                "type": "sales",
                "name": "Sales Report",
                "description": "Detailed sales transactions report with revenue breakdown"
            },
            {
                "type": "purchase",
                "name": "Purchase Report",
                "description": "Stock purchase history with supplier details"
            },
            {
                "type": "inventory",
                "name": "Inventory Report",
                "description": "Current stock levels and valuation"
            },
            {
                "type": "stock_movement",
                "name": "Stock Movement Report",
                "description": "All stock transactions (IN/OUT) with balance tracking"
            }
        ]
    }


@router.post("/reports/generate/sales", summary="Generate Sales Report")
async def generate_sales_report(
    date_from: Optional[str] = Query(None, description="Start date for report (optional, YYYY-MM-DD or 'null')"),
    date_to: Optional[str] = Query(None, description="End date for report (optional, YYYY-MM-DD or 'null')"),
    format: str = Query("json", description="Output format: json, pdf, csv"),
    status: Optional[str] = Query(None, description="Filter by status: completed, pending"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Generate sales report for the specified date range.
    Supports JSON (preview), PDF, and CSV formats.
    If date_from and date_to are not provided or set to 'null', returns all sales data.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Parse date parameters - handle "null" string and None
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD.")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD.")

    # Build query
    where_clauses = [Sale.center_id == center_id]
    
    # Only add date filters if provided and not null
    if date_from_parsed:
        where_clauses.append(Sale.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
    
    if date_to_parsed:
        where_clauses.append(Sale.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
    
    if status:
        where_clauses.append(Sale.status == status.lower())

    # Fetch sales data
    stmt = (
        select(Sale)
        .options(selectinload(Sale.items))
        .where(*where_clauses)
        .order_by(Sale.created_at.desc())
    )
    
    result = await db.execute(stmt)
    sales = result.scalars().all()

    # Prepare data
    sales_data = []
    for sale in sales:
        sales_data.append({
            'sale_id': str(sale.id),
            'sale_number': str(sale.id)[:8].upper(),
            'status': sale.status,
            'subtotal': str(sale.subtotal_amount),
            'tax': str(sale.tax_amount or "0.00"),
            'total': str(sale.total_amount),
            'items_count': len(sale.items),
            'created_at': sale.created_at.isoformat() if sale.created_at else None,
        })

    # Return based on format
    if format.lower() == "json":
        total_revenue = sum(Decimal(str(s['total'])) for s in sales_data)
        total_tax = sum(Decimal(str(s['tax'])) for s in sales_data)
        
        return {
            "report_type": "sales",
            "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
            "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_sales": len(sales_data),
                "total_revenue": str(total_revenue),
                "total_tax": str(total_tax)
            },
            "data": sales_data
        }
    
    elif format.lower() == "pdf":
        center_name = "Your Center Name"  # Fetch from center table if needed
        pdf_bytes = ReportGenerator.generate_sales_pdf(
            sales_data, 
            center_name, 
            date_from_parsed.isoformat() if date_from_parsed else "All Time", 
            date_to_parsed.isoformat() if date_to_parsed else "All Time"
        )
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=sales_report_{date_from or 'all'}_{date_to or 'all'}.pdf"
            }
        )
    
    elif format.lower() == "csv":
        csv_bytes = ReportGenerator.generate_sales_csv(sales_data)
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=sales_report_{date_from or 'all'}_{date_to or 'all'}.csv"
            }
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use: json, pdf, or csv")


@router.get("/reports/sales", summary="Get Sales Report Data for UI Table")
async def get_sales_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date for report (optional, YYYY-MM-DD or 'null')"),
    date_to: Optional[str] = Query(None, description="End date for report (optional, YYYY-MM-DD or 'null')"),
    status: Optional[str] = Query(None, description="Filter by status: completed, pending, cancelled"),
    sort_by: str = Query("created_at", description="Sort by: created_at, total_amount, items_count"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get sales report data for UI table display with pagination, filtering, and sorting.
    Returns sales transactions with summary statistics.
    If date_from and date_to are not provided or set to 'null', returns all sales data.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Parse date parameters - handle "null" string and None
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = date.fromisoformat(date_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD or 'null'")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = date.fromisoformat(date_to)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD or 'null'")

    # Build WHERE clauses
    where_clauses = [Sale.center_id == center_id]
    
    # Only add date filters if provided and not null
    if date_from_parsed:
        where_clauses.append(Sale.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
    
    if date_to_parsed:
        where_clauses.append(Sale.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
    
    if status:
        where_clauses.append(Sale.status == status)

    # Count total matching records
    count_stmt = select(func.count()).select_from(Sale).where(*where_clauses)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Build main query with items loaded
    stmt = (
        select(Sale)
        .options(selectinload(Sale.items).selectinload(SaleItem.product))
        .where(*where_clauses)
    )

    # Apply sorting
    if sort_by == "total_amount":
        stmt = stmt.order_by(Sale.total_amount.desc() if sort_order == "desc" else Sale.total_amount.asc())
    elif sort_by == "items_count":
        # Sort by items count requires a subquery or post-fetch sorting
        pass  # Keep created_at as fallback
    else:  # created_at (default)
        stmt = stmt.order_by(Sale.created_at.desc() if sort_order == "desc" else Sale.created_at.asc())

    # Apply pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(stmt)
    sales = result.scalars().all()

    # Fetch payment orders for these sales
    sale_ids = [sale.id for sale in sales]
    payment_orders = {}
    
    if sale_ids:
        po_stmt = select(PaymentOrder).where(
            PaymentOrder.reference_id.in_(sale_ids),
            PaymentOrder.reference_schema == ReferenceSchema.invoice
        )
        po_result = await db.execute(po_stmt)
        for po in po_result.scalars():
            payment_orders[po.reference_id] = po

    # Calculate summary statistics for the filtered data (all records, not just current page)
    summary_stmt = select(
        func.count(Sale.id).label("total_sales"),
        func.coalesce(func.sum(Sale.total_amount), 0).label("total_revenue"),
        func.coalesce(func.sum(Sale.subtotal_amount), 0).label("total_subtotal"),
        func.coalesce(func.sum(Sale.tax_amount), 0).label("total_tax"),
    ).where(*where_clauses)
    
    summary_result = await db.execute(summary_stmt)
    summary = summary_result.first()

    # Build sales data for table
    sales_data = []
    for sale in sales:
        po = payment_orders.get(sale.id)
        
        # Payment status
        if po:
            payment_status_value = po.status.value if po.status else "unpaid"
            payment_method_value = po.payment_method.value if po.payment_method else None
        else:
            payment_status_value = "unpaid"
            payment_method_value = None
        
        # Items count
        items_count = len(sale.items) if sale.items else 0
        
        sales_data.append({
            "sale_id": str(sale.id),
            "sale_number": str(sale.id)[:8].upper(),
            "date": sale.created_at.isoformat() if sale.created_at else None,
            "status": sale.status,
            "items_count": items_count,
            "subtotal": str(sale.subtotal_amount),
            "tax": str(sale.tax_amount or "0.00"),
            "total": str(sale.total_amount),
            "payment_status": payment_status_value,
            "payment_method": payment_method_value,
            "created_by": str(sale.created_by) if sale.created_by else None,
        })

    # Count by status for filter badges
    status_counts = {}
    for status_type in ["completed", "pending", "cancelled"]:
        status_count_stmt = select(func.count()).select_from(Sale).where(
            Sale.center_id == center_id,
            Sale.status == status_type
        )
        if date_from_parsed:
            status_count_stmt = status_count_stmt.where(Sale.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
        if date_to_parsed:
            status_count_stmt = status_count_stmt.where(Sale.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
        
        status_count_result = await db.execute(status_count_stmt)
        status_counts[status_type] = status_count_result.scalar_one() or 0

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
        "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
        "summary": {
            "total_sales": summary.total_sales or 0,
            "total_revenue": str(summary.total_revenue or "0.00"),
            "total_subtotal": str(summary.total_subtotal or "0.00"),
            "total_tax": str(summary.total_tax or "0.00"),
            "average_sale": str((Decimal(str(summary.total_revenue or "0.00")) / Decimal(str(summary.total_sales or 1))).quantize(Decimal("0.01"))) if summary.total_sales else "0.00",
        },
        "status_counts": status_counts,
        "sales": sales_data,
    }


@router.post("/reports/generate/purchase", summary="Generate Purchase Report")
async def generate_purchase_report(
    date_from: Optional[str] = Query(None, description="Start date for report (optional, YYYY-MM-DD or 'null')"),
    date_to: Optional[str] = Query(None, description="End date for report (optional, YYYY-MM-DD or 'null')"),
    format: str = Query("json", description="Output format: json, pdf, csv"),
    product_id: Optional[str] = Query(None, description="Filter by product"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Generate purchase/stock-in report for the specified date range.
    If date_from and date_to are not provided or set to 'null', returns all purchase data.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Parse date parameters - handle "null" string and None
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD.")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD.")

    # Build query for stock transactions (IN only)
    sku_ids_sel = select(SKU.id).where(SKU.center_id == center_id)
    where_clauses = [
        StockTransaction.product_id.in_(sku_ids_sel),
        StockTransaction.transaction_type == "IN"
    ]
    
    # Only add date filters if provided and not null
    if date_from_parsed:
        where_clauses.append(StockTransaction.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
    
    if date_to_parsed:
        where_clauses.append(StockTransaction.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
    
    if product_id:
        where_clauses.append(StockTransaction.product_id == product_id)

    # Fetch purchase data
    stmt = (
        select(StockTransaction, Product)
        .join(Product, Product.id == StockTransaction.product_id)
        .where(*where_clauses)
        .order_by(StockTransaction.created_at.desc())
    )
    
    result = await db.execute(stmt)
    transactions = result.all()

    # Prepare data
    purchase_data = []
    for st, product in transactions:
        purchase_data.append({
            'transaction_id': str(st.id),
            'product_id': str(product.id),
            'product_name': product.name,
            'sku_code': product.sku_code,
            'quantity': int(st.quantity),
            'unit_cost': str(st.unit_cost),
            'subtotal': str(st.subtotal),
            'supplier_name': st.supplier_name or "N/A",
            'invoice_number': st.invoice_number or "N/A",
            'created_at': st.created_at.isoformat() if st.created_at else None,
        })

    # Return based on format
    if format.lower() == "json":
        total_quantity = sum(int(p['quantity']) for p in purchase_data)
        total_cost = sum(Decimal(str(p['subtotal'])) for p in purchase_data)
        
        return {
            "report_type": "purchase",
            "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
            "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_purchases": len(purchase_data),
                "total_quantity": total_quantity,
                "total_cost": str(total_cost)
            },
            "data": purchase_data
        }
    
    elif format.lower() == "pdf":
        center_name = "Your Center Name"
        pdf_bytes = ReportGenerator.generate_purchase_pdf(
            purchase_data,
            center_name,
            date_from_parsed.isoformat() if date_from_parsed else "All Time",
            date_to_parsed.isoformat() if date_to_parsed else "All Time"
        )
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=purchase_report_{date_from or 'all'}_{date_to or 'all'}.pdf"
            }
        )
    
    elif format.lower() == "csv":
        csv_bytes = ReportGenerator.generate_purchase_csv(purchase_data)
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=purchase_report_{date_from or 'all'}_{date_to or 'all'}.csv"
            }
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use: json, pdf, or csv")


@router.get("/reports/purchase", summary="Get Purchase Report Data for UI Table")
async def get_purchase_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date for report (optional, YYYY-MM-DD or 'null')"),
    date_to: Optional[str] = Query(None, description="End date for report (optional, YYYY-MM-DD or 'null')"),
    product_id: Optional[str] = Query(None, description="Filter by product"),
    supplier_name: Optional[str] = Query(None, description="Filter by supplier name"),
    sort_by: str = Query("created_at", description="Sort by: created_at, quantity, total"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get purchase/stock-in report data for UI table display with pagination, filtering, and sorting.
    Returns purchase transactions with summary statistics.
    If date_from and date_to are not provided or set to 'null', returns all purchase data.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Parse date parameters - handle "null" string and None
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = date.fromisoformat(date_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD or 'null'")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = date.fromisoformat(date_to)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD or 'null'")

    # Build WHERE clauses
    sku_ids_sel = select(SKU.id).where(SKU.center_id == center_id)
    where_clauses = [
        StockTransaction.product_id.in_(sku_ids_sel),
        StockTransaction.transaction_type == "IN"
    ]
    
    created_at_attr = getattr(StockTransaction, "created_at", None)
    
    # Only add date filters if provided and not null
    if date_from_parsed:
        if created_at_attr:
            where_clauses.append(StockTransaction.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date >= date_from_parsed)
    
    if date_to_parsed:
        if created_at_attr:
            where_clauses.append(StockTransaction.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date <= date_to_parsed)
    
    if product_id:
        where_clauses.append(StockTransaction.product_id == product_id)
    
    if supplier_name:
        where_clauses.append(StockTransaction.supplier_name.ilike(f"%{supplier_name}%"))

    # Count total matching records
    count_stmt = (
        select(func.count())
        .select_from(StockTransaction)
        .join(Product, Product.id == StockTransaction.product_id)
        .where(*where_clauses)
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Build main query
    stmt = (
        select(StockTransaction, Product, Stock)
        .join(Product, Product.id == StockTransaction.product_id)
        .outerjoin(Stock, Stock.product_id == Product.id)
        .where(*where_clauses)
    )

    # Apply sorting
    if sort_by == "quantity":
        stmt = stmt.order_by(StockTransaction.quantity.desc() if sort_order == "desc" else StockTransaction.quantity.asc())
    elif sort_by == "total":
        stmt = stmt.order_by(StockTransaction.subtotal.desc() if sort_order == "desc" else StockTransaction.subtotal.asc())
    else:  # created_at
        order_col = created_at_attr if created_at_attr else StockTransaction.invoice_date
        stmt = stmt.order_by(order_col.desc() if sort_order == "desc" else order_col.asc())

    # Apply pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(stmt)
    rows = result.all()

    # Calculate summary statistics
    summary_stmt = select(
        func.count(StockTransaction.id).label("total_purchases"),
        func.coalesce(func.sum(StockTransaction.quantity), 0).label("total_quantity"),
        func.coalesce(func.sum(StockTransaction.subtotal), 0).label("total_cost"),
    ).select_from(StockTransaction).join(
        Product, Product.id == StockTransaction.product_id
    ).where(*where_clauses)
    
    summary_result = await db.execute(summary_stmt)
    summary = summary_result.first()

    # Build purchase data for table
    purchases_data = []
    for st, prod, stock in rows:
        purchases_data.append({
            "transaction_id": str(st.id),
            "date": st.created_at.isoformat() if created_at_attr and st.created_at else (st.invoice_date.isoformat() if st.invoice_date else None),
            "product_id": str(prod.id),
            "product_name": prod.name,
            "quantity": int(st.quantity),
            "unit_cost": str(st.unit_cost),
            "total": str(st.subtotal),
            "supplier_name": st.supplier_name,
            "invoice_number": st.invoice_number,
            "current_stock": int(stock.quantity_available) if stock else 0,
        })

    # Get unique suppliers for filter
    supplier_stmt = (
        select(StockTransaction.supplier_name)
        .select_from(StockTransaction)
        .join(Product, Product.id == StockTransaction.product_id)
        .where(
            StockTransaction.product_id.in_(sku_ids_sel),
            StockTransaction.transaction_type == "IN",
            StockTransaction.supplier_name.isnot(None)
        )
        .distinct()
        .limit(50)
    )
    supplier_result = await db.execute(supplier_stmt)
    suppliers = [s[0] for s in supplier_result.all() if s[0]]

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
        "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
        "summary": {
            "total_purchases": summary.total_purchases or 0,
            "total_quantity": int(summary.total_quantity or 0),
            "total_cost": str(summary.total_cost or "0.00"),
            "average_cost": str((Decimal(str(summary.total_cost or "0.00")) / Decimal(str(summary.total_purchases or 1))).quantize(Decimal("0.01"))) if summary.total_purchases else "0.00",
        },
        "suppliers": suppliers,
        "purchases": purchases_data,
    }


@router.post("/reports/generate/inventory", summary="Generate Inventory Report")
async def generate_inventory_report(
    format: str = Query("json", description="Output format: json, pdf, csv"),
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Generate inventory report (current stock levels).
    This report is not date-filtered as it shows current state.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Build query
    where_clauses = [Product.center_id == center_id]

    # Fetch products with stock
    stmt = (
        select(Product, Stock)
        .outerjoin(Stock, Stock.product_id == Product.id)
        .where(*where_clauses)
        .order_by(Product.name)
    )
    
    result = await db.execute(stmt)
    products = result.all()

    # Prepare data
    inventory_data = []
    for product, stock in products:
        quantity = int(stock.quantity_available) if stock else 0
        reorder_level = int(product.reorder_level) if product.reorder_level else 0
        is_low_stock = quantity <= reorder_level
        
        # Skip if low_stock_only filter is on and item is not low stock
        if low_stock_only and not is_low_stock:
            continue
        
        inventory_data.append({
            'product_id': str(product.id),
            'product_name': product.name,
            'sku_code': product.sku_code,
            'current_stock': quantity,
            'reorder_level': reorder_level,
            'is_low_stock': is_low_stock,
            'unit_price': str(product.selling_price or product.base_price or "0.00"),
            'stock_value': str((Decimal(str(product.selling_price or product.base_price or "0.00")) * Decimal(quantity)).quantize(Decimal("0.01"))),
        })

    # Return based on format
    if format.lower() == "json":
        total_items = len(inventory_data)
        total_value = sum(Decimal(str(item['stock_value'])) for item in inventory_data)
        low_stock_count = sum(1 for item in inventory_data if item['is_low_stock'])
        
        return {
            "report_type": "inventory",
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_items": total_items,
                "low_stock_items": low_stock_count,
                "total_inventory_value": str(total_value)
            },
            "data": inventory_data
        }
    
    elif format.lower() == "pdf":
        center_name = "Your Center Name"
        pdf_bytes = ReportGenerator.generate_inventory_pdf(inventory_data, center_name)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=inventory_report_{datetime.now().strftime('%Y%m%d')}.pdf"
            }
        )
    
    elif format.lower() == "csv":
        csv_bytes = ReportGenerator.generate_inventory_csv(inventory_data)
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=inventory_report_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use: json, pdf, or csv")
    

@router.get("/reports/inventory", summary="Get Inventory Report Data for UI Table")
async def get_inventory_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    search: Optional[str] = Query(None, description="Search by product name or SKU"),
    sort_by: str = Query("product_name", description="Sort by: product_name, current_stock, stock_value"),
    sort_order: str = Query("asc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get current inventory status data for UI table display with pagination, filtering, and sorting.
    Shows current stock levels, valuation, and low stock alerts.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Build WHERE clauses
    where_clauses = [Product.center_id == center_id]
    
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku_code.ilike(f"%{search}%")
        )
        where_clauses.append(search_filter)

    # Fetch products with stock
    base_stmt = (
        select(Product, Stock)
        .outerjoin(Stock, Stock.product_id == Product.id)
        .where(*where_clauses)
    )
    
    # Execute to get all matching records for filtering
    all_result = await db.execute(base_stmt)
    all_rows = all_result.all()

    # Apply low stock filter in Python (since it depends on calculated values)
    filtered_rows = []
    inventory_data = []
    total_value = Decimal("0.00")
    low_stock_count = 0
    out_of_stock_count = 0
    
    for prod, stock in all_rows:
        qty = int(stock.quantity_available) if stock else 0
        reorder = int(prod.reorder_level) if prod.reorder_level else 0
        
        # Apply low stock filter
        if low_stock_only and qty > reorder:
            continue
        
        last_cost = Decimal(str(stock.last_cost)) if stock and stock.last_cost else Decimal("0.00")
        value = (last_cost * Decimal(qty)).quantize(Decimal("0.01"))
        
        # Determine status
        if qty == 0:
            status = "Out of Stock"
            out_of_stock_count += 1
        elif qty <= reorder:
            status = "Low Stock"
            low_stock_count += 1
        else:
            status = "In Stock"
        
        total_value += value
        
        row_data = {
            "product_id": str(prod.id),
            "sku_code": prod.sku_code,
            "product_name": prod.name,
            "current_stock": qty,
            "reorder_level": reorder,
            "unit_cost": str(last_cost),
            "stock_value": str(value),
            "status": status,
            "base_price": str(prod.base_price) if prod.base_price else "0.00",
            "selling_price": str(prod.selling_price) if prod.selling_price else "0.00",
        }
        
        filtered_rows.append(row_data)

    # Sort the filtered data
    if sort_by == "current_stock":
        filtered_rows.sort(key=lambda x: x["current_stock"], reverse=(sort_order == "desc"))
    elif sort_by == "stock_value":
        filtered_rows.sort(key=lambda x: Decimal(x["stock_value"]), reverse=(sort_order == "desc"))
    else:  # product_name
        filtered_rows.sort(key=lambda x: x["product_name"].lower(), reverse=(sort_order == "desc"))

    # Apply pagination
    total = len(filtered_rows)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_data = filtered_rows[start_idx:end_idx]

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "summary": {
            "total_products": len(all_rows),
            "filtered_products": total,
            "in_stock_items": total - low_stock_count - out_of_stock_count,
            "low_stock_items": low_stock_count,
            "out_of_stock_items": out_of_stock_count,
            "total_inventory_value": str(total_value),
        },
        "inventory": paginated_data,
    }


@router.post("/reports/generate/stock-movement", summary="Generate Stock Movement Report")
async def generate_stock_movement_report(
    date_from: Optional[str] = Query(None, description="Start date for report (optional, YYYY-MM-DD or 'null')"),
    date_to: Optional[str] = Query(None, description="End date for report (optional, YYYY-MM-DD or 'null')"),
    format: str = Query("json", description="Output format: json, pdf, csv"),
    transaction_type: Optional[str] = Query(None, description="Filter by type: IN, OUT"),
    product_id: Optional[str] = Query(None, description="Filter by product"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Generate stock movement report showing all IN/OUT transactions.
    If date_from and date_to are not provided or set to 'null', returns all stock movements.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Parse date parameters - handle "null" string and None
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = datetime.strptime(date_from, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD.")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD.")

    # Build query
    sku_ids_sel = select(SKU.id).where(SKU.center_id == center_id)
    where_clauses = [StockTransaction.product_id.in_(sku_ids_sel)]
    
    # Only add date filters if provided and not null
    if date_from_parsed:
        where_clauses.append(StockTransaction.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
    
    if date_to_parsed:
        where_clauses.append(StockTransaction.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
    
    if transaction_type:
        where_clauses.append(StockTransaction.transaction_type == transaction_type.upper())
    
    if product_id:
        where_clauses.append(StockTransaction.product_id == product_id)

    # Fetch stock movements
    stmt = (
        select(StockTransaction, Product)
        .join(Product, Product.id == StockTransaction.product_id)
        .where(*where_clauses)
        .order_by(StockTransaction.created_at.desc())
    )
    
    result = await db.execute(stmt)
    movements = result.all()

    # Prepare data
    movement_data = []
    for st, product in movements:
        movement_data.append({
            'transaction_id': str(st.id),
            'date': st.created_at.isoformat() if st.created_at else None,
            'product_id': str(product.id),
            'product_name': product.name,
            'sku_code': product.sku_code,
            'transaction_type': st.transaction_type,
            'quantity': int(st.quantity),
            'balance_after': int(st.balance_after) if st.balance_after else None,
            'unit_cost': str(st.unit_cost) if st.unit_cost else "0.00",
            'total': str(st.subtotal) if st.subtotal else "0.00",
            'reference': st.reference or "",
        })

    # Return based on format
    if format.lower() == "json":
        total_in = sum(int(m['quantity']) for m in movement_data if m['transaction_type'] == 'IN')
        total_out = sum(int(m['quantity']) for m in movement_data if m['transaction_type'] == 'OUT')
        
        return {
            "report_type": "stock_movement",
            "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
            "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_movements": len(movement_data),
                "total_in": total_in,
                "total_out": total_out,
                "net_movement": total_in - total_out
            },
            "data": movement_data
        }
    
    elif format.lower() == "pdf":
        center_name = "Your Center Name"
        pdf_bytes = ReportGenerator.generate_stock_movement_pdf(
            movement_data,
            center_name,
            date_from_parsed.isoformat() if date_from_parsed else "All Time",
            date_to_parsed.isoformat() if date_to_parsed else "All Time"
        )
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=stock_movement_report_{date_from or 'all'}_{date_to or 'all'}.pdf"
            }
        )
    
    elif format.lower() == "csv":
        csv_bytes = ReportGenerator.generate_stock_movement_csv(movement_data)
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=stock_movement_report_{date_from or 'all'}_{date_to or 'all'}.csv"
            }
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use: json, pdf, or csv")
    
    

@router.get("/reports/stock-movement", summary="Get Stock Movement Report Data for UI Table")
async def get_stock_movement_report_data(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    date_from: Optional[str] = Query(None, description="Start date for report (optional, YYYY-MM-DD or 'null')"),
    date_to: Optional[str] = Query(None, description="End date for report (optional, YYYY-MM-DD or 'null')"),
    transaction_type: Optional[str] = Query(None, description="Filter by type: IN, OUT"),
    product_id: Optional[str] = Query(None, description="Filter by product"),
    sort_by: str = Query("date", description="Sort by: date, quantity, total"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    db: AsyncSession = Depends(get_async_session),
    current_admin: dict = Depends(centeradmin_required),
):
    """
    Get stock movement report data for UI table display with pagination, filtering, and sorting.
    Shows all stock transactions (IN/OUT) with balance tracking.
    If date_from and date_to are not provided or set to 'null', returns all stock movement data.
    """
    center_id = current_admin.get("center_id")
    if not center_id:
        raise HTTPException(status_code=403, detail="No center assigned to this user")

    # Parse date parameters - handle "null" string and None
    date_from_parsed = None
    date_to_parsed = None
    
    if date_from and date_from.lower() != "null":
        try:
            date_from_parsed = date.fromisoformat(date_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD or 'null'")
    
    if date_to and date_to.lower() != "null":
        try:
            date_to_parsed = date.fromisoformat(date_to)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD or 'null'")

    # Build WHERE clauses
    sku_ids_sel = select(SKU.id).where(SKU.center_id == center_id)
    where_clauses = [StockTransaction.product_id.in_(sku_ids_sel)]
    
    created_at_attr = getattr(StockTransaction, "created_at", None)
    
    # Only add date filters if provided and not null
    if date_from_parsed:
        if created_at_attr:
            where_clauses.append(StockTransaction.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date >= date_from_parsed)
    
    if date_to_parsed:
        if created_at_attr:
            where_clauses.append(StockTransaction.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
        else:
            where_clauses.append(StockTransaction.invoice_date <= date_to_parsed)
    
    if transaction_type:
        where_clauses.append(StockTransaction.transaction_type == transaction_type)
    
    if product_id:
        where_clauses.append(StockTransaction.product_id == product_id)

    # Count total matching records
    count_stmt = (
        select(func.count())
        .select_from(StockTransaction)
        .join(Product, Product.id == StockTransaction.product_id)
        .where(*where_clauses)
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one() or 0

    # Build main query
    stmt = (
        select(StockTransaction, Product, Stock)
        .join(Product, Product.id == StockTransaction.product_id)
        .outerjoin(Stock, Stock.product_id == Product.id)
        .where(*where_clauses)
    )

    # Apply sorting
    if sort_by == "quantity":
        stmt = stmt.order_by(StockTransaction.quantity.desc() if sort_order == "desc" else StockTransaction.quantity.asc())
    elif sort_by == "total":
        stmt = stmt.order_by(StockTransaction.subtotal.desc() if sort_order == "desc" else StockTransaction.subtotal.asc())
    else:  # date
        order_col = created_at_attr if created_at_attr else StockTransaction.invoice_date
        stmt = stmt.order_by(order_col.desc() if sort_order == "desc" else order_col.asc())

    # Apply pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(stmt)
    rows = result.all()

    # Calculate summary statistics
    from sqlalchemy import case
    
    summary_stmt = select(
        func.count(StockTransaction.id).label("total_transactions"),
        func.coalesce(func.sum(
            case((StockTransaction.transaction_type == "IN", StockTransaction.quantity), else_=0)
        ), 0).label("total_in_quantity"),
        func.coalesce(func.sum(
            case((StockTransaction.transaction_type == "OUT", StockTransaction.quantity), else_=0)
        ), 0).label("total_out_quantity"),
        func.coalesce(func.sum(
            case((StockTransaction.transaction_type == "IN", StockTransaction.subtotal), else_=0)
        ), 0).label("total_in_value"),
        func.coalesce(func.sum(
            case((StockTransaction.transaction_type == "OUT", StockTransaction.subtotal), else_=0)
        ), 0).label("total_out_value"),
    ).select_from(StockTransaction).join(
        Product, Product.id == StockTransaction.product_id
    ).where(*where_clauses)
    
    summary_result = await db.execute(summary_stmt)
    summary = summary_result.first()

    # Build stock movement data for table
    movements_data = []
    for st, prod, stock in rows:
        movements_data.append({
            "transaction_id": str(st.id),
            "date": st.created_at.isoformat() if created_at_attr and st.created_at else (st.invoice_date.isoformat() if st.invoice_date else None),
            "product_id": str(prod.id),
            "product_name": prod.name,
            "transaction_type": st.transaction_type,
            "quantity": int(st.quantity),
            "unit_cost": str(st.unit_cost) if st.unit_cost else "0.00",
            "total": str(st.subtotal) if st.subtotal else "0.00",
            "balance": int(stock.quantity_available) if stock else 0,
            "reference": st.reference,
            "supplier_name": st.supplier_name,
        })

    # Count by transaction type for filter badges
    type_counts = {}
    for trans_type in ["IN", "OUT"]:
        type_count_stmt = (
            select(func.count())
            .select_from(StockTransaction)
            .join(Product, Product.id == StockTransaction.product_id)
            .where(
                StockTransaction.product_id.in_(sku_ids_sel),
                StockTransaction.transaction_type == trans_type
            )
        )
        if date_from_parsed:
            if created_at_attr:
                type_count_stmt = type_count_stmt.where(StockTransaction.created_at >= datetime.combine(date_from_parsed, datetime.min.time()))
            else:
                type_count_stmt = type_count_stmt.where(StockTransaction.invoice_date >= date_from_parsed)
        if date_to_parsed:
            if created_at_attr:
                type_count_stmt = type_count_stmt.where(StockTransaction.created_at <= datetime.combine(date_to_parsed, datetime.max.time()))
            else:
                type_count_stmt = type_count_stmt.where(StockTransaction.invoice_date <= date_to_parsed)
        
        type_count_result = await db.execute(type_count_stmt)
        type_counts[trans_type] = type_count_result.scalar_one() or 0

    total_in_qty = int(summary.total_in_quantity or 0)
    total_out_qty = int(summary.total_out_quantity or 0)
    total_in_val = Decimal(str(summary.total_in_value or "0.00"))
    total_out_val = Decimal(str(summary.total_out_value or "0.00"))

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "date_from": date_from_parsed.isoformat() if date_from_parsed else None,
        "date_to": date_to_parsed.isoformat() if date_to_parsed else None,
        "summary": {
            "total_transactions": summary.total_transactions or 0,
            "total_in_quantity": total_in_qty,
            "total_out_quantity": total_out_qty,
            "total_in_value": str(total_in_val),
            "total_out_value": str(total_out_val),
            "net_quantity": total_in_qty - total_out_qty,
            "net_value": str((total_in_val - total_out_val).quantize(Decimal("0.01"))),
        },
        "transaction_type_counts": type_counts,
        "movements": movements_data,
    }