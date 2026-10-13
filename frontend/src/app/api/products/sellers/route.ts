import { NextResponse } from "next/server";
import { getLiveSellers } from "@/lib/metabase";


export async function GET() {
  try {
    const sellers = await getLiveSellers();
    return NextResponse.json({ sellers, total: sellers.length });
  } catch (error) {
    console.error("API /api/products/sellers error:", error);
    return NextResponse.json(
      { error: "Failed to load sellers from Metabase", sellers: [] },
      { status: 500 }
    );
  }
}
