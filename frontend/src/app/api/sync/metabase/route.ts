import { NextRequest, NextResponse } from "next/server";
import { fetchMetabaseCatalog } from "@/lib/metabase";
import allSellersRaw from "@/lib/data/sellers.json";

export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

interface SellerRecord {
  seller_id: string;
  seller_name: string;
  seller_website: string | null;
  product_count: number;
  sample_image_url: string | null;
  categories: string[];
  updated_at: string;
}

async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set and request is from external cron, verify it
  if (cronSecret && authHeader && authHeader.startsWith("Bearer ")) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1. Force refresh live products from Metabase card query
    const products = await fetchMetabaseCatalog(true);

    // 2. Aggregate ALL sellers (16,899 pre-indexed sellers + live Metabase updates)
    const sellersMap = new Map<string, SellerRecord>();

    // Load full catalog of 16,899 sellers
    for (const s of (allSellersRaw as any[])) {
      if (!s.seller_id) continue;
      sellersMap.set(s.seller_id, {
        seller_id: s.seller_id,
        seller_name: s.seller_name || "ShopDeck Seller",
        seller_website: s.seller_website || null,
        product_count: Number(s.product_count) || 0,
        sample_image_url: s.sample_image || null,
        categories: Array.isArray(s.categories) ? s.categories : [],
        updated_at: new Date().toISOString(),
      });
    }

    // Merge latest live items from Metabase
    for (const p of products) {
      if (!p.seller_id) continue;
      const existing = sellersMap.get(p.seller_id);
      if (existing) {
        if (p.image_link && !existing.sample_image_url) {
          existing.sample_image_url = p.image_link;
        }
        if (p.category && !existing.categories.includes(p.category)) {
          existing.categories.push(p.category);
        }
      } else {
        sellersMap.set(p.seller_id, {
          seller_id: p.seller_id,
          seller_name: p.seller_name || "ShopDeck Seller",
          seller_website: p.seller_website || null,
          product_count: 1,
          sample_image_url: p.image_link || null,
          categories: p.category ? [p.category] : [],
          updated_at: new Date().toISOString(),
        });
      }
    }

    const sellersList = Array.from(sellersMap.values());
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      "";

    // If Supabase credentials are missing, notify the user clearly
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: "warning",
        message: `Metabase catalog refreshed in memory (${products.length.toLocaleString()} products, ${sellersList.length.toLocaleString()} sellers), but Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in Vercel or .env.local to persist data in Supabase.`,
        totalProducts: products.length,
        totalSellers: sellersList.length,
        syncedToSupabase: false,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Upsert ALL sellers into Supabase catalog_sellers in batches of 1000
    const SELLER_BATCH_SIZE = 1000;
    for (let i = 0; i < sellersList.length; i += SELLER_BATCH_SIZE) {
      const chunk = sellersList.slice(i, i + SELLER_BATCH_SIZE);
      const res = await fetch(`${supabaseUrl}/rest/v1/catalog_sellers`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(chunk),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(
          `Supabase catalog_sellers batch ${Math.floor(i / SELLER_BATCH_SIZE) + 1} failed (HTTP ${res.status}): ${errorBody}`
        );
      }
    }

    // 4. Upsert live products into Supabase catalog_products in batches of 500
    const productsPayload = products
      .filter((p) => p.seller_id && p.product_id)
      .map((p) => ({
        seller_id: p.seller_id,
        seller_name: p.seller_name || null,
        seller_website: p.seller_website || null,
        website_product_link: p.website_product_link,
        product_id: p.product_id,
        sku_id: p.sku_id || "",
        product_name: p.product_name,
        product_description: p.product_description || null,
        size: p.size || null,
        sku_colour: p.sku_colour || null,
        cp: p.cp || 0,
        sp: p.sp || 0,
        mrp: p.mrp || p.sp || 0,
        discount_percent: p.discount_percent || 0,
        margin_percent:
          p.sp > 0 && p.cp > 0 ? Math.round(((p.sp - p.cp) / p.sp) * 1000) / 10 : 0,
        quantity: p.quantity || 0,
        lifetime_sales: p.lifetime_sales || 0,
        lifetime_orders: p.lifetime_orders || 0,
        is_oos: Boolean(p.is_oos),
        category: p.category || "General",
        sub_category: p.sub_category || null,
        product_type: p.product_type || null,
        image_link: p.image_link || null,
        catalogue_updated_at: p.catalogue_updated_at || null,
        synced_at: new Date().toISOString(),
      }));

    const PRODUCT_BATCH_SIZE = 500;
    for (let i = 0; i < productsPayload.length; i += PRODUCT_BATCH_SIZE) {
      const chunk = productsPayload.slice(i, i + PRODUCT_BATCH_SIZE);
      const res = await fetch(`${supabaseUrl}/rest/v1/catalog_products`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(chunk),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(
          `Supabase catalog_products batch ${Math.floor(i / PRODUCT_BATCH_SIZE) + 1} failed (HTTP ${res.status}): ${errorBody}`
        );
      }
    }

    // 5. Insert success log into metabase_sync_logs
    try {
      await fetch(`${supabaseUrl}/rest/v1/metabase_sync_logs`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "success",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          total_rows_processed: productsPayload.length,
          total_sellers_synced: sellersList.length,
        }),
      });
    } catch {
      // Non-critical if log table isn't present
    }

    // Optional: Trigger full background daily sync on GitHub Actions if GITHUB_TOKEN is set
    const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
    let githubWorkflowTriggered = false;

    if (githubToken) {
      try {
        const ghRes = await fetch(
          "https://api.github.com/repos/yashdesai117/creative-engine/actions/workflows/daily-sync.yml/dispatches",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "CreativeEngine-Sync/1.0",
            },
            body: JSON.stringify({ ref: "main" }),
          }
        );
        if (ghRes.ok || ghRes.status === 204) {
          githubWorkflowTriggered = true;
        }
      } catch (ghErr) {
        console.warn("Could not dispatch GitHub Actions workflow:", ghErr);
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Successfully synced all ${sellersList.length.toLocaleString()} sellers and ${productsPayload.length.toLocaleString()} products from Metabase directly into Supabase!`,
      totalProducts: productsPayload.length,
      totalSellers: sellersList.length,
      syncedToSupabase: true,
      githubWorkflowTriggered,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Metabase sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to synchronize catalog with Supabase",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

