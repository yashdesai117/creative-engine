import allSellersRaw from "./data/sellers.json";

export interface MetabaseProduct {
  seller_id: string;
  seller_name: string;
  seller_website: string;
  website_product_link: string;
  product_id: string;
  product_name: string;
  product_description?: string;
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

const allSellersList: MetabaseSeller[] = allSellersRaw as MetabaseSeller[];

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  "";

let cachedProducts: MetabaseProduct[] | null = null;
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
      const descVal = getVal("product_description");

      return {
        seller_id: String(getVal("seller_id") || ""),
        seller_name: String(getVal("seller_name") || ""),
        seller_website: String(getVal("seller_website") || ""),
        website_product_link: String(getVal("website_product_link") || ""),
        product_id: String(getVal("product_id") || ""),
        product_name: String(getVal("product_name") || ""),
        product_description: descVal ? String(descVal).trim() : "",
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
    return products;
  } catch (err) {
    console.error("Error fetching Metabase catalog:", err);
    if (cachedProducts) return cachedProducts;
    return [];
  }
}

/**
 * Returns all active sellers from the catalog (16,899 sellers total),
 * optionally filtering by search query or limiting count.
 */
export async function getLiveSellers(
  query?: string,
  limit?: number
): Promise<MetabaseSeller[]> {
  // 1. Try querying Supabase catalog_sellers if credentials are configured
  if (supabaseUrl && supabaseKey) {
    try {
      let sbUrl = `${supabaseUrl}/rest/v1/catalog_sellers?select=seller_id,seller_name,seller_website,product_count,sample_image_url,categories&order=product_count.desc`;
      if (query && query.trim()) {
        const qEnc = encodeURIComponent(`%${query.trim()}%`);
        sbUrl += `&or=(seller_name.ilike.${qEnc},seller_id.ilike.${qEnc},seller_website.ilike.${qEnc})`;
      }
      if (limit) {
        sbUrl += `&limit=${limit}`;
      }
      const res = await fetch(sbUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item) => ({
            seller_id: item.seller_id,
            seller_name: item.seller_name,
            seller_website: item.seller_website || "",
            product_count: Number(item.product_count) || 0,
            sample_image: item.sample_image_url || "",
            categories: Array.isArray(item.categories) ? item.categories : [],
          }));
        }
      }
    } catch (sbErr) {
      console.warn("Supabase catalog_sellers query failed, using local catalog:", sbErr);
    }
  }

  // 2. Comprehensive catalog fallback (all 16,899 sellers pre-indexed from Metabase)
  let sellers = allSellersList;

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    sellers = sellers.filter(
      (s) =>
        s.seller_name.toLowerCase().includes(q) ||
        s.seller_id.toLowerCase().includes(q) ||
        (s.seller_website && s.seller_website.toLowerCase().includes(q))
    );
  }

  return limit ? sellers.slice(0, limit) : sellers;
}

/**
 * Returns products for a given seller.
 */
export async function getProductsBySeller(
  sellerId: string,
  limit = 50
): Promise<MetabaseProduct[]> {
  // 1. Check Supabase catalog_products if available
  if (supabaseUrl && supabaseKey) {
    try {
      const url = `${supabaseUrl}/rest/v1/catalog_products?seller_id=eq.${encodeURIComponent(
        sellerId
      )}&order=sp.desc&limit=${limit}`;
      const res = await fetch(url, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Supabase products fetch failed:", e);
    }
  }

  // 2. Check cached in-memory Metabase products
  const products = await fetchMetabaseCatalog();
  const matched = products.filter((p) => p.seller_id === sellerId);
  if (matched.length > 0) {
    return matched.slice(0, limit);
  }

  return [];
}

/**
 * Normalizes a URL for robust matching:
 * removes protocol, www, query parameters, hashes, and trailing slashes.
 */
function normalizeUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return urlStr.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("?")[0].split("#")[0].replace(/\/+$/, "");
  }
}

/**
 * Resolves a product by link or ID strictly from Metabase or Supabase.
 * Returns null if not found (never invents mock data).
 */
export async function findProduct(
  linkOrId: string,
  sellerId?: string
): Promise<MetabaseProduct | null> {
  const clean = linkOrId.trim();
  if (!clean) return null;

  const normalizedInput = normalizeUrl(clean);
  const cleanLower = clean.toLowerCase();

  // Extract path segments (e.g., from https://themantrust.com/catalogue/MxYNDqJn/5ZFw8u3A)
  const segments = clean
    .replace(/^https?:\/\/[^/]+/, "")
    .split("/")
    .map((s) => s.split("?")[0].split("#")[0].trim())
    .filter(Boolean);

  // 1. Try Supabase catalog_products first if credentials are configured
  if (supabaseUrl && supabaseKey) {
    try {
      const encoded = encodeURIComponent(clean);
      const orFilters = [
        `website_product_link.eq.${encoded}`,
        `product_id.eq.${encoded}`,
        `sku_id.eq.${encoded}`,
      ];

      // Add segment-based filters if any
      for (const seg of segments) {
        if (seg.length >= 4) {
          const encSeg = encodeURIComponent(seg);
          orFilters.push(`product_id.eq.${encSeg}`);
          orFilters.push(`sku_id.eq.${encSeg}`);
        }
      }

      let url = `${supabaseUrl}/rest/v1/catalog_products?or=(${orFilters.join(",")})&limit=1`;
      if (sellerId) {
        url += `&seller_id=eq.${encodeURIComponent(sellerId)}`;
      }

      const res = await fetch(url, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (res.ok) {
        const sbProds = await res.json();
        if (Array.isArray(sbProds) && sbProds.length > 0) {
          const row = sbProds[0];
          return {
            seller_id: row.seller_id,
            seller_name: row.seller_name || "",
            seller_website: row.seller_website || "",
            website_product_link: row.website_product_link || clean,
            product_id: row.product_id,
            product_name: row.product_name,
            product_description: row.product_description || "",
            sku_id: row.sku_id || "",
            size: row.size || null,
            sku_colour: row.sku_colour || null,
            cp: Number(row.cp) || 0,
            sp: Number(row.sp) || 0,
            mrp: Number(row.mrp) || Number(row.sp) || 0,
            discount_percent: Number(row.discount_percent) || 0,
            quantity: Number(row.quantity) || 0,
            lifetime_sales: Number(row.lifetime_sales) || 0,
            lifetime_orders: Number(row.lifetime_orders) || 0,
            is_oos: Boolean(row.is_oos),
            category: row.category || "General",
            sub_category: row.sub_category || "",
            product_type: row.product_type || "",
            image_link: row.image_link || "",
            catalogue_updated_at: row.catalogue_updated_at || undefined,
          };
        }
      }
    } catch (e) {
      console.warn("Supabase findProduct failed:", e);
    }
  }

  // 2. Search in-memory Metabase catalog
  const products = await fetchMetabaseCatalog();

  // (a) Exact link match
  const exact = products.find(
    (p) => p.website_product_link.trim().toLowerCase() === cleanLower
  );
  if (exact) return exact;

  // (b) Normalized link match
  const byNormLink = products.find(
    (p) => normalizeUrl(p.website_product_link) === normalizedInput
  );
  if (byNormLink) return byNormLink;

  // (c) Exact Product ID match
  const byPid = products.find(
    (p) => p.product_id.toLowerCase() === cleanLower
  );
  if (byPid) return byPid;

  // (d) Exact SKU ID match
  const bySku = products.find(
    (p) => p.sku_id.toLowerCase() === cleanLower
  );
  if (bySku) return bySku;

  // (e) Path segments match (e.g. MxYNDqJn or 5ZFw8u3A)
  // (e) Path segments match (e.g. MxYNDqJn or 5ZFw8u3A)
  for (const seg of segments) {
    if (seg.length >= 3) {
      const segLower = seg.toLowerCase();
      const bySeg = products.find(
        (p) =>
          (p.product_id && p.product_id.toLowerCase() === segLower) ||
          (p.sku_id && p.sku_id.toLowerCase() === segLower)
      );
      if (bySeg) return bySeg;
    }
  }

  // (f) Normalized link suffix or prefix match (only when non-empty and long enough)
  if (normalizedInput.length >= 8) {
    const bySubLink = products.find((p) => {
      if (!p.website_product_link || p.website_product_link.trim().length < 8) return false;
      const pNorm = normalizeUrl(p.website_product_link);
      if (pNorm.length < 8) return false;
      return pNorm === normalizedInput || pNorm.endsWith(normalizedInput) || normalizedInput.endsWith(pNorm);
    });
    if (bySubLink) return bySubLink;
  }

  // (g) Product ID in URL path boundary (e.g. /MxYNDqJn/ or =MxYNDqJn)
  const byPathPid = products.find((p) => {
    if (!p.product_id || p.product_id.length < 3) return false;
    const pidLower = p.product_id.toLowerCase();
    const regex = new RegExp(`[/=]${pidLower}(?:[/\\?#]|$)`, "i");
    return regex.test(cleanLower);
  });
  if (byPathPid) return byPathPid;

  // (h) Seller-scoped match if sellerId is provided
  if (sellerId) {
    const sellerProds = products.filter((p) => p.seller_id === sellerId);
    if (sellerProds.length > 0) {
      // Check if product_name matches query
      const byName = sellerProds.find((p) =>
        cleanLower.length >= 6 && p.product_name.toLowerCase().includes(cleanLower)
      );
      if (byName) return byName;
    }
  }

  // Strict: do NOT fabricate mock products.
  return null;
}

