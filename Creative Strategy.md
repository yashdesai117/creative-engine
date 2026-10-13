# Project: Creative Strategy Engine (v1)

## Purpose

A standalone chat-based tool that generates strategic creative briefs — and ready-to-use generation prompts — for Meta ad campaigns, built on a specific framework (Persona → Angle → Hook → Bridge → Format → Generation Prompt). It exists to replace ad-hoc, generic creative recommendations ("try new creatives," "test UGC") with the kind of structured, hyper-specific direction that would normally take 4-5 hours of expert thinking, and to hand off a prompt that can directly produce the video/image asset.

The user is a Growth Manager at a D2C enablement platform (ShopDeck) managing ~200 seller accounts. He is not the one filming ads — he uses this tool to produce creative briefs and generation prompts during weekly troubleshooting, to hand to sellers, creative resources, or AI generation tools.

This tool is deliberately scoped to **creative strategy and prompt generation only**. It does not cover media buying, campaign structure, budget allocation, or account-level Meta Ads management.

---

## Core Framework (Non-Negotiable Foundation)

A **Concept** = a fixed combination of **Persona + Angle + Offer + Format**. Changing any one variable creates a functionally different concept, because Meta's ad-serving algorithm (Andromeda) reads creative content — script, transcript, visuals, on-screen talent — to determine audience targeting. The creative *is* the targeting.

**Generation/testing priority order (highest leverage first):**
1. **Angle** — the argument/message. Fix this first; most failures are bad messaging, not wrong audience.
2. **Offer** — how value is framed — limited by margin/catalog.
3. **Persona** — who it's aimed at — only worth varying once an angle is proven.
4. **Format** — UGC/static/VSL/etc. — lowest leverage; a great script fails in any format if the angle is bad.

The engine mirrors this priority: most "effort" goes into persona specificity and angle construction; hooks are a fast derivative of angle; format and the final generation prompt are the last, most concrete steps.

## Modular Flow for AI (in Backend)

```
STAGE 0: Intake
    ↓
STAGE 1: Persona Generation (4–5 personas)
    ↓ 
STAGE 2: Angle Construction (for the selected persona)
    ↓ 
STAGE 3: Hook Set (3–4 hooks, graded)
    
---

## Stage 1: Persona Generation

Generate **hyper-specific personas**, informed by both the stated inputs and the product image. Each persona includes:

- **The specific pain point** — a specific manifestation, not a category
- **A concrete situational detail** — makes the persona feel like a real individual, not a demographic slice
- **Implied income/price sensitivity**

Avoid broad demographic personas. If the product doesn't genuinely support 4-5 distinct variations, say so rather than force it.
    
## Stage 2: Angle Construction

One strong primary angle per selected persona, built from one or a deliberate combination of: Problem Agitation, Contrarian Truth, Social Proof/Domain Authority, Curiosity Gap, Comparison/Objection Handling, Transformation (used carefully — Meta restricts explicit before/afters).

State which component(s) were used and why, tied to the persona's pain point and, where relevant, to what's visible in the product image. Must never overpromise against a known product weakness flagged in Stage 0.

## Stage 3: Hook Set

3-4 hooks for the approved angle, each tagged with:

- Which of the **9 hook archetypes** it uses
- Self-assessed score against the 5-criteria matrix (Clarity, Relevance, Novelty, Specificity, Credibility) — 1-10 each, no requirement to hit 10 across all five
- The actual hook line (first 3 seconds)