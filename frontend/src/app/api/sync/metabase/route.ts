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
    const products = await fetchMetabaseCatalog(true);
    const sellers = await getLiveSellers(false);

    return NextResponse.json({
      status: "success",
      message: `Successfully synchronized ${products.length} products across ${sellers.length} sellers from Metabase.`,
      totalProducts: products.length,
      totalSellers: sellers.length,
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
