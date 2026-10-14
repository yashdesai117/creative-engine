"""
Pydantic schemas for the Creative Engine API.
All AI outputs are schema-validated. CP never appears in response schemas.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, Any
from datetime import datetime
from enum import Enum
import uuid


# ─── Enums ───────────────────────────────────────────────────────────────────

class Format(str, Enum):
    banner = "banner"
    video = "video"


class ConceptStatus(str, Enum):
    draft = "draft"
    approved = "approved"
    launched = "launched"


class SessionStatus(str, Enum):
    input = "input"
    confirming = "confirming"
    templates = "templates"
    generating = "generating"
    reviewing = "reviewing"
    approved = "approved"


class FieldSource(str, Enum):
    database = "database"
    fallback = "fallback"
    user_override = "user_override"


# ─── Product Schemas ──────────────────────────────────────────────────────────

class ProductResolveRequest(BaseModel):
    seller_id: str = Field(..., min_length=2, max_length=50)
    product_link: str = Field(..., min_length=10)
    format: Format


class ProductImage(BaseModel):
    url: str
    alt: Optional[str] = None
    is_reference: bool = False


class ProductResponse(BaseModel):
    """Public product data — never includes CP."""
    seller_id: str
    product_id: str
    title: str
    description: str
    category: str
    sp: float
    mrp: float
    discount_percent: float
    images: list[ProductImage]
    variant: Optional[str] = None
    is_in_stock: bool
    is_published: bool
    field_sources: dict[str, FieldSource]
    fetched_at: datetime

    # CP is intentionally excluded from this schema


class ProductOverrideRequest(BaseModel):
    field: str
    value: Any
    snapshot_id: str


# ─── Template Schemas ─────────────────────────────────────────────────────────

class TextSlot(BaseModel):
    id: str
    max_chars: int
    zone: str
    model_generated: bool


class TemplateSpec(BaseModel):
    layout: str
    text_slots: list[TextSlot]
    visual_world: str
    human_presence: Literal["none", "partial", "full"]
    do_rules: list[str]
    dont_rules: list[str]
    reference_images: list[str]


class TemplateResponse(BaseModel):
    id: str
    slug: str
    name: str
    format: Format
    family: str
    categories: list[str]
    aspect_ratios: list[str]
    spec: TemplateSpec
    thumbnail_url: Optional[str] = None
    version: int
    status: str
    certification_status: str


# ─── Session Schemas ──────────────────────────────────────────────────────────

class SessionCreateRequest(BaseModel):
    seller_id: str
    product_link: str
    format: Format


class SessionResponse(BaseModel):
    id: str
    seller_id: str
    format: Format
    status: SessionStatus
    product_snapshot_id: Optional[str] = None
    selected_template_ids: list[str]
    created_at: datetime
    updated_at: datetime


class TemplateSelectionRequest(BaseModel):
    template_ids: list[str] = Field(..., min_length=1)


# ─── Option Schemas ───────────────────────────────────────────────────────────

class HookLayers(BaseModel):
    """The 3 layers of an Andromeda-compliant hook."""
    visual: str = Field(..., description="What is visually displayed on screen in 0-3s")
    audio: str = Field(..., description="Spoken dialogue or audio hook transcribed by Andromeda")
    copy: str = Field(..., description="On-screen text overlay / caption in 0-3s")


class AICharacterProfile(BaseModel):
    """AI character specification for visual & narrative consistency."""
    id: str = Field(default_factory=lambda: f"char_{uuid.uuid4().hex[:8]}")
    name: str = Field(..., description="Persona character name")
    ethnicity: str = Field(default="Indian", description="Default Indian unless specified otherwise")
    gender: str = Field(..., description="Gender tailored to product & persona")
    age_range: str = Field(..., description="e.g. 24-28, 30-35, 40-45")
    persona_context: str = Field(..., description="Lifestyle, profession, urban/tier-2 setting")
    appearance_traits: str = Field(..., description="Skin tone, hair texture, distinct facial features")
    clothing_style: str = Field(..., description="Authentic styling matching target demographic")
    visual_anchor_prompt: str = Field(..., description="Photorealistic prompt to anchor character consistency")
    reference_image_url: Optional[str] = None


class NineBeatScript(BaseModel):
    """The 9-part direct-response sales argument (Eugene Schwartz + Claude Hopkins)."""
    hook: str = Field(..., description="Beat 1: Scroll-stopping hook (0-3s)")
    problem_agitation: str = Field(..., description="Beat 2: Name the painful consequence (3-8s)")
    bridge: str = Field(..., description="Beat 3: Seamless narrative transition preventing product drop (8-10s)")
    promise: str = Field(..., description="Beat 4: Desired outcome stated in customer language (10-13s)")
    mechanism: str = Field(..., description="Beat 5: The unique reason to believe / why it works (13-16s)")
    objection_handling: str = Field(..., description="Beat 6: Why past attempts failed (16-18s)")
    proof: str = Field(..., description="Beat 7: Demonstration / clinical / testimonial evidence (18-20s)")
    offer: str = Field(..., description="Beat 8: Value framing within margin guardrails")
    risk_reversal_cta: str = Field(..., description="Beat 9: Guarantee matching mechanism + clear CTA")
    hindi_full_voiceover: Optional[str] = Field(None, description="Full spoken voiceover in conversational Hindi Devanagari script")


class StoryboardScene(BaseModel):
    """Individual scene beat in a multi-modal video storyboard (max 2 parts, 8-10s each for Veo/Flow)."""
    scene_number: int
    part_number: int = Field(default=1, description="Part 1 (Hook & Bridge) or Part 2 (Mechanism & Offer) - max 2 parts")
    beat_name: str
    duration_seconds: float = Field(default=8.0, description="8-10 seconds per part to fit Veo/Google Flow generation limits")
    visual_prompt: str = Field(..., description="Image/video model prompt anchoring character and product")
    spoken_audio_hindi: str = Field(..., description="Spoken voiceover written in authentic Hindi (Devanagari script) to avoid mispronunciation")
    spoken_audio_hinglish: Optional[str] = Field(None, description="Phonetic Romanized script for voiceover artists/TTS reference")
    spoken_audio: str = Field(..., description="Spoken dialogue/transcript scanned by Meta Andromeda")
    text_overlay: str = Field(..., description="Text overlay within safe zones")
    camera_motion: str = Field(default="static", description="Camera movement: zoom, pan, handheld, macro")
    technical_consistency_anchors: Optional[str] = Field(None, description="Lighting, color temperature, and character seed tokens to guarantee visual match across parts")
    keyframe_url: Optional[str] = None


class StoryboardResponse(BaseModel):
    """Complete video storyboard ready for video generation (Max 2 parts of 8-10s each)."""
    concept_id: str
    character: AICharacterProfile
    script: NineBeatScript
    scenes: list[StoryboardScene]
    total_parts: int = 2
    total_duration_seconds: float = 18.0
    aspect_ratio: str = "9:16"
    status: str = "ready_for_render"


# ─── Option Schemas ───────────────────────────────────────────────────────────

class OptionCandidate(BaseModel):
    """AI step 1 output — structured concept candidate with persona & awareness."""
    persona: str = Field(default="Target Indian Consumer", description="Specific persona who sees the ad")
    awareness_stage: str = Field(default="problem_aware", description="Eugene Schwartz awareness level")
    problem: str = Field(..., description="Specific pain point or desire/motivation")
    angle: str = Field(..., description="Strategic messaging approach with component(s) named")
    offer: str = Field(..., description="Value framing — must be within margin guardrails")
    angle_components: list[str] = Field(default_factory=list)


class OptionSummary(BaseModel):
    """AI step 2 output — how the option appears in the template with 3-layer hook."""
    hook_line: str = Field(..., description="First 3 seconds — the scroll-stopper")
    hook_layers: Optional[HookLayers] = None
    bridge: Optional[str] = Field(None, description="Smooth transition to product introduction")
    how_it_looks: str = Field(..., description="How this would appear in the chosen template")
    rationale: str = Field(..., description="Strategic reasoning tied to the persona/product")
    offer_line: str = Field(..., description="Final offer presentation")
    claims_used: list[str] = Field(default_factory=list, description="Product claims relied upon")
    score: Optional[int] = Field(None, ge=0, le=100)


class OptionResponse(BaseModel):
    id: str
    session_id: str
    template_id: str
    persona: str = "Target Consumer"
    awareness_stage: str = "problem_aware"
    problem: str
    angle: str
    offer: str
    hook_line: str
    hook_layers: Optional[HookLayers] = None
    bridge: Optional[str] = None
    summary: str
    rationale: str
    claims_used: list[str]
    status: str
    is_edited: bool
    score: Optional[int] = None
    component_versions: dict[str, str] = {}
    created_at: datetime


class OptionUpdateRequest(BaseModel):
    persona: Optional[str] = None
    problem: Optional[str] = None
    angle: Optional[str] = None
    offer: Optional[str] = None
    hook_line: Optional[str] = None
    bridge: Optional[str] = None


class GenerationStreamChunk(BaseModel):
    type: Literal["option", "summary", "done", "error"]
    option_index: Optional[int] = None
    option: Optional[OptionResponse] = None
    error: Optional[str] = None


# ─── Concept Schemas ──────────────────────────────────────────────────────────

class ApprovalRequest(BaseModel):
    option_ids: list[str] = Field(..., min_length=1)


class ConceptResponse(BaseModel):
    id: str
    concept_code: str
    ad_name: str
    option_id: str
    persona: Optional[str] = None
    final_prompt: str
    prompt_version: str
    status: ConceptStatus
    approved_by: str
    approved_at: datetime
    ad_id: Optional[str] = None
    storyboard: Optional[StoryboardResponse] = None


class PromptRequest(BaseModel):
    concept_id: str


class AdLinkRequest(BaseModel):
    ad_id: str


class FeedbackRequest(BaseModel):
    rating: Literal["up", "down"]
    note: Optional[str] = None


# ─── AI run logging ───────────────────────────────────────────────────────────

class AIRunLog(BaseModel):
    session_id: str
    step: int
    model: str
    component_versions: dict[str, str]
    tokens_in: int
    tokens_out: int
    cost_usd: float
    latency_ms: int
    status: str
    error: Optional[str] = None
