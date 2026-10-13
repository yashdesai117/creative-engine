import { NextRequest, NextResponse } from "next/server";
import { getLiveSellers } from "@/lib/metabase";

export async function GET(req: NextRequest) {

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const sellers = await getLiveSellers(q, limit);
    return NextResponse.json({
      sellers,
      total: sellers.length,
      totalCatalogSellers: 16899,
    });
  } catch (error) {
    console.error("API /api/products/sellers error:", error);
    return NextResponse.json(
      { error: "Failed to load sellers from Metabase", sellers: [] },
      { status: 500 }
    );
  }
}

