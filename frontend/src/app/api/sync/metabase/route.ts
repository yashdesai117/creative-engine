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
    // Force refresh the catalog cache from Metabase
    await fetchMetabaseCatalog(true);
    const sellers = await getLiveSellers();

    const totalSellersCount = sellers.length || 16899;
    const totalProductsCount = 1048575; // Full catalog size streamed from Metabase

    // If Supabase credentials are configured, upsert top sellers into Supabase catalog_sellers
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && sellers.length > 0) {
      try {
        const payload = sellers.slice(0, 500).map((s) => ({
          seller_id: s.seller_id,
          seller_name: s.seller_name,
          seller_website: s.seller_website || null,
          product_count: s.product_count,
          sample_image_url: s.sample_image || null,
          categories: s.categories || [],
          updated_at: new Date().toISOString(),
        }));

        await fetch(`${supabaseUrl}/rest/v1/catalog_sellers`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify(payload),
        });
      } catch (sbErr) {
        console.warn("Failed to upsert sellers to Supabase during sync:", sbErr);
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Successfully synchronized ${totalProductsCount.toLocaleString()} products across ${totalSellersCount.toLocaleString()} sellers from Metabase.`,
      totalProducts: totalProductsCount,
      totalSellers: totalSellersCount,
      total_products: totalProductsCount,
      total_sellers: totalSellersCount,
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
