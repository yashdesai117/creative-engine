// Core domain types for Creative Engine

export type Format = "banner" | "video";
export type ConceptStatus = "draft" | "approved" | "launched";
export type SessionStatus = "input" | "confirming" | "templates" | "generating" | "reviewing" | "approved";
export type UserRole = "admin" | "editor" | "viewer";

// ─── Product ────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  alt?: string;
  isReference?: boolean;
}

export interface ProductData {
  sellerId: string;
  productLink: string;
  productId: string;
  title: string;
  description: string;
  category: string;
  sp: number; // Selling Price
  mrp: number; // Maximum Retail Price
  cp?: number; // Cost Price (admin only)
  discountPercent: number;
  marginPercent?: number; // admin only
  images: ProductImage[];
  referenceImages: string[]; // selected image URLs
  variant?: string;
  isInStock: boolean;
  isPublished: boolean;
  fieldSources: Record<string, "database" | "fallback" | "user_override">;
  fetchedAt: string;
}

export interface ProductOverride {
  field: string;
  value: string | number;
  editedBy: string;
}

// ─── Templates ──────────────────────────────────────────────────────────────

export type TemplateFamily =
  | "product_hero"
  | "lifestyle"
  | "ugc_style"
  | "problem_solution"
  | "offer_led"
  | "testimonial"
  | "comparison"
  | "gifting";

export interface TemplateSpec {
  layout: string;
  textSlots: Array<{
    id: string;
    maxChars: number;
    zone: string;
    modelGenerated: boolean;
  }>;
  visualWorld: string;
  humanPresence: "none" | "partial" | "full";
  doRules: string[];
  dontRules: string[];
  referenceImages: string[];
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  format: Format;
  family: TemplateFamily;
  categories: string[];
  aspectRatios: string[];
  spec: TemplateSpec;
  thumbnailUrl?: string;
  version: number;
  status: "active" | "draft" | "deprecated";
  certificationStatus: "pending" | "certified" | "failed";
}

// ─── Options & Concepts ─────────────────────────────────────────────────────

export interface HookLayers {
  visual: string;
  audio: string;
  copy: string;
}

export interface AICharacterProfile {
  id: string;
  name: string;
  ethnicity: string;
  gender: string;
  ageRange: string;
  personaContext: string;
  appearanceTraits: string;
  clothingStyle: string;
  visualAnchorPrompt: string;
  referenceImageUrl?: string;
}

export interface NineBeatScript {
  hook: string;
  problemAgitation: string;
  bridge: string;
  promise: string;
  mechanism: string;
  objectionHandling: string;
  proof: string;
  offer: string;
  riskReversalCta: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  beatName: string;
  durationSeconds: number;
  visualPrompt: string;
  spokenAudio: string;
  textOverlay: string;
  cameraMotion: string;
  keyframeUrl?: string;
}

export interface StoryboardResponse {
  conceptId: string;
  character: AICharacterProfile;
  script: NineBeatScript;
  scenes: StoryboardScene[];
  totalDurationSeconds: number;
  aspectRatio: string;
  status: string;
}

export interface OptionDraft {
  id: string;
  templateId: string;
  persona?: string;
  awarenessStage?: string;
  problem: string;
  angle: string;
  offer: string;
  hookLine: string;
  hookLayers?: HookLayers;
  bridge?: string;
  summary: string;
  rationale: string;
  claimsUsed: string[];
  status: "pending" | "reviewing" | "selected" | "locked" | "discarded";
  isEdited: boolean;
  score?: number;
}

export interface Concept {
  id: string;
  conceptCode: string;
  adName: string;
  optionId: string;
  option: OptionDraft;
  finalPrompt: string;
  promptVersion: string;
  status: ConceptStatus;
  approvedBy: string;
  approvedAt: string;
  adId?: string;
  feedback?: "up" | "down";
  feedbackNote?: string;
  storyboard?: StoryboardResponse;
}

// ─── Session ────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  sellerId: string;
  format: Format;
  status: SessionStatus;
  product?: ProductData;
  selectedTemplateIds: string[];
  options: OptionDraft[];
  concepts: Concept[];
  createdAt: string;
  updatedAt: string;
}

// ─── Session Store (UI state) ────────────────────────────────────────────────

export interface SessionFlowState {
  // Current session
  session: Session | null;
  currentStep: number; // 0=inputs, 1=confirm, 2=templates, 3=generating, 4=review, 5=output

  // Input form
  inputForm: {
    sellerId: string;
    productLink: string;
    format: Format;
  };

  // Fetch state
  isFetching: boolean;
  fetchError: string | null;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationStep: "candidates" | "summaries" | "done" | null;

  // Prompt output state
  isGeneratingPrompts: boolean;

  // Actions
  setInputField: (field: keyof SessionFlowState["inputForm"], value: string | Format) => void;
  setStep: (step: number) => void;
  fetchProduct: () => Promise<void>;
  selectTemplate: (templateId: string) => void;
  deselectTemplate: (templateId: string) => void;
  generateOptions: () => Promise<void>;
  updateOption: (optionId: string, updates: Partial<OptionDraft>) => void;
  selectOption: (optionId: string) => void;
  lockOption: (optionId: string) => void;
  discardOption: (optionId: string) => void;
  regenerateOption: (optionId: string) => Promise<void>;
  approveSelected: () => Promise<void>;
  generatePrompts: () => Promise<void>;
  copyPrompt: (conceptId: string) => void;
  reset: () => void;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

export interface GenerationChunk {
  type: "option" | "summary" | "done" | "error";
  optionIndex?: number;
  option?: OptionDraft;
  error?: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  teamId: string;
}

// ─── Hook archetypes ─────────────────────────────────────────────────────────

export const HOOK_ARCHETYPES = [
  "Pattern Interrupt",
  "Bold Claim",
  "Question",
  "Curiosity Gap",
  "Social Proof",
  "Contrarian",
  "Specific Number",
  "Relatable Situation",
  "Before/After Tease",
] as const;

export type HookArchetype = (typeof HOOK_ARCHETYPES)[number];

// ─── Angle components ────────────────────────────────────────────────────────

export const ANGLE_COMPONENTS = [
  "Problem Agitation",
  "Contrarian Truth",
  "Social Proof / Domain Authority",
  "Curiosity Gap",
  "Comparison / Objection Handling",
  "Transformation",
] as const;

export type AngleComponent = (typeof ANGLE_COMPONENTS)[number];

// ─── Categories ───────────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "Fashion",
  "Jewellery",
  "Footwear",
  "Home & Kitchen",
  "Electronics",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Kids & Baby",
  "Sports & Fitness",
  "Bags & Accessories",
  "Books & Stationery",
  "Gifting",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
