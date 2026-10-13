"""
Product resolver router — FR-1 through FR-10.
Handles link normalization, Metabase catalog lookup, seller listing, and product search.
"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from models.schemas import (
    ProductResolveRequest,
    ProductResponse,
    ProductImage,
    FieldSource,
)
from services.product_resolver import ProductResolverService
from services.metabase_service import MetabaseService
import structlog

router = APIRouter()
log = structlog.get_logger()


@router.get("/sellers")
async def get_sellers(q: Optional[str] = Query(None, description="Search term for seller name or ID")):
    """
    Returns list of active ShopDeck sellers from the Metabase catalog.
    Used for typeahead search and selection in the Intake form.
    """
    service = MetabaseService.get_instance()
    try:
        sellers = await service.get_sellers(query=q)
        return {"sellers": sellers, "total": len(sellers)}
    except Exception as e:
        log.error("Failed to load sellers", error=str(e))
        return {"sellers": [], "total": 0, "error": str(e)}


@router.get("/by-seller/{seller_id}")
async def get_products_by_seller(
    seller_id: str,
    limit: int = Query(50, ge=1, le=100),
):
    """
    Returns catalog products for a specific seller.
    Allows user to pick a product directly without copying/pasting URL.
    """
    service = MetabaseService.get_instance()
    try:
        products = await service.get_products_by_seller(seller_id, limit=limit)
        return {"products": products, "total": len(products)}
    except Exception as e:
        log.error("Failed to load seller products", error=str(e))
        return {"products": [], "total": 0, "error": str(e)}


@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=2, description="Search query across products"),
    limit: int = Query(25, ge=1, le=50),
):
    """
    Search catalog products by name, category, or URL.
    """
    service = MetabaseService.get_instance()
    try:
        products = await service.search_products(query=q, limit=limit)
        return {"products": products, "total": len(products)}
    except Exception as e:
        log.error("Search failed", error=str(e))
        return {"products": [], "total": 0, "error": str(e)}


@router.post("/resolve", response_model=ProductResponse)
async def resolve_product(request: ProductResolveRequest):
    """
    FR-1, FR-2, FR-3, FR-5, FR-6
    Normalize the product link, look up in live Metabase catalog / ShopDeck DB.
    Returns product data WITHOUT exposing sensitive cost price to client.
    """
    service = ProductResolverService()

    try:
        product = await service.resolve(
            seller_id=request.seller_id,
            product_link=request.product_link,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

    return product
