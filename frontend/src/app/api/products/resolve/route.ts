import { NextRequest, NextResponse } from "next/server";
import { findProduct } from "@/lib/metabase";


import { scrapeProductPage } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sellerId = (body.sellerId || body.seller_id || "").trim();
    const productLink = (body.productLink || body.product_link || "").trim();
    const format = body.format || "video";

    if (!productLink) {
      return NextResponse.json(
        { error: "productLink is required" },
        { status: 400 }
      );
    }

    let matched = await findProduct(productLink, sellerId);

    // If not matched via Metabase catalog, try live page scrape directly
    if (!matched && (productLink.startsWith("http://") || productLink.startsWith("https://"))) {
      try {
        const scraped = await scrapeProductPage(productLink);
        if (scraped && scraped.title) {
          return NextResponse.json({
            seller_id: sellerId || `SD-${(scraped.seller_name || "STORE").toUpperCase()}`,
            seller_name: scraped.seller_name || "ShopDeck Store",
            product_id: `PROD-${Date.now().toString().slice(-6)}`,
            sku_id: `SKU-${Date.now().toString().slice(-4)}`,
            title: scraped.title,
            description: scraped.description,
            category: scraped.category,
            sub_category: "Direct Response E-Commerce",
            sp: scraped.sp,
            mrp: scraped.mrp,
            cp: Math.round(scraped.sp * 0.4),
            discount_percent: scraped.discount_percent,
            images: scraped.images,
            variant: null,
            is_in_stock: scraped.is_in_stock,
            is_published: true,
            field_sources: {
              title: "fallback",
              sp: "fallback",
              mrp: "fallback",
              category: "fallback",
              images: "fallback",
            },
            fetched_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Direct page scrape failed in route:", e);
      }
    }

    if (matched) {
      const desc =
        matched.product_description?.trim() ||
        `${matched.category}${matched.sub_category ? ` — ${matched.sub_category}` : ""}. SKU: ${matched.sku_id}`;

      const imagesList =
        matched.all_images && matched.all_images.length > 0
          ? matched.all_images.map((u, i) => ({ url: u, alt: matched.product_name, isReference: i === 0 }))
          : matched.image_link
          ? [{ url: matched.image_link, alt: matched.product_name, isReference: true }]
          : [];

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
        images: imagesList,
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
      {
        error:
          "Could not fetch product details from this link. Please check that the URL is an active, publicly accessible product page.",
      },
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
