-- Creative Engine v2 — Supabase PostgreSQL Initial Migration
-- PRD Section 11 Data Model with Row-Level Security (RLS) & Multi-tenancy (team_id)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCT SNAPSHOTS
CREATE TABLE IF NOT EXISTS product_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id TEXT NOT NULL,
    product_link TEXT NOT NULL,
    normalised_link TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    sp NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    field_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_payload JSONB,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 3. PRODUCT COSTS (Strictly restricted — Admin only)
CREATE TABLE IF NOT EXISTS product_costs (
    snapshot_id UUID PRIMARY KEY REFERENCES product_snapshots(id) ON DELETE CASCADE,
    cp NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 4. PRODUCT OVERRIDES
CREATE TABLE IF NOT EXISTS product_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES product_snapshots(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    value JSONB NOT NULL,
    edited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 5. PROMPT COMPONENTS
CREATE TABLE IF NOT EXISTS prompt_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('compiler', 'family', 'category_pack')),
    key TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    UNIQUE(type, key, version)
);

-- 6. TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('banner', 'video')),
    family TEXT NOT NULL,
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    aspect_ratios JSONB NOT NULL DEFAULT '[]'::jsonb,
    spec JSONB NOT NULL,
    thumbnail_url TEXT,
    reference_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    certification_status TEXT NOT NULL DEFAULT 'certified' CHECK (certification_status IN ('certified', 'pending', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 7. TEMPLATE CERTIFICATIONS
CREATE TABLE IF NOT EXISTS template_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    test_snapshot_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    reviewer UUID REFERENCES auth.users(id),
    verdict TEXT NOT NULL CHECK (verdict IN ('approved', 'rejected')),
    notes TEXT,
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 8. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    seller_id TEXT NOT NULL,
    snapshot_id UUID REFERENCES product_snapshots(id) ON DELETE SET NULL,
    format TEXT NOT NULL CHECK (format IN ('banner', 'video')),
    status TEXT NOT NULL DEFAULT 'input' CHECK (status IN ('input', 'confirming', 'templates', 'generating', 'reviewing', 'approved')),
    selected_template_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 9. SESSION TEMPLATES
CREATE TABLE IF NOT EXISTS session_templates (
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    PRIMARY KEY (session_id, template_id)
);

-- 10. OPTIONS
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES templates(id),
    problem TEXT NOT NULL,
    angle TEXT NOT NULL,
    offer TEXT NOT NULL,
    hook_line TEXT NOT NULL,
    summary TEXT NOT NULL,
    rationale TEXT NOT NULL,
    claims_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INT,
    status TEXT NOT NULL DEFAULT 'reviewing' CHECK (status IN ('reviewing', 'selected', 'locked', 'discarded', 'pending')),
    component_versions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 11. CONCEPTS
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_code TEXT NOT NULL UNIQUE,
    option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    ad_name TEXT NOT NULL,
    final_prompt TEXT,
    prompt_version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'launched')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ad_id TEXT,
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 12. AD LINKS
CREATE TABLE IF NOT EXISTS ad_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    ad_id TEXT NOT NULL,
    linked_by UUID REFERENCES auth.users(id),
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 13. AI RUNS
CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    step INT NOT NULL,
    model TEXT NOT NULL,
    component_versions JSONB NOT NULL DEFAULT '{}'::jsonb,
    tokens_in INT NOT NULL DEFAULT 0,
    tokens_out INT NOT NULL DEFAULT 0,
    cost_usd NUMERIC(8, 4) NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 14. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id UUID REFERENCES options(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- 15. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);

-- ─── ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user team_id
CREATE OR REPLACE FUNCTION current_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users can read team profiles, update their own
CREATE POLICY profiles_team_read ON profiles
  FOR SELECT USING (team_id = current_user_team_id());

-- Product snapshots: readable and writable by team members
CREATE POLICY product_snapshots_team_all ON product_snapshots
  FOR ALL USING (team_id = current_user_team_id());

-- PRODUCT COSTS: Admin ONLY policy — non-admin roles can NEVER read cost price
CREATE POLICY product_costs_admin_only ON product_costs
  FOR ALL USING (is_admin() AND team_id = current_user_team_id());

-- Sessions, options, concepts, templates: team access
CREATE POLICY sessions_team_all ON sessions
  FOR ALL USING (team_id = current_user_team_id());

CREATE POLICY options_team_all ON options
  FOR ALL USING (team_id = current_user_team_id());

CREATE POLICY concepts_team_all ON concepts
  FOR ALL USING (team_id = current_user_team_id());

CREATE POLICY templates_team_read ON templates
  FOR SELECT USING (true);

CREATE POLICY templates_admin_write ON templates
  FOR ALL USING (is_admin());
