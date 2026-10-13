-- ============================================================================
-- Creative Engine v2 — Supabase Migration: Metabase Live Catalog & Daily Sync
-- Stores thousands of ShopDeck sellers and products fetched from Metabase
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CATALOG SELLERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_sellers (
    seller_id TEXT PRIMARY KEY,
    seller_name TEXT NOT NULL,
    seller_website TEXT,
    product_count INTEGER NOT NULL DEFAULT 0,
    categories TEXT[] NOT NULL DEFAULT '{}'::text[],
    sample_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for seller search by name or website
CREATE INDEX IF NOT EXISTS idx_catalog_sellers_name ON catalog_sellers (seller_name);
CREATE INDEX IF NOT EXISTS idx_catalog_sellers_website ON catalog_sellers (seller_website);
CREATE INDEX IF NOT EXISTS idx_catalog_sellers_product_count ON catalog_sellers (product_count DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CATALOG PRODUCTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id TEXT NOT NULL REFERENCES catalog_sellers(seller_id) ON DELETE CASCADE,
    seller_name TEXT,
    seller_website TEXT,
    website_product_link TEXT NOT NULL,
    product_id TEXT NOT NULL,
    sku_id TEXT NOT NULL DEFAULT '',
    product_name TEXT NOT NULL,
    size TEXT,
    sku_colour TEXT,
    cp NUMERIC(12, 2) DEFAULT 0.00,
    sp NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    margin_percent NUMERIC(5, 2) DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 0,
    lifetime_sales NUMERIC(14, 2) DEFAULT 0.00,
    lifetime_orders INTEGER NOT NULL DEFAULT 0,
    lifetime_delivered_orders INTEGER NOT NULL DEFAULT 0,
    is_oos BOOLEAN NOT NULL DEFAULT false,
    category TEXT,
    sub_category TEXT,
    product_type TEXT,
    image_link TEXT,
    catalogue_updated_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint for idempotent upserting from Metabase
    CONSTRAINT uq_catalog_product_sku UNIQUE (seller_id, product_id, sku_id)
);

-- High-performance query indexes
CREATE INDEX IF NOT EXISTS idx_catalog_products_seller_id ON catalog_products (seller_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_product_id ON catalog_products (product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_link ON catalog_products (website_product_link);
CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products (category);
CREATE INDEX IF NOT EXISTS idx_catalog_products_in_stock ON catalog_products (is_oos) WHERE is_oos = false;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. METABASE SYNC LOGS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metabase_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    total_rows_processed INTEGER NOT NULL DEFAULT 0,
    total_sellers_synced INTEGER NOT NULL DEFAULT 0,
    error_message TEXT
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. AGGREGATE FUNCTION: REFRESH SELLER COUNTS & CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_catalog_seller_aggregates()
RETURNS VOID AS $$
BEGIN
    UPDATE catalog_sellers s
    SET 
        product_count = sub.cnt,
        categories = sub.cats,
        sample_image_url = COALESCE(sub.sample_img, s.sample_image_url),
        updated_at = NOW()
    FROM (
        SELECT 
            seller_id,
            COUNT(*)::INTEGER AS cnt,
            ARRAY_AGG(DISTINCT category) FILTER (WHERE category IS NOT NULL AND category != '') AS cats,
            MAX(image_link) FILTER (WHERE image_link IS NOT NULL AND image_link != '') AS sample_img
        FROM catalog_products
        GROUP BY seller_id
    ) sub
    WHERE s.seller_id = sub.seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE catalog_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE metabase_sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users & service role
CREATE POLICY catalog_sellers_read_policy ON catalog_sellers
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY catalog_products_read_policy ON catalog_products
    FOR SELECT TO authenticated, anon USING (true);

-- Allow service role full write access (for sync jobs)
CREATE POLICY catalog_sellers_service_all ON catalog_sellers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY catalog_products_service_all ON catalog_products
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY metabase_sync_logs_service_all ON metabase_sync_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- ─────────────────────────────────────────────────────────────────────────────
-- 6. DAILY CRON AT 10:00 AM IST (04:30 AM UTC)
-- ─────────────────────────────────────────────────────────────────────────────
-- India Standard Time (IST) is UTC+5:30.
-- Therefore 10:00 AM IST corresponds to 04:30 AM UTC.
-- Cron format: 30 4 * * * (minute 30, hour 4 every day)

-- Safely unschedule only if the job already exists (prevents XX000: could not find valid entry):
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-metabase-catalog-daily-10am') THEN
        PERFORM cron.unschedule('sync-metabase-catalog-daily-10am');
    END IF;
END $$;

-- Schedule daily sync job
SELECT cron.schedule(
    'sync-metabase-catalog-daily-10am',
    '30 4 * * *',
    $$
    SELECT net.http_post(
        url := 'https://<your-project-domain>/api/sync/metabase',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_INTERNAL_SYNC_SECRET'
        ),
        body := '{}'::jsonb
    );
    $$
);

