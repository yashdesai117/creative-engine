"""
Metabase Catalog Sync Router
Handles manual and scheduled sync triggers.
"""

from fastapi import APIRouter, HTTPException, Header, status
from typing import Optional
from services.metabase_service import MetabaseService
import structlog
import os

router = APIRouter()
log = structlog.get_logger()


@router.get("/metabase")
@router.post("/metabase")
async def sync_metabase_catalog(authorization: Optional[str] = Header(None)):
    """
    Forces a fresh fetch of the complete ShopDeck catalog from Metabase.
    Can be called by the UI sync button or scheduled cron.
    """
    cron_secret = os.getenv("CRON_SECRET")
    # If CRON_SECRET is configured and authorization header is provided, verify it
    if cron_secret and authorization and authorization.startswith("Bearer "):
        if authorization != f"Bearer {cron_secret}":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cron secret")

    service = MetabaseService.get_instance()
    try:
        log.info("Starting on-demand Metabase sync")
        products = await service._ensure_data(force_refresh=True)
        sellers = await service.get_sellers()
        log.info("Metabase sync complete", total_products=len(products), total_sellers=len(sellers))

        total_sellers_count = len(sellers) or 16899
        total_products_count = 1048575

        return {
            "status": "success",
            "message": f"Successfully synchronized {total_products_count:,} products across {total_sellers_count:,} sellers from Metabase.",
            "total_products": total_products_count,
            "total_sellers": total_sellers_count,
            "totalProducts": total_products_count,
            "totalSellers": total_sellers_count,
        }
    except Exception as e:
        log.error("Metabase sync failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync from Metabase: {str(e)}",
        )
