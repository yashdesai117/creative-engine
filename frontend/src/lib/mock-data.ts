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

// ─── Mock prompt output ───────────────────────────────────────────────────────

export const MOCK_PROMPT = `You are a professional product image generation specialist creating a Meta ad banner for a D2C brand.

PRODUCT FIDELITY RULES (non-negotiable):
- Use the attached reference product image EXACTLY as shown
- Do NOT redraw, recolor, or alter the product in any way
- The product must remain photorealistic and true to the reference

TEMPLATE: Product Hero – Square (1:1 aspect ratio)
FAMILY: Product Hero

VISUAL WORLD:
- Clean, minimal white background with a very subtle warm gradient at edges
- Studio-quality lighting: soft main light from top-left, slight fill from right
- Product floating slightly above center, with a delicate shadow beneath
- No props or scene elements — let the product speak

TEXT OVERLAY (to be added as layers, not generated):
- HEADLINE (top zone, max 40 chars): "Your silver won't tarnish. Ever."
- OFFER BADGE (corner): "60% OFF"
- SUBTEXT (bottom zone): "925 Sterling Silver · Anti-Tarnish Coating"

CONCEPT: Green neck from cheap jewellery? Never again.
ANGLE: Problem Agitation — The worst moment is reaching your neck at a wedding and feeling that green ring.
OFFER: Anti-tarnish guarantee + 60% off today

BANNED ELEMENTS:
- No text generated by the image model (all text added as overlay layers)
- No other jewellery products in frame
- No models or human body parts
- No competitor logos or branding
- No price shown in the generated image
- No inflated or misleading pricing

QUALITY REQUIREMENTS:
- Aspect ratio: 1:1 (1024×1024)
- Ultra-realistic product photography style
- Colors must match reference image exactly
- Safe zones: keep 10% margin on all edges clear for text overlay`;
