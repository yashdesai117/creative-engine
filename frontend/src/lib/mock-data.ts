/**
 * Mock data for Creative Engine v0 development.
 * These simulate backend API responses while the real integration is built.
 */

import type { ProductData, Template, OptionDraft, Session } from "./types";
import { generateConceptCode } from "./utils";

// ─── Mock Product ─────────────────────────────────────────────────────────────

export const MOCK_PRODUCT: ProductData = {
  sellerId: "SD-4821",
  productLink: "https://store.shopdeck.com/glowcraft/silver-layered-necklace-set",
  productId: "GCNK-221",
  title: "GlowCraft 925 Silver Layered Necklace Set with Anti-Tarnish Coating",
  description:
    "Premium 925 sterling silver layered necklace set with rhodium anti-tarnish coating. Includes 3 chains of varying lengths (16\", 18\", 20\") with dainty star and moon pendants. Suitable for daily wear and gifting.",
  category: "Jewellery",
  sp: 599,
  mrp: 1499,
  cp: 180,
  discountPercent: 60,
  marginPercent: 70,
  images: [
    {
      url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
      alt: "Silver layered necklace set on white background",
      isReference: true,
    },
    {
      url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
      alt: "Necklace worn by model",
      isReference: false,
    },
    {
      url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80",
      alt: "Close-up detail shot",
      isReference: false,
    },
  ],
  referenceImages: ["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80"],
  variant: undefined,
  isInStock: true,
  isPublished: true,
  fieldSources: {
    title: "database",
    description: "database",
    sp: "database",
    mrp: "database",
    cp: "database",
    category: "database",
  },
  fetchedAt: new Date().toISOString(),
};

// ─── Mock Templates ───────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tmpl-001",
    slug: "product-hero-square",
    name: "Product Hero – Square",
    format: "banner",
    family: "product_hero",
    categories: ["Jewellery", "Fashion", "Accessories"],
    aspectRatios: ["1:1"],
    spec: {
      layout: "Centered product with headline above, subtext below",
      textSlots: [
        { id: "headline", maxChars: 40, zone: "top", modelGenerated: true },
        { id: "subtext", maxChars: 80, zone: "bottom", modelGenerated: true },
        { id: "offer", maxChars: 20, zone: "badge", modelGenerated: false },
      ],
      visualWorld: "Clean white or soft gradient background. Studio lighting.",
      humanPresence: "none",
      doRules: ["Show product clearly", "Match exact product color", "Keep background minimal"],
      dontRules: ["Don't add fake shadow that doesn't match product", "No competitor logos"],
      referenceImages: [],
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    version: 1,
    status: "active",
    certificationStatus: "certified",
  },
  {
    id: "tmpl-002",
    slug: "problem-solution-portrait",
    name: "Problem → Solution – Portrait",
    format: "banner",
    family: "problem_solution",
    categories: ["Jewellery", "Beauty & Personal Care", "Health & Wellness"],
    aspectRatios: ["4:5", "9:16"],
    spec: {
      layout: "Split: problem visual top half, solution bottom half",
      textSlots: [
        { id: "problem_line", maxChars: 50, zone: "top", modelGenerated: true },
        { id: "solution_line", maxChars: 50, zone: "bottom", modelGenerated: true },
        { id: "cta", maxChars: 25, zone: "button", modelGenerated: false },
      ],
      visualWorld: "Lifestyle context. Natural or warm indoor light.",
      humanPresence: "partial",
      doRules: ["Use relatable scenario", "Keep contrast high for readability"],
      dontRules: ["No medical claims", "No before/after if it implies transformation"],
      referenceImages: [],
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=400&q=80",
    version: 1,
    status: "active",
    certificationStatus: "certified",
  },
  {
    id: "tmpl-003",
    slug: "offer-led-landscape",
    name: "Offer-Led – Landscape",
    format: "banner",
    family: "offer_led",
    categories: ["Jewellery", "Fashion", "Footwear", "Home & Kitchen"],
    aspectRatios: ["16:9", "1.91:1"],
    spec: {
      layout: "Product left, offer text right",
      textSlots: [
        { id: "headline", maxChars: 35, zone: "right-top", modelGenerated: true },
        { id: "discount_badge", maxChars: 15, zone: "badge", modelGenerated: false },
        { id: "price", maxChars: 20, zone: "right-bottom", modelGenerated: false },
        { id: "urgency", maxChars: 30, zone: "right-mid", modelGenerated: true },
      ],
      visualWorld: "Bold color background matching brand accent. Product floating.",
      humanPresence: "none",
      doRules: ["Accurate price only", "Use actual discount %", "Clear legible font"],
      dontRules: ["No inflated crossed-out prices", "No misleading urgency"],
      referenceImages: [],
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    version: 2,
    status: "active",
    certificationStatus: "certified",
  },
  {
    id: "tmpl-004",
    slug: "lifestyle-story",
    name: "Lifestyle Story – Stories",
    format: "banner",
    family: "lifestyle",
    categories: ["Jewellery", "Fashion", "Beauty & Personal Care", "Gifting"],
    aspectRatios: ["9:16"],
    spec: {
      layout: "Full-bleed lifestyle image with overlay text at bottom",
      textSlots: [
        { id: "context_line", maxChars: 45, zone: "overlay-top", modelGenerated: true },
        { id: "hook", maxChars: 60, zone: "overlay-bottom", modelGenerated: true },
        { id: "cta", maxChars: 20, zone: "button", modelGenerated: false },
      ],
      visualWorld:
        "Aspirational lifestyle. Golden hour or clean minimal home aesthetic. Mood-forward.",
      humanPresence: "full",
      doRules: ["Model must wear/use product", "Authentic feel over polished"],
      dontRules: ["No overly posed stock-photo feel", "Don't obscure product with text"],
      referenceImages: [],
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
    version: 1,
    status: "active",
    certificationStatus: "pending",
  },
  {
    id: "tmpl-005",
    slug: "ugc-testimonial",
    name: "UGC Testimonial – Square",
    format: "banner",
    family: "ugc_style",
    categories: ["Jewellery", "Beauty & Personal Care", "Health & Wellness", "Fashion"],
    aspectRatios: ["1:1", "4:5"],
    spec: {
      layout: "Selfie-style product shot with text overlay, casual",
      textSlots: [
        { id: "testimonial", maxChars: 100, zone: "center", modelGenerated: true },
        { id: "name_tag", maxChars: 20, zone: "bottom-left", modelGenerated: true },
        { id: "rating", maxChars: 10, zone: "top-right", modelGenerated: false },
      ],
      visualWorld: "Authentic, slightly imperfect. Natural indoor light. iPhone-style.",
      humanPresence: "full",
      doRules: ["Keep it raw and real", "Testimonial must be plausible"],
      dontRules: ["No professional photography look", "No explicit health claims"],
      referenceImages: [],
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
    version: 1,
    status: "active",
    certificationStatus: "certified",
  },
  {
    id: "tmpl-006",
    slug: "gifting-hero",
    name: "Gifting Hero – Square",
    format: "banner",
    family: "gifting",
    categories: ["Jewellery", "Gifting", "Fashion", "Beauty & Personal Care"],
    aspectRatios: ["1:1", "4:5"],
    spec: {
      layout: "Product in gift context with warm overlay",
      textSlots: [
        { id: "occasion", maxChars: 30, zone: "top", modelGenerated: true },
        { id: "headline", maxChars: 50, zone: "center", modelGenerated: true },
        { id: "price", maxChars: 20, zone: "bottom", modelGenerated: false },
      ],
      visualWorld: "Warm golds, pinks, cream. Gift-wrapping context. Festive but premium.",
      humanPresence: "partial",
      doRules: ["Evoke emotion of giving", "Warm color palette"],
      dontRules: ["Don't be too transactional", "No festival-specific imagery unless occasion set"],
      referenceImages: [],
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80",
    version: 1,
    status: "active",
    certificationStatus: "certified",
  },
];

// ─── Mock Options ─────────────────────────────────────────────────────────────

export const MOCK_OPTIONS: OptionDraft[] = [
  {
    id: "opt-001",
    templateId: "tmpl-001",
    problem: "Silver jewellery turns black within weeks, embarrassing to wear",
    angle:
      "Contrarian Truth: Most cheap silver jewellery is a trap. Here's the test that tells you before you buy.",
    offer: "60% off + Free anti-tarnish pouch",
    hookLine: "Your silver necklace is probably fake — here's how to know in 10 seconds",
    summary:
      "Opens with a pattern-interrupt claim that challenges what most people accept as normal. Then pivots to 925 certification as the credibility anchor. The offer feels like a reward for paying attention.",
    rationale:
      "Jewellery buyers in the ₹500–800 range have been burned before. They're skeptical. Leading with the cynical truth they already suspect earns trust immediately, then the 925 credential closes it.",
    claimsUsed: ["925 sterling silver", "Anti-tarnish coating", "Rhodium plated"],
    status: "reviewing",
    isEdited: false,
    score: 87,
  },
  {
    id: "opt-002",
    templateId: "tmpl-001",
    problem: "Can't find jewellery that looks expensive but doesn't break the bank for daily wear",
    angle:
      "Social Proof: 12,000+ women switched to layered sets when they realised a single necklace looks outdated",
    offer: "Get all 3 chains for ₹599 (usually ₹1,499)",
    hookLine: "Why are 12,000 women wearing this exact necklace set right now?",
    summary:
      "Social proof angle with a specific number. The 'usually ₹1,499' framing makes the ₹599 price feel like a steal. Targets the aspiration gap — looks expensive, isn't expensive.",
    rationale:
      "The audience is value-conscious but aspiration-driven. They respond to proof that peers have made this exact decision. The layered trend is real and the number makes it credible.",
    claimsUsed: ["3-piece layered set", "Daily wear"],
    status: "reviewing",
    isEdited: false,
    score: 82,
  },
  {
    id: "opt-003",
    templateId: "tmpl-002",
    problem: "Jewellery oxidises and stains skin green within days, especially in Indian humidity",
    angle:
      "Problem Agitation: The worst moment is reaching your neck at a wedding and feeling that green ring.",
    offer: "Anti-tarnish guarantee + 60% off today",
    hookLine: "Green neck from cheap jewellery? Never again.",
    summary:
      "Hyper-specific pain: green neck stain. Extremely relatable in the Indian market. Positions the anti-tarnish coating as the solution. The word 'guarantee' in the offer does heavy lifting.",
    rationale:
      "This problem is embarrassing and viscerally real. The green stain is such a specific, identifiable failure that anyone who's experienced it will immediately stop scrolling. Specificity = relevance.",
    claimsUsed: ["Anti-tarnish coating", "Rhodium plated"],
    status: "reviewing",
    isEdited: false,
    score: 91,
  },
  {
    id: "opt-004",
    templateId: "tmpl-005",
    problem: "Can't style jewellery that matches multiple outfits — ends up looking basic",
    angle:
      "Curiosity Gap: The layering trick that stylists use to make any outfit look put-together in under 30 seconds",
    offer: "₹599 for the complete set stylists swear by",
    hookLine: "The ₹599 layering set that made my Rs. 300 kurti look ₹3,000",
    summary:
      "UGC tone that feels authentic. The price comparison in the hook is scroll-stopping because it directly speaks to the aspiration of looking expensive without spending much. First-person voice matches the UGC template format.",
    rationale:
      "The value of layered jewellery is that it elevates any outfit. Leading with this outcome rather than the product itself is the right move for a UGC format where authenticity matters.",
    claimsUsed: ["3-piece layered set", "Daily wear"],
    status: "reviewing",
    isEdited: false,
    score: 78,
  },
  {
    id: "opt-005",
    templateId: "tmpl-006",
    problem: "Can't find a meaningful yet affordable gift for someone special under ₹1,000",
    angle:
      "Transformation: The feeling of gifting something that looks like it cost ₹3,000 for ₹599",
    offer: "Free gift wrapping + 60% off — limited time",
    hookLine: "She'll think you spent ₹3,000. You spent ₹599.",
    summary:
      "Gifting angle targeting the gift-giver, not the wearer. The value gap (perceived value vs actual price) is the entire message. Free gift wrapping makes it immediately practical. Very strong for festive seasons.",
    rationale:
      "When buying as a gift, the buyer's core fear is 'will this look cheap?' Directly addressing that fear — and flipping it — makes this extremely motivating. The price reveal in the hook is memorable.",
    claimsUsed: ["3-piece set", "Gift-ready"],
    status: "reviewing",
    isEdited: false,
    score: 85,
  },
  {
    id: "opt-006",
    templateId: "tmpl-003",
    problem: "Paying too much for jewellery that looks the same as cheap versions elsewhere",
    angle:
      "Comparison / Objection Handling: What you get at ₹599 that ₹200 jewellery can never give you",
    offer: "60% off MRP — ends today",
    hookLine: "₹200 vs ₹599 jewellery — this is what you're actually paying for",
    summary:
      "Comparison frame that justifies the price by explaining what's inside it. Addresses the 'why not just buy cheap?' objection that most price-sensitive buyers have. Creates a clear value hierarchy.",
    rationale:
      "The ₹599 buyer often hesitates because they've seen similar-looking pieces for ₹150-200 online. This directly handles that objection by making the quality difference tangible and specific.",
    claimsUsed: ["925 sterling silver", "Anti-tarnish coating", "Rhodium plated"],
    status: "reviewing",
    isEdited: false,
    score: 80,
  },
];

// ─── Mock Sessions ────────────────────────────────────────────────────────────

export const MOCK_SESSIONS: Omit<Session, "options" | "concepts">[] = [
  {
    id: "sess-001",
    userId: "user-001",
    sellerId: "SD-4821",
    format: "banner",
    status: "approved",
    product: MOCK_PRODUCT,
    selectedTemplateIds: ["tmpl-001", "tmpl-002"],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "sess-002",
    userId: "user-001",
    sellerId: "SD-3310",
    format: "banner",
    status: "reviewing",
    product: {
      ...MOCK_PRODUCT,
      sellerId: "SD-3310",
      title: "PowerGrip Resistance Band Set (5 Levels)",
      category: "Sports & Fitness",
      sp: 799,
      mrp: 1999,
      discountPercent: 60,
    },
    selectedTemplateIds: ["tmpl-001"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "sess-003",
    userId: "user-001",
    sellerId: "SD-5120",
    format: "video",
    status: "generating",
    product: {
      ...MOCK_PRODUCT,
      sellerId: "SD-5120",
      title: "NutriBlend Pro Personal Blender 500W",
      category: "Home & Kitchen",
      sp: 1299,
      mrp: 2499,
      discountPercent: 48,
    },
    selectedTemplateIds: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ─── Mock Specimen Prompts ────────────────────────────────────────────────────

export const MOCK_BANNER_PROMPT = `PRODUCT FIDELITY RULES (non-negotiable):
- Use the attached reference product image EXACTLY as shown
- Do NOT redraw, recolor, or alter the product in any way
- The product must remain photorealistic and true to the reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE: Product Hero & Problem-Solution – Square (1:1 aspect ratio)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAMILY: Product Hero & Problem Solution
Visual world: Clean luxury minimalist setting with marble pedestal, soft silk cloth drape, and delicate warm morning light (4500K).
Human presence: Partial (neatly manicured Indian female hand delicately placing the necklace on the pedestal).
Aspect ratio: 1:1 (1080×1080)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY PACK: Jewellery (Indian D2C Context)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Emphasize 925 sterling silver hallmark stamp, high-mirror rhodium shine, anti-tarnish coating, and skin-safe hypoallergenic comfort.
Props: Beige velvet jewellery box, polished white marble block, warm directional softbox light.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCEPT BRIEF (META ANDROMEDA VECTOR TARGETING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target Persona: Urban Indian working professional woman (24–29), wears daily corporate & fusion attire, frustrated by jewellery tarnishing and skin rashes.
Awareness Stage: Problem-Aware
Hook (First Glance): "चांदी 2 हफ़्ते में काली क्यों पड़ जाती है? ❌"
Problem: Cheap imitation silver oxidises rapidly and leaves embarrassing green stains on skin.
Angle: Contrarian Truth & Problem Agitation — Most affordable jewellery cuts corners with cheap brass and micro-thin silver wash. 925 silver sealed with rhodium prevents oxidation forever.
Offer: Flat 60% OFF · Just ₹599 + Complimentary Anti-Tarnish Storage Pouch + 7-Day Exchange Guarantee.
Claims in use: 925 Sterling Silver, Rhodium Anti-Tarnish Coating, Hypoallergenic Certified.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: GlowCraft 925 Silver Layered Necklace Set
Selling price: ₹599
MRP: ₹1499
Discount: 60% off MRP
Category: Jewellery
Description: Premium 925 sterling silver layered necklace set with rhodium anti-tarnish coating. Includes 3 chains of varying lengths (16", 18", 20") with dainty star and moon pendants.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXT OVERLAYS (Apply as graphic design layers — not drawn by AI model):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- TOP ZONE HEADLINE: "Your silver won't turn black. Ever."
- PROOF BADGE (Top Right): "Verified 925 Hallmark Certified ✨"
- OFFER BADGE (Bottom Left): "Flat 60% OFF · Just ₹599"
- CTA BUTTON (Bottom Right): "Shop Now →"
- SAFE ZONES: 10% outer margin reserved. Mobile typography minimum 16px.

Reference image: [ATTACHED — use as strict product anchor, do not alter]`;

export const MOCK_VIDEO_PROMPT_2PARTS = `================================================================================
SPECIMEN 2-PART VIDEO PROMPT FOR GOOGLE VEO / GOOGLE FLOW / KLING (MAX 2 PARTS, 8–10s EACH)
================================================================================

AI CHARACTER CONSISTENCY SEED (LOCKED ACROSS BOTH PARTS):
- Character: "Ananya", authentic 26-year-old urban Indian woman.
- Physical traits: Warm wheatish Indian complexion, expressive brown eyes, shoulder-length wavy dark brown hair, small round maroon bindi between brows, minimal radiant dewy makeup.
- Wardrobe: Solid pastel lilac-lavender linen button-down shirt with open collar and rolled cuffs, dainty silver stud earrings (STRICTLY IDENTICAL IN BOTH PARTS).
- Location: Sunlit modern Bangalore bedroom vanity table with wooden mirror frame and soft morning daylight (4500K) from camera left (STRICTLY IDENTICAL IN BOTH PARTS).
- Seed Lock Token: [ANANYA_IND_26_LILAC_SHIRT_BINDI_VANITY]
- Technical Profile: 4500K warm daylight, 35mm f/1.8 lens bokeh, 9:16 vertical (1080×1920), 24fps cinematic realism.

PRODUCT ANCHOR (ZERO PRODUCT SWAPS — VISIBLE FROM SECOND 0):
- Product: GlowCraft 925 Silver Layered Necklace Set (SKU: GCNK-221).
- Non-negotiable Geometry: EXACTLY 3 delicate sterling silver chains (lengths 16", 18", 20"). Middle tier has 1 tiny polished silver crescent moon pendant (6mm). Bottom tier has 1 tiny polished silver star pendant (5mm).
- Strict Rule: DO NOT switch to a different necklace. DO NOT add extra chains or coin charms. Worn by Ananya across both parts.

────────────────────────────────────────────────────────────────────────────────
PART 1 (0–9 SECONDS) — HOOK & THE BRIDGE (AVOID ABRUPT PRODUCT DROP)
────────────────────────────────────────────────────────────────────────────────
• Visual Prompt (Veo / Google Flow / Kling):
  "CONTINUOUS SINGLE SCENE: Ananya ([ANANYA_IND_26_LILAC_SHIRT_BINDI_VANITY]) is seated at her wooden vanity mirror in a sunlit Bangalore bedroom. She is ALREADY WEARING the GlowCraft 925 Silver Layered Necklace (strictly 3 fine silver chains with tiny moon & star charms, no coin charms) against her collarbone. At 0-2s she looks into the mirror touching the dainty silver moon pendant with an amused, candid confession expression. At 2.5s she turns smoothly to camera with a warm, playful smile and begins speaking directly to the viewer. Conversational gentle handheld camera, natural lip sync. Speech finishes comfortably at 7.2s, leaving 1.8s buffer of her confident smile and necklace gleam. No rushed movement, no product morphing. 24fps cinematic realism."

• Spoken Dialogue / Voiceover (Conversational Hinglish · Seamless Bridge):
  "डोंट जज मी, पर मैंने ये पहन के शावर ले लिया... क्योंकि पुरानी चेन्स दो दिन में ही काली पड़ जाती थीं! बट लुक एट दिस फिनिश।"

• Phonetic Transliteration (for voice artist / TTS reference):
  "Don't judge me, par maine yeh pehen ke shower le liya... kyunki purani chains 2 din mein hi kaali pad jaati thi! But look at this finish."

• English Meaning:
  "Don't judge me, but I literally showered with this necklace... because cheap chains turn black in two days! But look at this finish."

• On-Screen Text Overlay (Safe Zone):
  "डोंट जज मी... 🚿❌" (Bold high-contrast subtitle)

• Camera Motion: Conversational eye-level, gentle punch-in at 2.5s to collarbone.
• Duration: 9.0 seconds (Speech: 7.2s | Buffer: 1.8s).

────────────────────────────────────────────────────────────────────────────────
PART 2 (9–18 SECONDS) — MECHANISM, PROOF & MEANINGFUL RISK-REVERSAL CTA
────────────────────────────────────────────────────────────────────────────────
• Visual Prompt (Veo / Google Flow / Kling):
  "MATCHING SCENE CONTINUITY: Exact same sunlit Bangalore bedroom, exact same lighting (4500K), exact same Ananya ([ANANYA_IND_26_LILAC_SHIRT_BINDI_VANITY]) wearing the exact same lilac linen shirt with maroon bindi. Starts with a close-up on her collarbone (0-3s) as she gently tilts the necklace clasp/pendant towards camera showing the razor-sharp laser-engraved '925' hallmark stamp with high-mirror rhodium shine. At 3.0s camera tilts smoothly up to Ananya's face as she speaks Part 2 dialogue with radiant confidence. Speech finishes cleanly at 7.4s. At 7.8s she gestures warmly down towards the offer sticker. Lower-third animated badge: 'FLAT 60% OFF · ₹599 · 7-DAY GUARANTEE'. 24fps cinematic realism."

• Spoken Dialogue / Voiceover (Conversational Hinglish · Meaningful CTA):
  "ये रियल 925 सिल्वर है विथ रोडियम—ज़ीरो टार्निश! वेबसाइट पर अभी फ्लैट 60% ऑफ में सिर्फ ₹599 का है, 7-दिन की एक्सचेंज गारंटी के साथ। अभी नीचे टैप करके अपना सेट सिक्योर कर लो!"

• Phonetic Transliteration (for voice artist / TTS reference):
  "Yeh real 925 silver hai with rhodium—zero tarnish! Website pe abhi flat 60% off mein sirf Rs. 599 ka hai, 7-day exchange guarantee ke saath. Abhi neeche tap karke apna set secure kar lo!"

• English Meaning:
  "This is real 925 silver with rhodium—zero tarnish! It's flat 60% off at just ₹599 on the site right now with a 7-day exchange guarantee. Tap below to secure your set!"

• On-Screen Text Overlay (Safe Zone):
  "Real 925 Silver ✨ • Flat 60% OFF • सिर्फ ₹599 • 7-Day Guarantee 👇"

• Camera Motion: Macro punch on 925 hallmark, smooth tilt up to hero smile and tap gesture.
• Duration: 9.0 seconds (Speech: 7.4s | Buffer: 1.6s).
================================================================================`;

export const MOCK_STORYBOARD_IMAGE_PROMPT = `================================================================================
STORYBOARD KEYFRAME IMAGE PROMPTS (FIRST FRAME GENERATION PIPELINE)
Generate these High-Res Stills FIRST (Midjourney v6.1 / Flux.1 / Nano Banana)
Then feed each image as "First Frame / Image-to-Video" into Google Veo / Google Flow
================================================================================

CRITICAL ARCHITECTURE RULES TO ELIMINATE AI HALLUCINATIONS:
1. Single Product Rule: Ananya wears the EXACT GlowCraft 925 Silver Layered Necklace from Frame 0. ZERO product swaps!
2. Strict Geometry Anchor: Exactly 3 delicate cable chains (16", 18", 20") + 1 tiny crescent moon + 1 tiny star. NO extra chains, NO coin charms.
3. Single Scene & Outfit Continuity: Both Keyframe 1 and Keyframe 2 are shot in the EXACT same Bangalore bedroom vanity corner with the exact same lilac shirt and maroon bindi.

────────────────────────────────────────────────────────────────────────────────
KEYFRAME 1 (PART 1 FIRST FRAME STILL — 0.0s START FRAME)
Engine: Midjourney v6.1 / Flux.1 Schnell / Nano Banana | Aspect Ratio: 9:16 Vertical
────────────────────────────────────────────────────────────────────────────────
PROMPT:
"Photorealistic 8k vertical editorial portrait (9:16) of Ananya, an authentic 26-year-old urban Indian woman with warm wheatish complexion, expressive almond brown eyes, shoulder-length wavy dark brown hair, and a small round maroon bindi between her brows. Natural radiant dewy minimal makeup. She is seated in front of a wooden vanity mirror in a sunlit Bangalore bedroom with sheer cream curtains diffusing soft warm morning daylight (4500K). She is wearing a solid pastel lilac-lavender linen button-down shirt with open collar and rolled cuffs. SHE IS WEARING the GlowCraft 925 Silver Layered Necklace against her collarbone: EXACTLY 3 delicate sterling silver chains (lengths 16 inch, 18 inch, 20 inch) with 1 tiny polished silver crescent moon pendant and 1 tiny polished silver star pendant (STRICT MATCH TO REFERENCE IMAGE GCNK-221, NO coin pendants, NO extra chains). She touches the moon pendant gently, looking into the mirror with an inquiring expression. Authentic Indian skin texture with visible natural pores, zero plastic wax sheen, 35mm f/1.8 lens, shallow depth of field --ar 9:16 --style raw --v 6.1"

NEGATIVE PROMPT:
"plastic skin, porcelain, 3d render, anime, caucasian, extra necklace, extra chains, coin pendants, heavy gold, distorted fingers, blurry, watermark, text, dark underexposed"

HOW TO USE IN VEO / FLOW:
1. Generate and upscale this image.
2. Upload this still as the "Starting Frame / Input Image" in Google Veo or Google Flow.
3. Attach Part 1 Video Motion Prompt: "Animate from Keyframe 1. Ananya touches the necklace in the mirror (0-2s), then turns smoothly to camera at 2.5s speaking directly with natural facial expressions. Speech finishes at 6s with 3s buffer. No product morphing."

────────────────────────────────────────────────────────────────────────────────
KEYFRAME 2 (PART 2 FIRST FRAME STILL — 9.0s START FRAME / HALLMARK REVEAL)
Engine: Midjourney v6.1 / Flux.1 Schnell / Nano Banana | Aspect Ratio: 9:16 Vertical
────────────────────────────────────────────────────────────────────────────────
PROMPT:
"Photorealistic 8k vertical portrait close-up (9:16), EXACT SAME SCENE CONTINUITY AS KEYFRAME 1. Same sunlit Bangalore bedroom vanity, same 4500K soft daylight, same woman Ananya in the same pastel lilac linen shirt with maroon bindi. Close-up framing on her collarbone and neatly manicured hand: she gently tilts the GlowCraft 925 Silver Layered Necklace clasp and pendant towards camera, revealing the razor-sharp laser-engraved '925' hallmark stamp with high-mirror rhodium anti-tarnish gleam. The 3 delicate silver chains (lengths 16 inch, 18 inch, 20 inch) lie neatly across her skin without tangling or extra layers. Soft out-of-focus bedroom background, 85mm f/2.0 portrait macro, ultra-crisp metallic reflections, authentic skin texture with natural pores, zero AI plastic sheen --ar 9:16 --style raw --v 6.1"

NEGATIVE PROMPT:
"different woman, different shirt, extra chains, coin pendant, gold jewellery, brass, fake glitter, low resolution, distorted fingers, noisy background, oversaturated"

HOW TO USE IN VEO / FLOW:
1. Generate and upscale this image.
2. Upload this still as the "Starting Frame / Input Image" for Part 2 in Google Veo or Google Flow.
3. Attach Part 2 Video Motion Prompt: "Animate from Keyframe 2. Camera glides across sharp 925 hallmark (0-3s), tilts smoothly up to Ananya's face (3-5s) as she speaks Part 2 dialogue in the same lilac shirt. Speech completes cleanly at 6.2s. At 7s she gestures warmly down towards offer badge."
================================================================================`;

export const MOCK_PROMPT = MOCK_BANNER_PROMPT;
