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

class OptionCandidate(BaseModel):
    """AI step 1 output — structured concept candidate."""
    problem: str = Field(..., description="Specific pain point or desire/motivation")
    angle: str = Field(..., description="Strategic messaging approach with component(s) named")
    offer: str = Field(..., description="Value framing — must be within margin guardrails")
    angle_components: list[str] = Field(default_factory=list)


class OptionSummary(BaseModel):
    """AI step 2 output — how the option appears in the template."""
    hook_line: str = Field(..., description="First 3 seconds — the scroll-stopper")
    how_it_looks: str = Field(..., description="How this would appear in the chosen template")
    rationale: str = Field(..., description="Strategic reasoning tied to the persona/product")
    offer_line: str = Field(..., description="Final offer presentation")
    claims_used: list[str] = Field(default_factory=list, description="Product claims relied upon")
    score: Optional[int] = Field(None, ge=0, le=100)


class OptionResponse(BaseModel):
    id: str
    session_id: str
    template_id: str
    problem: str
    angle: str
    offer: str
    hook_line: str
    summary: str
    rationale: str
    claims_used: list[str]
    status: str
    is_edited: bool
    score: Optional[int] = None
    component_versions: dict[str, str] = {}
    created_at: datetime


class OptionUpdateRequest(BaseModel):
    problem: Optional[str] = None
    angle: Optional[str] = None
    offer: Optional[str] = None
    hook_line: Optional[str] = None


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
    final_prompt: str
    prompt_version: str
    status: ConceptStatus
    approved_by: str
    approved_at: datetime
    ad_id: Optional[str] = None


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
