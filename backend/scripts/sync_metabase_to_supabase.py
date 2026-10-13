"""
Metabase to Supabase Daily Sync Script
Streams the complete, unconstrained CSV from Metabase public question:
https://metabase.kaip.in/public/question/9ba58a6c-92b1-436d-840f-fbb724c3ef24
and bulk-upserts all sellers and products into Supabase and updates local catalog cache.
"""

import os
import csv
import io
import json
import time
import urllib.request
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

METABASE_CSV_URL = "https://metabase.kaip.in/api/public/card/9ba58a6c-92b1-436d-840f-fbb724c3ef24/query/csv"
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

BATCH_SIZE = 1000


def get_sellers_json_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))
    backend_path = os.path.join(root_dir, "backend", "data", "sellers.json")
    frontend_path = os.path.join(root_dir, "frontend", "src", "lib", "data", "sellers.json")
    return backend_path, frontend_path


def load_local_sellers():
    backend_path, _ = get_sellers_json_paths()
    if os.path.exists(backend_path):
        try:
            with open(backend_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not read {backend_path}: {e}")
    return []


def save_local_sellers(sellers_list):
    backend_path, frontend_path = get_sellers_json_paths()
    os.makedirs(os.path.dirname(backend_path), exist_ok=True)
    os.makedirs(os.path.dirname(frontend_path), exist_ok=True)

    with open(backend_path, "w", encoding="utf-8") as f:
        json.dump(sellers_list, f, ensure_ascii=False)
    with open(frontend_path, "w", encoding="utf-8") as f:
        json.dump(sellers_list, f, ensure_ascii=False)
    print(f"Saved {len(sellers_list)} sellers to {backend_path} and {frontend_path}")


def sync_sellers_to_supabase(supabase, sellers_dict):
    """Upserts all sellers into Supabase catalog_sellers in batches of 1000."""
    print(f"Upserting {len(sellers_dict)} distinct sellers into catalog_sellers...")
    sellers_list = list(sellers_dict.values())
    total_synced = 0

    for i in range(0, len(sellers_list), BATCH_SIZE):
        batch = sellers_list[i : i + BATCH_SIZE]
        records = [
            {
                "seller_id": s["seller_id"],
                "seller_name": s["seller_name"],
                "seller_website": s.get("seller_website") or None,
                "product_count": s.get("product_count", 0),
                "sample_image_url": s.get("sample_image") or None,
                "categories": s.get("categories", []),
                "updated_at": datetime.utcnow().isoformat(),
            }
            for s in batch
        ]
        try:
            supabase.table("catalog_sellers").upsert(
                records, on_conflict="seller_id"
            ).execute()
            total_synced += len(records)
            print(f"  Upserted {total_synced}/{len(sellers_list)} sellers...")
        except Exception as e:
            print(f"  Warning: Error upserting sellers batch {i}: {e}")

    print(f"Finished upserting {total_synced} sellers into Supabase.")
    return total_synced


def run_sync(sellers_only: bool = False):
    print(f"[{datetime.utcnow().isoformat()}] Starting Metabase catalog sync...")

    supabase = None
    log_id = None

    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print(f"Connected to Supabase at {SUPABASE_URL[:28]}...")

            log_res = (
                supabase.table("metabase_sync_logs")
                .insert({"status": "running"})
                .execute()
            )
            log_id = log_res.data[0]["id"] if log_res.data else None
        except Exception as e:
            print(f"Warning: Could not connect to Supabase or start log: {e}")
    else:
        print("Note: SUPABASE_URL / SUPABASE_KEY not provided. Syncing local catalog JSON files.")

    # 1. First sync pre-indexed sellers if sellers_only
    local_sellers = load_local_sellers()
    if sellers_only:
        if supabase and local_sellers:
            sellers_dict = {s["seller_id"]: s for s in local_sellers}
            sync_sellers_to_supabase(supabase, sellers_dict)
            print("Sellers-only sync finished successfully.")
            return True
        elif not supabase:
            print(f"Sellers-only requested: {len(local_sellers)} sellers already in local cache.")
            return True

    # 2. Stream unconstrained Metabase CSV
    start_time = time.time()
    total_rows = 0
    sellers_dict = {}
    products_batch = []

    # Initialize with local sellers if present
    for s in local_sellers:
        sellers_dict[s["seller_id"]] = {
            "seller_id": s["seller_id"],
            "seller_name": s["seller_name"],
            "seller_website": s.get("seller_website", ""),
            "product_count": 0,
            "sample_image": s.get("sample_image", ""),
            "categories": set(s.get("categories", [])),
        }

    try:
        req = urllib.request.Request(
            METABASE_CSV_URL,
            headers={"User-Agent": "CreativeEngineSync/2.0"},
        )

        with urllib.request.urlopen(req, timeout=300) as resp:
            text_stream = io.TextIOWrapper(resp, encoding="utf-8", errors="replace")
            reader = csv.DictReader(text_stream)

            for row in reader:
                total_rows += 1
                seller_id = str(row.get("seller_id") or "").strip()
                seller_name = str(row.get("seller_name") or "ShopDeck Seller").strip()
                seller_website = str(row.get("seller_website") or "").strip()
                product_id = str(row.get("product_id") or "").strip()
                sku_id = str(row.get("sku_id") or "").strip()
                cat = str(row.get("category") or "").strip()
                img = str(row.get("image_link") or "").strip()

                if not seller_id:
                    continue

                if seller_id not in sellers_dict:
                    sellers_dict[seller_id] = {
                        "seller_id": seller_id,
                        "seller_name": seller_name,
                        "seller_website": seller_website,
                        "product_count": 0,
                        "sample_image": img or "",
                        "categories": set(),
                    }

                sellers_dict[seller_id]["product_count"] += 1
                if cat and len(sellers_dict[seller_id]["categories"]) < 5:
                    sellers_dict[seller_id]["categories"].add(cat)
                if not sellers_dict[seller_id]["sample_image"] and img:
                    sellers_dict[seller_id]["sample_image"] = img

                # If Supabase is connected, build product batch
                if supabase and product_id:
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
                        "product_description": str(row.get("product_description") or "").strip() or None,
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
                        "category": cat or "General",
                        "sub_category": str(row.get("sub_category") or "").strip(),
                        "product_type": str(row.get("product_type") or "").strip(),
                        "image_link": img,
                        "synced_at": datetime.utcnow().isoformat(),
                    })

                    if len(products_batch) >= BATCH_SIZE:
                        try:
                            supabase.table("catalog_products").upsert(
                                products_batch, on_conflict="seller_id,product_id,sku_id"
                            ).execute()
                        except Exception as e:
                            print(f"  Warning on products batch upsert: {e}")
                        products_batch = []

                if total_rows % 50000 == 0:
                    elapsed = time.time() - start_time
                    print(f"Processed {total_rows} rows, {len(sellers_dict)} distinct sellers ({elapsed:.1f}s)...")

            # Flush remaining products
            if supabase and products_batch:
                try:
                    supabase.table("catalog_products").upsert(
                        products_batch, on_conflict="seller_id,product_id,sku_id"
                    ).execute()
                except Exception as e:
                    print(f"  Warning on final products batch: {e}")

        # Convert categories sets to sorted lists and sort sellers by product_count desc
        formatted_sellers = []
        for s in sellers_dict.values():
            s_copy = dict(s)
            s_copy["categories"] = sorted(list(s["categories"]))
            formatted_sellers.append(s_copy)

        formatted_sellers.sort(key=lambda x: x["product_count"], reverse=True)

        # Save to local JSON files
        save_local_sellers(formatted_sellers)

        # Sync sellers to Supabase
        if supabase:
            sync_sellers_to_supabase(supabase, {s["seller_id"]: s for s in formatted_sellers})

            try:
                supabase.rpc("refresh_catalog_seller_aggregates").execute()
            except Exception as e:
                print("Notice: refresh_catalog_seller_aggregates RPC call:", e)

            if log_id:
                supabase.table("metabase_sync_logs").update({
                    "status": "success",
                    "completed_at": datetime.utcnow().isoformat(),
                    "total_rows_processed": total_rows,
                    "total_sellers_synced": len(formatted_sellers),
                }).eq("id", log_id).execute()

        duration = round(time.time() - start_time, 2)
        print(f"SUCCESS: Synced {total_rows} products across {len(formatted_sellers)} sellers in {duration}s")
        return True

    except Exception as e:
        print(f"ERROR during sync: {e}")
        if supabase and log_id:
            try:
                supabase.table("metabase_sync_logs").update({
                    "status": "failed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "error_message": str(e),
                    "total_rows_processed": total_rows,
                    "total_sellers_synced": len(sellers_dict),
                }).eq("id", log_id).execute()
            except Exception:
                pass
        return False


if __name__ == "__main__":
    import sys
    sellers_only = "--sellers-only" in sys.argv
    run_sync(sellers_only=sellers_only)
