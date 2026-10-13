/**
 * Metabase Live Catalog Integration
 * Public Question: https://metabase.kaip.in/public/question/9ba58a6c-92b1-436d-840f-fbb724c3ef24
 */

export interface MetabaseProduct {
  seller_id: string;
  seller_name: string;
  seller_website: string;
  website_product_link: string;
  product_id: string;
  product_name: string;
  sku_id: string;
  size?: string | null;
  sku_colour?: string | null;
  cp: number;
  sp: number;
  mrp: number;
  discount_percent: number;
  quantity: number;
  lifetime_sales: number;
  lifetime_orders: number;
  is_oos: boolean;
  category: string;
  sub_category?: string;
  product_type?: string;
  image_link: string;
  catalogue_updated_at?: string;
}

export interface MetabaseSeller {
  seller_id: string;
  seller_name: string;
  seller_website: string;
  product_count: number;
  sample_image?: string;
  categories: string[];
}

const METABASE_QUERY_URL =
  "https://metabase.kaip.in/api/public/card/9ba58a6c-92b1-436d-840f-fbb724c3ef24/query";

let cachedProducts: MetabaseProduct[] | null = null;
let cachedSellers: MetabaseSeller[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function fetchMetabaseCatalog(forceRefresh = false): Promise<MetabaseProduct[]> {
  const now = Date.now();
  if (!forceRefresh && cachedProducts && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedProducts;
  }

  try {
    const res = await fetch(METABASE_QUERY_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Next.js ISR / cache tag
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      throw new Error(`Metabase request failed with status ${res.status}`);
    }

    const json = await res.json();
    const cols: string[] = json?.data?.cols?.map((c: { name: string }) => c.name) || [];
    const rows: unknown[][] = json?.data?.rows || [];

    const products: MetabaseProduct[] = rows.map((row) => {
      const getVal = (col: string): unknown => {
        const idx = cols.indexOf(col);
        return idx !== -1 ? row[idx] : undefined;
      };

      const sp = Number(getVal("sp") || 0);
      const mrp = Number(getVal("mrp") || sp);
      const cp = Number(getVal("cp") || 0);
      const discount_percent =
        mrp > sp && mrp > 0 ? Math.round(((mrp - sp) / mrp) * 1000) / 10 : 0;

      return {
        seller_id: String(getVal("seller_id") || ""),
        seller_name: String(getVal("seller_name") || ""),
        seller_website: String(getVal("seller_website") || ""),
        website_product_link: String(getVal("website_product_link") || ""),
        product_id: String(getVal("product_id") || ""),
        product_name: String(getVal("product_name") || ""),
        sku_id: String(getVal("sku_id") || ""),
        size: (getVal("size") as string) || null,
        sku_colour: (getVal("sku_colour") as string) || null,
        cp,
        sp,
        mrp,
        discount_percent,
        quantity: Number(getVal("quantity") || 0),
        lifetime_sales: Number(getVal("lifetime_sales") || 0),
        lifetime_orders: Number(getVal("lifetime_orders") || 0),
        is_oos: Boolean(getVal("is_oos")),
        category: String(getVal("category") || "General"),
        sub_category: String(getVal("sub_category") || ""),
        product_type: String(getVal("product_type") || ""),
        image_link: String(getVal("image_link") || ""),
        catalogue_updated_at: (getVal("catalogue_updated_at") as string) || undefined,
      };
    });

    cachedProducts = products;
    lastFetchTime = now;

    // Index sellers
    const sellerMap = new Map<string, MetabaseSeller>();
    for (const p of products) {
      if (!p.seller_id) continue;
      if (!sellerMap.has(p.seller_id)) {
        sellerMap.set(p.seller_id, {
          seller_id: p.seller_id,
          seller_name: p.seller_name || "ShopDeck Seller",
          seller_website: p.seller_website,
          product_count: 0,
          sample_image: p.image_link,
          categories: [],
        });
      }
      const s = sellerMap.get(p.seller_id)!;
      s.product_count += 1;
      if (p.category && !s.categories.includes(p.category)) {
        s.categories.push(p.category);
      }
    }

    cachedSellers = Array.from(sellerMap.values()).sort(
      (a, b) => b.product_count - a.product_count
    );

    return products;
  } catch (err) {
    console.error("Error fetching Metabase catalog:", err);
    if (cachedProducts) return cachedProducts;
    throw err;
  }
}

export async function getLiveSellers(forceRefresh = false): Promise<MetabaseSeller[]> {
  await fetchMetabaseCatalog(forceRefresh);
  return cachedSellers || [];
}

export async function getProductsBySeller(sellerId: string): Promise<MetabaseProduct[]> {
  const products = await fetchMetabaseCatalog();
  return products.filter((p) => p.seller_id === sellerId);
}

export async function findProduct(
  linkOrId: string,
  sellerId?: string
): Promise<MetabaseProduct | null> {
  const products = await fetchMetabaseCatalog();
  const clean = linkOrId.trim().toLowerCase();

  // 1. Exact match on website_product_link
  const exact = products.find(
    (p) => p.website_product_link.trim().toLowerCase() === clean
  );
  if (exact) return exact;

  // 2. Match by URL path
  try {
    const parsed = new URL(linkOrId);
    const path = parsed.pathname.toLowerCase();
    const byPath = products.find((p) => {
      try {
        const pPath = new URL(p.website_product_link).pathname.toLowerCase();
        return pPath === path;
      } catch {
        return false;
      }
    });
    if (byPath) return byPath;
  } catch {
    // not a full url
  }

  // 3. Match by product_id
  const byPid = products.find((p) => clean.includes(p.product_id.toLowerCase()));
  if (byPid) return byPid;

  // 4. Seller fallback
  if (sellerId) {
    const sellerProds = products.filter((p) => p.seller_id === sellerId);
    if (sellerProds.length > 0) return sellerProds[0];
  }

  return null;
}
