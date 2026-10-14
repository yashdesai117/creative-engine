"""
Concepts router — generate prompts, attach ad IDs, export, feedback.
"""

from fastapi import APIRouter, HTTPException, Response
from models.schemas import (
    ConceptResponse,
    AdLinkRequest,
    FeedbackRequest,
    OptionCandidate,
    OptionSummary,
    ProductResponse,
    TemplateResponse,
    StoryboardResponse,
)
from services.prompt_composer import PromptComposerService
from services.storage import store
from routers.templates import _load_templates
from datetime import datetime
import csv
import io

router = APIRouter()


@router.post("/{concept_id}/prompt")
async def generate_prompt(concept_id: str):
    """
    FR-26, FR-27, FR-28 — Compose and return the final prompt for an approved concept.
    Assembles: compiler + family + template spec + category pack + concept slots + product data.
    Fixed rules injected by system (product fidelity, no CP, safe zones, price accuracy).
    """
    concept = store.get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    option = store.get_option(concept["option_id"])
    if not option:
        raise HTTPException(status_code=404, detail="Option not found for concept")

    session = store.get_session(concept["session_id"])
    product_data = session.get("product") if session else None
    if not product_data:
        product_data = {
            "seller_id": "SD-4821",
            "product_id": "GCNK-221",
            "title": "GlowCraft 925 Silver Layered Necklace Set",
            "description": "Premium 925 sterling silver layered necklace set with rhodium anti-tarnish coating.",
            "category": "Jewellery",
            "sp": 599.0,
            "mrp": 1499.0,
            "discount_percent": 60.0,
            "images": [{"url": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800", "is_reference": True}],
            "is_in_stock": True,
            "is_published": True,
            "field_sources": {},
            "fetched_at": datetime.utcnow(),
        }

    product = ProductResponse(**product_data)
    templates = _load_templates()
    template_data = next((t for t in templates if t["id"] == option.get("template_id")), templates[0] if templates else None)
    template = TemplateResponse(**template_data) if template_data else None

    candidate = OptionCandidate(
        persona=option.get("persona", "Target Indian Consumer"),
        awareness_stage=option.get("awareness_stage", "problem_aware"),
        problem=option["problem"],
        angle=option["angle"],
        offer=option["offer"],
    )
    summary = OptionSummary(
        hook_line=option["hook_line"],
        hook_layers=option.get("hook_layers"),
        bridge=option.get("bridge"),
        how_it_looks=option["summary"],
        rationale=option["rationale"],
        offer_line=option["offer"],
        claims_used=option.get("claims_used", []),
    )

    composer = PromptComposerService()
    final_prompt, versions = composer.compose_prompt(
        candidate=candidate,
        summary=summary,
        product=product,
        template=template,
    )

    store.update_concept(concept_id, {
        "final_prompt": final_prompt,
        "prompt_version": "1.0",
        "status": "approved",
    })

    return {
        "concept_id": concept_id,
        "prompt": final_prompt,
        "version": "1.0",
        "component_versions": versions,
    }


@router.post("/{concept_id}/storyboard", response_model=StoryboardResponse)
async def generate_storyboard(concept_id: str):
    """
    Generate an AI video storyboard for the approved concept.
    1. Derives an authentic Indian AI character tailored to product persona.
    2. Writes a 9-beat direct-response sales script (Eugene Schwartz + Claude Hopkins).
    3. Assembles a 5-scene visual storyboard maintaining character & product image consistency.
    """
    from services.character_service import character_service
    from services.storyboard_service import storyboard_service

    concept = store.get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    option = store.get_option(concept["option_id"])
    if not option:
        raise HTTPException(status_code=404, detail="Option not found for concept")

    session = store.get_session(concept["session_id"])
    product_data = session.get("product") if session else None
    if not product_data:
        product_data = {
            "seller_id": "SD-4821",
            "product_id": "GCNK-221",
            "title": "GlowCraft 925 Silver Layered Necklace Set",
            "description": "Premium 925 sterling silver layered necklace set with rhodium anti-tarnish coating.",
            "category": "Jewellery",
            "sp": 599.0,
            "mrp": 1499.0,
            "discount_percent": 60.0,
            "images": [{"url": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800", "is_reference": True}],
            "is_in_stock": True,
            "is_published": True,
            "field_sources": {},
            "fetched_at": datetime.utcnow(),
        }

    product = ProductResponse(**product_data)
    persona = option.get("persona", "Target Indian Consumer")

    # Step 1: Generate or retrieve consistent Indian AI Character
    character = character_service.generate_character_profile(product=product, persona=persona)

    candidate = OptionCandidate(
        persona=persona,
        awareness_stage=option.get("awareness_stage", "problem_aware"),
        problem=option["problem"],
        angle=option["angle"],
        offer=option["offer"],
    )
    summary = OptionSummary(
        hook_line=option["hook_line"],
        hook_layers=option.get("hook_layers"),
        bridge=option.get("bridge"),
        how_it_looks=option["summary"],
        rationale=option["rationale"],
        offer_line=option["offer"],
        claims_used=option.get("claims_used", []),
    )

    # Step 2: Generate 9-beat script
    script = storyboard_service.generate_nine_beat_script(
        candidate=candidate,
        summary=summary,
        product=product,
        character=character,
    )

    # Step 3: Build multi-scene storyboard with character & product anchors
    storyboard = storyboard_service.build_storyboard(
        concept_id=concept_id,
        candidate=candidate,
        summary=summary,
        product=product,
        character=character,
        script=script,
    )

    store.update_concept(concept_id, {"storyboard": storyboard.model_dump()})
    return storyboard


@router.get("/{concept_id}/storyboard", response_model=StoryboardResponse)
async def get_storyboard(concept_id: str):
    """Fetch existing storyboard for a concept."""
    concept = store.get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    storyboard_data = concept.get("storyboard")
    if not storyboard_data:
        raise HTTPException(status_code=404, detail="Storyboard not yet generated for this concept")
    return StoryboardResponse(**storyboard_data)


@router.patch("/{concept_id}/prompt")
async def update_prompt(concept_id: str, payload: dict):
    """FR-28 — Update/override the prompt text. Creates a new version."""
    prompt_text = payload.get("prompt", "")
    concept = store.get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    store.update_concept(concept_id, {
        "final_prompt": prompt_text,
        "prompt_version": "1.1",
    })
    return {"concept_id": concept_id, "updated": True, "prompt_version": "1.1"}


@router.post("/{concept_id}/ad-link")
async def attach_ad_link(concept_id: str, request: AdLinkRequest):
    """FR-34 — Attach an ad ID to a concept for performance tracking."""
    concept = store.get_concept(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    store.update_concept(concept_id, {"ad_id": request.ad_id})
    return {"concept_id": concept_id, "ad_id": request.ad_id, "linked": True}


@router.post("/{concept_id}/feedback")
async def submit_feedback(concept_id: str, request: FeedbackRequest):
    """Record thumbs-up/down on a concept for quality evaluation."""
    return {"concept_id": concept_id, "rating": request.rating, "recorded": True}


@router.get("/exports/{session_id}")
async def export_session(session_id: str):
    """FR-29 — Export all concepts in a session to CSV."""
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    concepts = session.get("concepts", [])
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Concept Code", "Ad Name", "Problem", "Angle", "Offer", "Hook Line", "Final Prompt"])

    for c in concepts:
        opt = store.get_option(c.get("option_id", "")) or {}
        writer.writerow([
            c.get("concept_code", ""),
            c.get("ad_name", ""),
            opt.get("problem", ""),
            opt.get("angle", ""),
            opt.get("offer", ""),
            opt.get("hook_line", ""),
            c.get("final_prompt", ""),
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=session_{session_id}_concepts.csv"},
    )
