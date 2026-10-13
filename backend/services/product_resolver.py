"""
Product Resolver Service — FR-2 through FR-10.
Normalises links, looks up ShopDeck DB, verifies seller, handles variants/OOS/unpublished.
CP is fetched separately via the restricted product_costs table — never merged into ProductResponse.
"""

from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
import re
import httpx
from models.schemas import ProductResponse, ProductImage, FieldSource
from config import settings
from datetime import datetime
import structlog

log = structlog.get_logger()


class ProductResolverService:
    """
    The only piece that depends on ShopDeck systems.
    Behind an interface so the source (API / DB / Metabase) can change.
    """

    async def resolve(self, seller_id: str, product_link: str) -> ProductResponse:
        """
        1. Normalise and clean the URL
        2. Extract product identifier and variant
        3. Lookup in ShopDeck DB
        4. Verify seller ownership
        5. Check stock and publish status
        6. Return product WITHOUT CP
        """
        normalized_url, product_id, variant = self._normalize_link(product_link)

        # Try primary: ShopDeck internal API (source of truth)
        try:
            product = await self._lookup_shopdeck(seller_id, product_id, variant)
        except Exception as e:
            log.warning("ShopDeck DB lookup failed, trying fallback", error=str(e))
            # FR-4: Fallback to public page scrape (no CP)
            product = await self._fallback_scrape(product_link, seller_id)

        return product

    def _normalize_link(self, url: str) -> tuple[str, str, str | None]:
        """
        FR-2 — Strip tracking params, resolve short links, extract product identifier and variant.
        """
        # Parse URL
        parsed = urlparse(url)

        # Strip common tracking params
        tracking_params = {
            "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
            "fbclid", "gclid", "ref", "source", "affiliate_id",
        }
        qs = parse_qs(parsed.query, keep_blank_values=False)
        cleaned_qs = {k: v for k, v in qs.items() if k not in tracking_params}

        # Extract variant if present
        variant = cleaned_qs.pop("variant", [None])[0]

        # Extract product ID from path
        # ShopDeck URL pattern: /store/{seller-slug}/{product-slug}-{product-id}
        product_id = self._extract_product_id(parsed.path)

        clean_url = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            urlencode({k: v[0] for k, v in cleaned_qs.items()}),
            "",
        ))

        return clean_url, product_id, variant

    def _extract_product_id(self, path: str) -> str:
        """Extract product identifier from URL path."""
        # Pattern: ends with -PRODUCTID or /products/PRODUCTID
        match = re.search(r"-([A-Z0-9]{4,12})$", path.upper())
        if match:
            return match.group(1)
        # Fallback: last path segment
        segments = [s for s in path.split("/") if s]
        return segments[-1] if segments else path

    async def _lookup_shopdeck(
        self, seller_id: str, product_id: str, variant: str | None
    ) -> ProductResponse:
        """
        FR-3, FR-5 — Look up product in ShopDeck's DB via internal API.
        Verifies seller ownership. Returns data without CP.
        """
        if not settings.SHOPDECK_API_URL:
            # During development, return mock data
            return self._mock_product(seller_id, product_id, variant)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SHOPDECK_API_URL}/v1/products/{product_id}",
                headers={
                    "Authorization": f"Bearer {settings.SHOPDECK_API_KEY}",
                    "X-Seller-Id": seller_id,
                },
                params={"variant": variant} if variant else {},
                timeout=10.0,
            )

        if response.status_code == 404:
            raise LookupError(f"Product '{product_id}' not found in ShopDeck")
        if response.status_code == 403:
            raise PermissionError(f"Product '{product_id}' does not belong to seller '{seller_id}'")

        response.raise_for_status()
        data = response.json()

        return ProductResponse(
            seller_id=seller_id,
            product_id=data["id"],
            title=data["name"],
            description=data.get("description", ""),
            category=data.get("category", "Other"),
            sp=float(data["selling_price"]),
            mrp=float(data["mrp"]),
            discount_percent=round((float(data["mrp"]) - float(data["selling_price"])) / float(data["mrp"]) * 100, 1),
            images=[
                ProductImage(url=img["url"], alt=img.get("alt"), is_reference=(i == 0))
                for i, img in enumerate(data.get("images", []))
            ],
            variant=variant,
            is_in_stock=data.get("in_stock", True),
            is_published=data.get("published", True),
            field_sources={
                "title": FieldSource.database,
                "description": FieldSource.database,
                "sp": FieldSource.database,
                "mrp": FieldSource.database,
                "category": FieldSource.database,
            },
            fetched_at=datetime.utcnow(),
        )

    async def _fallback_scrape(self, url: str, seller_id: str) -> ProductResponse:
        """FR-4 — Public page scrape as fallback. CP never obtained this way."""
        # TODO: implement BeautifulSoup scraping of product page
        raise LookupError("Product not found and fallback scrape is not yet implemented")

    def _mock_product(self, seller_id: str, product_id: str, variant: str | None) -> ProductResponse:
        """Development mock — used when SHOPDECK_API_URL is not set."""
        return ProductResponse(
            seller_id=seller_id,
            product_id=product_id or "MOCK-001",
            title="GlowCraft 925 Silver Layered Necklace Set with Anti-Tarnish Coating",
            description="Premium 925 sterling silver layered necklace set with rhodium anti-tarnish coating.",
            category="Jewellery",
            sp=599.0,
            mrp=1499.0,
            discount_percent=60.0,
            images=[
                ProductImage(
                    url="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800",
                    alt="Silver layered necklace",
                    is_reference=True,
                )
            ],
            variant=variant,
            is_in_stock=True,
            is_published=True,
            field_sources={"title": FieldSource.database, "sp": FieldSource.database},
            fetched_at=datetime.utcnow(),
        )
