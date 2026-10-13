import { NextRequest, NextResponse } from "next/server";
import { fetchMetabaseCatalog, getLiveSellers } from "@/lib/metabase";

export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

export async function GET(req: NextRequest) {

  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set and request is from external cron, verify it
  // (Manual requests from internal browser session don't have Bearer CRON_SECRET)
  if (cronSecret && authHeader && authHeader.startsWith("Bearer ")) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1. Force refresh the catalog cache from Metabase live query
    const products = await fetchMetabaseCatalog(true);

    // 2. Aggregate distinct sellers from live Metabase products
    const sellersMap = new Map<
      string,
      {
        seller_id: string;
        seller_name: string;
        seller_website: string | null;
        product_count: number;
        sample_image_url: string | null;
        categories: string[];
        updated_at: string;
      }
    >();

    for (const p of products) {
      if (!p.seller_id) continue;
      const existing = sellersMap.get(p.seller_id);
      if (!existing) {
        sellersMap.set(p.seller_id, {
          seller_id: p.seller_id,
          seller_name: p.seller_name || "ShopDeck Seller",
          seller_website: p.seller_website || null,
          product_count: 1,
          sample_image_url: p.image_link || null,
          categories: p.category ? [p.category] : [],
          updated_at: new Date().toISOString(),
        });
      } else {
        existing.product_count++;
        if (p.category && !existing.categories.includes(p.category)) {
          existing.categories.push(p.category);
        }
        if (!existing.sample_image_url && p.image_link) {
          existing.sample_image_url = p.image_link;
        }
      }
    }

    const sellersList = Array.from(sellersMap.values());
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let syncedToSupabase = false;
    let logId: string | null = null;

    // 3. If Supabase credentials are configured, upsert sellers AND products
    if (supabaseUrl && supabaseKey) {
      try {
        // Start sync log
        try {
          const logInit = await fetch(`${supabaseUrl}/rest/v1/metabase_sync_logs`, {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              status: "running",
              started_at: new Date().toISOString(),
            }),
          });
          if (logInit.ok) {
            const logArr = await logInit.json();
            if (Array.isArray(logArr) && logArr.length > 0) logId = logArr[0].id;
          }
        } catch {
          // Log table might not be initialized yet; continue with sync
        }

        // Upsert sellers in chunks of 200
        for (let i = 0; i < sellersList.length; i += 200) {
          const chunk = sellersList.slice(i, i + 200);
          await fetch(`${supabaseUrl}/rest/v1/catalog_sellers`, {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(chunk),
          });
        }

        // Upsert products in chunks of 200
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

        for (let i = 0; i < productsPayload.length; i += 200) {
          const chunk = productsPayload.slice(i, i + 200);
          await fetch(`${supabaseUrl}/rest/v1/catalog_products`, {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(chunk),
          });
        }

        syncedToSupabase = true;

        // Finish sync log
        if (logId) {
          await fetch(`${supabaseUrl}/rest/v1/metabase_sync_logs?id=eq.${logId}`, {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "success",
              completed_at: new Date().toISOString(),
              total_rows_processed: products.length,
              total_sellers_synced: sellersList.length,
            }),
          });
        }
      } catch (sbErr) {
        console.warn("Failed during Supabase catalog sync:", sbErr);
      }
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
      message: syncedToSupabase
        ? `Successfully synced ${products.length.toLocaleString()} products across ${sellersList.length.toLocaleString()} sellers from Metabase into Supabase!`
        : `Successfully fetched and refreshed ${products.length.toLocaleString()} live products across ${sellersList.length.toLocaleString()} sellers from Metabase.`,
      totalProducts: products.length,
      totalSellers: sellersList.length,
      syncedToSupabase,
      githubWorkflowTriggered,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Metabase sync error:", error);
    return NextResponse.json(
      { error: "Failed to synchronize catalog from Metabase", details: String(error) },
      { status: 500 }
    );
  }
}

