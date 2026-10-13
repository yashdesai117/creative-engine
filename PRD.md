Creative Engine: Product Requirements Document (v0.2)
Owner: Yash, Growth, ShopDeck | Version 0.2 draft | 13 Oct 2026
Scope note: UI and visual design are intentionally excluded from this document and will be specified separately. This PRD covers product behaviour, data, AI, and technical architecture.
1. Summary
Creative Engine is an internal tool that turns a ShopDeck seller's product into a set of strategically distinct, ready-to-use creative prompts for Meta ads. A user provides a Seller ID, a product link and a format (banner or video). The system fetches the product details from the link, the user chooses one or more format templates, AI generates Problem + Angle + Offer options and a summary of each option, the user selects and approves, and the system outputs a detailed prompt for each approved option.
v0 ends at the prompt. The user pastes it into the image or video model (Nano Banana or Grok today). Generating the creative inside the tool is a later milestone. The product is built as a real application from day one: React frontend, a dedicated backend, and Supabase as the database, so it can move from the Growth team to the wider department without a rewrite.
2. Problem
• Creatives are produced today by feeding basic templates to AI. Output is fast but strategically thin: the problem, angle and offer behind each ad are rarely explicit or recorded.
• Under Meta's Andromeda-era delivery, ads that share the same template and visual structure tend to be treated as near-duplicates. More ads does not mean more reach; more genuinely different concepts does.
• Offers are chosen without reference to seller margin, so a creative can promise a discount the seller cannot afford.
• AI-generated visuals can misrepresent the product, which drives disappointment and returns.
• Nothing links a creative decision to its ad performance, so the team cannot learn which problem, angle or offer works for which category.
• Writing and perfecting a separate prompt for every template does not scale and produces uneven quality.
3. Goals and non-goals
Goals
• G1. Take a user from product link to approved prompts in under 5 minutes.
• G2. Make problem, angle and offer explicit, selectable and recorded for every creative.
• G3. Keep offers inside seller economics using SP, CP and MRP.
• G4. Preserve product fidelity by always anchoring prompts to the seller's real product image.
• G5. Scale to many templates without hand-writing a prompt per template (see section 8).
• G6. Record every approved concept with a unique ID so it can be joined to ad performance later (UTM already carries utm_content = ad ID).
Non-goals (v0)
• UI and visual design (specified separately).
• Launching ads or any Meta API integration.
• Generating the image or video inside the tool.
• Performance dashboards or RTO analytics.
• Seller-facing access.
3.1 Success metrics
Metric
Target (baseline set in pilot)
Time from product link to approved prompts
under 5 minutes median
Sessions ending with at least one approved concept
80% or more
Product fetch success from a valid link
95% or more
Options edited by the user before approval
tracked as a quality signal; lower over time is better
Distinct problems and angles within an approved set
at least 3 distinct of each in a set of 6 or more
Template certification pass rate
tracked per template and family
Pilot: CTR, CPM, C2PR per concept vs template-only control
directional improvement
Pilot: delivered profit per ad via utm_content join
tracked per concept
4. Users and roles
• Primary: Growth team members who plan and brief creatives.
• Secondary (later): account managers, GMs and other departments.
• Roles: Admin (manages templates, sees cost price and margin, manages users), Editor (runs sessions, approves concepts), Viewer (read-only on sessions and concepts).
5. End-to-end flow
Step
What happens
Who
1. Inputs
Seller ID, product link, Banner or Video
User
2. Fetch
System resolves the link and fetches image, title and description, category, SP, CP, MRP, discount
System
3. Confirm
User confirms the product and can correct fetched fields and choose reference images
User
4. Template selection
Templates filtered by format and category; user selects one or more (T1 to Tn)
User
5. AI step 1
Generates Problem + Angle + Offer candidates
AI
6. AI step 2
Writes a summary of each option as it would appear in the chosen template
AI
7. Selection
User reviews, edits, selects and approves options
User
8. AI step 3
Produces a detailed prompt for each approved option
AI
9. Output
Prompt, reference image and concept record available to copy, download and export
System
6. Functional requirements
Priority: P0 = needed for the pilot, P1 = soon after, P2 = later.
6.1 Inputs and product fetch
• FR-1 (P0) Accept Seller ID, product link and format (banner or video). Validate formats before any backend call.
• FR-2 (P0) Normalise the link: strip tracking parameters, resolve short links and redirects, and extract the product identifier and variant if present.
• FR-3 (P0) Look up the product in ShopDeck's own data using the product identifier. The database is the source of truth for SP, CP, MRP, description, category and images.
• FR-4 (P1) Fallback: if the database lookup fails, read public fields (title, description, images, SP, MRP) from the page. CP is never obtained this way. Mark every field with its source.
• FR-5 (P0) Verify that the product belongs to the given Seller ID. Reject mismatches with a clear message.
• FR-6 (P0) Handle variants (the variant selects price and image), out-of-stock and unpublished products (blocked from creative generation with an explanation), and products with multiple images.
• FR-7 (P0) Fetched fields are editable. Any override is flagged and stored separately from the fetched snapshot. Missing required fields block continuing, with an explanation.
• FR-8 (P0) The user chooses which image or images serve as the reference. At least one is required.
• FR-9 (P0) Computed fields: discount % and margin %. Margin and CP are visible only to permitted roles.
• FR-10 (P0) Clear error states: link not recognised, product not found, seller not found, timeout. Each allows retry.
• FR-11 (P2) Batch mode: several product links in one session.
6.2 Template selection
• FR-12 (P0) Offer only templates that match the chosen format and the product's category.
• FR-13 (P0) The user can select one or more templates.
• FR-14 (P1) Suggest for me: AI recommends the top 3 templates for the product and category.
• FR-15 (P1) Options can be assigned to different templates, so a set of concepts does not share one visual structure by default. The system flags when every selected option uses the same template.
6.3 Option generation
• FR-16 (P0) AI step 1 generates N candidates per selected template (default 6, configurable 3 to 10), each made of Problem, Angle and Offer, grounded in the product data, category and template constraints. For categories driven by desire or identity (jewellery, fashion, gifting) the Problem field may be framed as a desire or motivation.
• FR-17 (P0) AI step 2 produces for each candidate a summary: hook line, how it would look in the chosen template, why it should resonate, the offer line, and any claim it relies on.
• FR-18 (P0) Results are delivered progressively so the user can start reviewing before the full set finishes.
• FR-19 (P0) The user can edit any field of an option, regenerate a single option, lock it or discard it.
• FR-20 (P1) Generate more, with an optional free-text steer.
• FR-21 (P1) Diversity check: flags when selected options share a template, problem or angle, and suggests how to spread them.
• FR-22 (P0) Every offer obeys the guardrails in section 9.
• FR-23 (P2) Optional occasion input (festive, gifting, wedding season) that AI can use in its options.
6.4 Selection and approval
• FR-24 (P0) The user selects options and approves them as a set.
• FR-25 (P0) Approval creates a concept record with a unique concept code and a suggested ad name that encodes seller, concept code, problem, angle, offer, template and format.
6.5 Prompt output
• FR-26 (P0) AI step 3 composes the detailed prompt from the layers in section 8 plus the approved option and product data.
• FR-27 (P0) Fixed rules are injected by the system, not left to the model: use the attached product image exactly and do not redraw or alter the product; never include cost price; keep text within safe zones and legible; honour the aspect ratio; show only a price and offer that match the product page.
• FR-28 (P0) The prompt is editable, with edits versioned. The user can copy the prompt and the ad name, and download the reference image.
• FR-29 (P1) Export all concepts of a session to CSV or Google Sheets.
• FR-30 (P2) Video templates output a scene-by-scene script plus a prompt per scene.
• FR-31 (P2) Generate step that calls the image or video model and stores the result against the concept.
6.6 History and library
• FR-32 (P0) Sessions can be listed, reopened and duplicated, and filtered by seller, user, date and status.
• FR-33 (P0) Concepts have a status: draft, approved, launched.
• FR-34 (P1) An ad ID can be attached to a concept, manually or by CSV import from Ads Manager, so concepts join to UTM data.
6.7 Template management
• FR-35 (P0) Templates, families, category packs and prompt components are stored as versioned data (v0 can seed them from files in the repository).
• FR-36 (P1) Admin interface to create, edit, version, certify, publish and unpublish templates.
• FR-37 (P1) Draft a template spec from an uploaded example creative using a vision model, for human review.
6.8 Access and audit
• FR-38 (P0) Sign-in through Supabase Auth with Google, restricted to the company domain.
• FR-39 (P0) Role-based access as in section 4. Cost price never reaches the browser for roles without access.
• FR-40 (P1) Audit log of fetches, approvals, exports and role changes.
7. Product data requirements
Field
Source
Notes
Product link
User input
Normalised and stored with the extracted product and variant identifiers
Image(s)
ShopDeck data
User picks reference image(s); copies cached in storage
Title, description
ShopDeck data
Editable
Category
ShopDeck data
Drives template filtering and category pack
SP, MRP, discount
ShopDeck data
Discount computed from MRP and SP
CP
ShopDeck data
Role-restricted; used only for guardrails
8. Template system
Templates are data, not hand-written prompts. Writing and perfecting one prompt per template does not scale and produces uneven quality.
Prompt layers
Layer
What it is
How many
Prompt compiler
Shared rules: product fidelity, no cost price, safe zones, text legibility, aspect ratio, price and offer accuracy, banned claims
1, perfected once
Family prompt
Base logic for a type of creative (product hero, lifestyle, UGC style, problem-solution, offer-led, testimonial, comparison, gifting)
about 8 to 12
Template spec
A filled-in specification of one template
one per template
Category pack
Scene props, emphasis, human presence and allowed claims for a category
one per category
Concept slots
Problem, angle, offer, hook, generated per concept
live
Final prompt = compiler + family + template spec + category pack + concept slots + product data.
Template spec fields: family; format; aspect ratios; layout zones; visual world (scene, lighting, props, background); human presence; text slots with character limits and a flag for model-generated or overlaid afterwards; required inputs; do and do-not rules; one or more reference images; for video, hook shot, scene beats and pacing.
Quality control
• Reference images are used to steer layout, since they usually steer an image model better than description. This is validated in the first experiment with Nano Banana and Grok.
• Each template is certified by running it on about 3 reference products from different categories; a human approves the outputs.
• A template that fails certification can carry an optional custom-instructions field.
• Edit and rejection rates per template are logged, and later joined to ad performance to retire weak templates and promote strong ones.
Volume: start with about 10 families and 2 to 3 genuinely different templates each (around 25). Create variety through parameters (scene, colour behaviour, human presence, background) rather than near-duplicate templates, since near-identical visuals tend to be grouped together in Meta delivery.
9. Offer and claim guardrails
• Discount % = (MRP minus SP) divided by MRP.
• Gross margin % = (SP minus CP) divided by SP. This ignores shipping, payment and return costs, so a configurable margin floor (default set with finance) is the safety line, not break-even.
• Offers the AI may propose are limited to configured types: percentage off, bundle, free shipping, prepaid incentive, limited-time. Any offer that would push margin below the floor is rejected by the backend, not only discouraged in the prompt.
• The AI receives margin band and discount headroom, never raw CP. Raw CP is never sent to an external model and never appears in a generated prompt.
• Claims (for example material, plating, anti-tarnish, authenticity) must come from an approved list per category or from the product data. Unapproved claims are blocked or flagged.
• The price and offer shown in a creative must match the live product page. Offers should correspond to something the seller can actually run; the source of offers is an open question (section 16).
10. AI design
Step
Input
Output
1. Concept candidates
Product data (without CP), category, template metadata, guardrail headroom
List of Problem, Angle, Offer candidates as structured data
2. Option summaries
Each candidate plus template structure
Hook, how it looks in this template, rationale, claims used
3. Detailed prompt
Approved option, product data, layered prompt components, fixed rules
Final prompt text ready for the image or video model
Requirements:
• All outputs are schema-validated structured responses, with retries and a clear failure state.
• Prompt components for every layer are versioned in the database, and each AI run records the versions used.
• The LLM provider sits behind an abstraction so models can be swapped or compared.
• Every run logs model, tokens, cost and latency.
• A golden set of about 20 products across categories is used to compare prompt versions before they are promoted.
• Thumbs up or down on each option feeds an evaluation view.
• Options within a set must be materially different from each other; the step 1 instructions enforce this.
11. Data model (Supabase Postgres)
All tables carry team_id from day one so department rollout needs no migration.
Table
Purpose and key fields
profiles
user id, email, role, team_id
product_snapshots
seller_id, product_link, normalised link, product and variant identifiers, title, description, image URLs, category, sp, mrp, field sources, fetched_at, raw payload
product_costs
snapshot id, cp. Separate table with strict row-level security
product_overrides
snapshot id, field, value, edited_by
prompt_components
type (compiler, family, category pack), key, content, version, status
templates
slug, name, format, family, categories, aspect_ratios, spec, reference image paths, version, status
template_certifications
template id, test snapshot ids, reviewer, verdict, date
sessions
user id, seller_id, snapshot id, format, status, timestamps
session_templates
session id, template id
options
session id, template id, problem, angle, offer, hook, summary, status, component versions, edited flag
concepts
concept code, option id, approved by and at, final prompt, prompt version, ad name, status
ad_links
concept id, ad_id, linked by and at
ai_runs
session id, step, model, component versions, tokens in and out, cost, latency, status, error
feedback
option or concept id, user id, rating, note
audit_log
actor, action, entity, timestamp
Storage buckets: template reference images, cached product images, exports. Row-level security restricts rows to the owner or team; cost data is restricted to Admin.
12. Technical architecture
Frontend: React (Next.js with TypeScript). Interface design and component choices follow the separate UI specification.
Backend
• FastAPI (Python) with Pydantic v2 as a separate service. LLM orchestration, retries, secrets, cost-price handling and later image, video and embedding work belong server-side, and Python is the stronger ecosystem for them. The browser never holds model keys or cost price.
• Service layers: ProductResolver (link parsing and lookup), DataAdapter, TemplateService, PromptComposer, LLMService (provider-agnostic), GuardrailService, ConceptService, ExportService.
• Long generations run as jobs recorded in the database, with progress streamed to the client. Start with FastAPI background tasks and a jobs table; move to a queue only when volume demands it.
• The backend verifies the Supabase JWT on every request and applies role checks.
Supabase: Postgres, Auth (Google SSO), Storage, Row-Level Security, Realtime. Schema managed with migrations through the Supabase CLI.
Infrastructure: web on Vercel; backend on Railway, Render or Fly (or ShopDeck's own cloud). Separate dev, staging and production. GitHub Actions for CI. Sentry for errors and PostHog for product analytics.
Core endpoints (indicative)
• POST /products/resolve (link, seller id)
• POST /sessions, GET /sessions/{id}
• GET /templates?format=&category=
• POST /sessions/{id}/options (streamed)
• PATCH /options/{id}, POST /options/{id}/regenerate
• POST /sessions/{id}/approve
• POST /concepts/{id}/prompt, PATCH /concepts/{id}
• POST /concepts/{id}/ad-link, GET /exports/{session_id}
Data adapter: the only piece that depends on ShopDeck systems. It exposes a lookup by seller and product identifier returning image, title, description, category, SP, CP and MRP. It sits behind an interface so the source (internal API, database or Metabase) can change without touching the rest.
13. Non-functional requirements
• Performance: product fetch under 3 seconds typical; first option available within 8 seconds of starting generation; full set within 30 seconds.
• Reliability: failed AI steps retry automatically and surface a clear manual retry; no lost work on refresh.
• Security: SSO only, role-based access, row-level security, secrets server-side only, cost price never in the browser or in external model calls, audit log.
• Privacy: no seller personal data sent to the model.
• Observability: error tracking, structured logs, per-run AI cost, product analytics events for each step.
14. Measurement and learning loop
• Each approved concept has a concept code and an ad name that encodes its attributes.
• After launch, the ad ID is attached (FR-34). Orders already carry utm_content = ad ID, so ad-level orders, RTO and delivered profit can be joined to the concept's template, problem, angle and offer.
• Learning is read at concept level and pooled across sellers by category, since individual seller spend is too small for reliable per-ad conclusions.
• RTO matures weeks after the order, so early indicators per ad (prepaid vs COD share, state mix, pre-dispatch cancellations) are tracked alongside it.
15. Milestones (indicative, subject to team size)
Milestone
Scope
M0: Foundations
Link resolver and data adapter, Supabase schema and RLS, auth, application shell
M1: Core flow (banner)
Inputs and fetch, template selection, option generation, approval, prompt output
M2: Template system
Prompt compiler, families, category packs, template certification, library and export
M3: Pilot
Guardrail tuning, golden-set evaluation, diversity check, pilot with the Growth team
M4: Learning loop
Ad-link import, concept-level reporting handoff, template management interface
M5: Video and generation
Video templates and scene prompts, in-tool generate step
16. Risks and open questions
Risk
Mitigation
Product link does not map cleanly to ShopDeck data
Link normalisation, database lookup as source of truth, public-page fallback for non-cost fields
Product data is inconsistent or missing
Editable fields, overrides stored separately, blocking validation
Options feel generic or too similar
Step 1 instructions enforce difference; diversity check; golden-set evaluation
Template structure limits creative variety
Variety through parameters; grow the library deliberately
AI invents claims or misstates price
Approved-claim lists, price check against the product page, human approval
Generated visual misrepresents the product
Real product image as anchor; fidelity rules injected by the system
Cost price leaks
Separate table, RLS, role gating, never sent to external models or output prompts
Open questions
1. Is the product link always a ShopDeck storefront product page, or can it be a marketplace or other site? Can the seller be derived from the link, making Seller ID a verification field only?
2. Persona was replaced by Problem in the flow. Should an audience or persona field also be kept alongside Problem, since the audience shapes who sees the ad?
3. Where do offers come from: invented by the AI within margin limits, or tied to discounts and coupons the seller has actually configured?
4. Does v0 end at the prompt for both banner and video, with generation added later?
5. Do templates already exist as example creatives or Canva designs, or are they still to be defined?
6. Which LLM provider and image model are approved for use with seller data?
7. Who owns the template library and the approved-claims list per category?
8. What margin floor should be the default, and does it vary by category?
9. Which video model will be used, and what are its prompt and length limits?