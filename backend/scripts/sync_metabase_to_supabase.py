"""
Metabase to Supabase Daily Sync Script
Streams the complete, unconstrained CSV from Metabase public question:
https://metabase.kaip.in/public/question/9ba58a6c-92b1-436d-840f-fbb724c3ef24
and bulk-upserts all sellers and products into Supabase.
"""

import os
import csv
import io
import time
import urllib.request
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

METABASE_CSV_URL = "https://metabase.kaip.in/api/public/card/9ba58a6c-92b1-436d-840f-fbb724c3ef24/query/csv"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

BATCH_SIZE = 500


def run_sync():
    print(f"[{datetime.utcnow().isoformat()}] Starting Metabase -> Supabase catalog sync...")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required in .env")
        return False

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Start sync log
    log_res = (
        supabase.table("metabase_sync_logs")
        .insert({"status": "running"})
        .execute()
    )
    log_id = log_res.data[0]["id"] if log_res.data else None

    start_time = time.time()
    total_rows = 0
    unique_sellers = {}
    products_batch = []

    try:
        req = urllib.request.Request(
            METABASE_CSV_URL,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CreativeEngineSync/1.0"
            },
        )

        with urllib.request.urlopen(req, timeout=120) as resp:
            text_stream = io.TextIOWrapper(resp, encoding="utf-8", errors="replace")
            reader = csv.DictReader(text_stream)

            for row in reader:
                total_rows += 1
                seller_id = str(row.get("seller_id") or "").strip()
                seller_name = str(row.get("seller_name") or "ShopDeck Seller").strip()
                seller_website = str(row.get("seller_website") or "").strip()
                product_id = str(row.get("product_id") or "").strip()
                sku_id = str(row.get("sku_id") or "").strip()

                if not seller_id or not product_id:
                    continue

                # Collect distinct sellers
                if seller_id not in unique_sellers:
                    unique_sellers[seller_id] = {
                        "seller_id": seller_id,
                        "seller_name": seller_name,
                        "seller_website": seller_website,
                    }

                sp = float(row.get("sp") or 0.0)
                mrp = float(row.get("mrp") or sp)
                cp = float(row.get("cp") or 0.0)
                discount = round(((mrp - sp) / mrp * 100), 2) if mrp > sp and mrp > 0 else 0.0
                margin = round(((sp - cp) / sp * 100), 2) if sp > cp and sp > 0 else 0.0

                products_batch.append({
                    "seller_id": seller_id,
                    "seller_name": seller_name,
                    "seller_website": seller_website,
                    "website_product_link": str(row.get("website_product_link") or "").strip(),
                    "product_id": product_id,
                    "sku_id": sku_id,
                    "product_name": str(row.get("product_name") or "").strip(),
                    "size": row.get("size") or None,
                    "sku_colour": row.get("sku_colour") or None,
                    "cp": cp,
                    "sp": sp,
                    "mrp": mrp,
                    "discount_percent": discount,
                    "margin_percent": margin,
                    "quantity": int(float(row.get("quantity") or 0)),
                    "lifetime_sales": float(row.get("lifetime_sales") or 0.0),
                    "lifetime_orders": int(float(row.get("lifetime_orders") or 0)),
                    "lifetime_delivered_orders": int(float(row.get("lifetime_delivered_orders") or 0)),
                    "is_oos": str(row.get("is_oos") or "").lower() in ("true", "1", "t"),
                    "category": str(row.get("category") or "").strip(),
                    "sub_category": str(row.get("sub_category") or "").strip(),
                    "product_type": str(row.get("product_type") or "").strip(),
                    "image_link": str(row.get("image_link") or "").strip(),
                    "synced_at": datetime.utcnow().isoformat(),
                })

                # Upsert products in chunks
                if len(products_batch) >= BATCH_SIZE:
                    # First ensure sellers exist in catalog_sellers
                    seller_records = list(unique_sellers.values())
                    if seller_records:
                        supabase.table("catalog_sellers").upsert(
                            seller_records, on_conflict="seller_id"
                        ).execute()

                    # Upsert products batch
                    supabase.table("catalog_products").upsert(
                        products_batch, on_conflict="seller_id,product_id,sku_id"
                    ).execute()
                    print(f"  Processed {total_rows} rows...")
                    products_batch = []

            # Flush remaining products
            if products_batch:
                seller_records = list(unique_sellers.values())
                if seller_records:
                    supabase.table("catalog_sellers").upsert(
                        seller_records, on_conflict="seller_id"
                    ).execute()

                supabase.table("catalog_products").upsert(
                    products_batch, on_conflict="seller_id,product_id,sku_id"
                ).execute()

        # Run aggregate refresh in Supabase
        try:
            supabase.rpc("refresh_catalog_seller_aggregates").execute()
        except Exception as e:
            print("Notice: refresh_catalog_seller_aggregates RPC call:", e)

        duration = round(time.time() - start_time, 2)
        print(
            f"SUCCESS: Synced {total_rows} products across {len(unique_sellers)} sellers in {duration}s"
        )

        if log_id:
            supabase.table("metabase_sync_logs").update({
                "status": "success",
                "completed_at": datetime.utcnow().isoformat(),
                "total_rows_processed": total_rows,
                "total_sellers_synced": len(unique_sellers),
            }).eq("id", log_id).execute()

        return True

    except Exception as e:
        print(f"ERROR during sync: {e}")
        if log_id:
            supabase.table("metabase_sync_logs").update({
                "status": "failed",
                "completed_at": datetime.utcnow().isoformat(),
                "error_message": str(e),
                "total_rows_processed": total_rows,
                "total_sellers_synced": len(unique_sellers),
            }).eq("id", log_id).execute()
        return False


if __name__ == "__main__":
    run_sync()
