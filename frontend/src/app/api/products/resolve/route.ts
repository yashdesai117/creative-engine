import { NextRequest, NextResponse } from "next/server";
import { findProduct } from "@/lib/metabase";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sellerId, productLink, format } = body;

    if (!productLink) {
      return NextResponse.json(
        { error: "productLink is required" },
        { status: 400 }
      );
    }

    const matched = await findProduct(productLink, sellerId);

    if (matched) {
      const desc =
        matched.product_description?.trim() ||
        `${matched.category}${matched.sub_category ? ` — ${matched.sub_category}` : ""}. SKU: ${matched.sku_id}`;

      const product = {
        seller_id: matched.seller_id,
        seller_name: matched.seller_name,
        product_id: matched.product_id,
        sku_id: matched.sku_id,
        title: matched.product_name,
        description: desc,
        category: matched.category,
        sub_category: matched.sub_category,
        sp: matched.sp,
        mrp: matched.mrp,
        cp: matched.cp,
        discount_percent: matched.discount_percent,
        images: matched.image_link
          ? [{ url: matched.image_link, alt: matched.product_name, isReference: true }]
          : [],
        variant: matched.size || matched.sku_colour || null,
        is_in_stock: !matched.is_oos,
        is_published: true,
        field_sources: {
          title: "database",
          sp: "database",
          mrp: "database",
          category: "database",
          images: "database",
        },
        fetched_at: new Date().toISOString(),
      };

      return NextResponse.json(product);
    }

    return NextResponse.json(
      { error: `Product not found for link: ${productLink}` },
      { status: 404 }
    );
  } catch (error) {
    console.error("API /api/products/resolve error:", error);
    return NextResponse.json(
      { error: "Failed to resolve product" },
      { status: 500 }
    );
  }
}
