"""
Product resolver router — FR-1 through FR-10.
Handles link normalization, product fetch, variant detection, and field override.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from models.schemas import (
    ProductResolveRequest,
    ProductResponse,
    ProductImage,
    FieldSource,
)
from services.product_resolver import ProductResolverService
import structlog

router = APIRouter()
log = structlog.get_logger()


@router.post("/resolve", response_model=ProductResponse)
async def resolve_product(request: ProductResolveRequest):
    """
    FR-1, FR-2, FR-3, FR-5, FR-6
    Normalize the product link, look up in ShopDeck DB, verify seller ownership.
    Returns product data WITHOUT cost price.
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
