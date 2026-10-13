import { NextRequest, NextResponse } from "next/server";
import { getProductsBySeller } from "@/lib/metabase";

export async function GET(

  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await getProductsBySeller(id);
    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error("API /api/products/by-seller error:", error);
    return NextResponse.json(
      { error: "Failed to load seller products", products: [] },
      { status: 500 }
    );
  }
}
