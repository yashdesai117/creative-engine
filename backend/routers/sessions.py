"""
Sessions router — create, get, list sessions; trigger option generation.
"""

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from models.schemas import (
    SessionCreateRequest,
    SessionResponse,
    TemplateSelectionRequest,
    ApprovalRequest,
    ProductResponse,
    TemplateResponse,
    OptionResponse,
)
from services.llm_service import LLMService
from services.storage import store
from routers.templates import _load_templates
import json
import uuid
from datetime import datetime
import structlog
import asyncio

router = APIRouter()
log = structlog.get_logger()


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(request: SessionCreateRequest):
    """Create a new session after product input."""
    session = store.create_session(
        seller_id=request.seller_id,
        format=request.format,
    )
    return session


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    seller_id: str | None = Query(None),
    status: str | None = Query(None),
):
    """List sessions with optional filters."""
    sessions = store.list_sessions(seller_id=seller_id, status=status)
    return [
        SessionResponse(
            id=s["id"],
            seller_id=s["seller_id"],
            format=s["format"],
            status=s["status"],
            selected_template_ids=s.get("selected_template_ids", []),
            created_at=s["created_at"],
            updated_at=s["updated_at"],
        )
        for s in sessions
    ]


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Fetch a session by ID with all details."""
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{session_id}/templates")
async def set_templates(session_id: str, request: TemplateSelectionRequest):
    """Update selected templates for a session."""
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    store.update_session(session_id, {"selected_template_ids": request.template_ids})
    return {"session_id": session_id, "template_ids": request.template_ids}


@router.post("/{session_id}/options")
async def generate_options(session_id: str):
    """
    FR-16, FR-17, FR-18 — Stream option generation.
    Step 1: Concept candidates (Problem + Angle + Offer)
    Step 2: Option summaries (hook, how-it-looks, rationale)
    Returns Server-Sent Events stream.
    """
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    templates_data = _load_templates()
    selected_template_ids = session.get("selected_template_ids", [])
    selected_templates = [t for t in templates_data if t["id"] in selected_template_ids]
    if not selected_templates:
        selected_templates = templates_data[:1] if templates_data else []

    target_template = selected_templates[0] if selected_templates else None

    async def event_stream():
        llm = LLMService()

        # Build fallback product if not set
        product_dict = session.get("product") or {
            "seller_id": session["seller_id"],
            "product_id": "PROD-DEFAULT",
            "title": "GlowCraft 925 Silver Layered Necklace Set",
            "description": "Premium 925 sterling silver layered necklace with rhodium anti-tarnish coating.",
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
        product = ProductResponse(**product_dict)
        template = TemplateResponse(**target_template) if target_template else None

        yield f"data: {json.dumps({'type': 'phase', 'phase': 'candidates', 'message': 'Generating distinct Problem + Angle + Offer candidates...'})}\n\n"
        await asyncio.sleep(0.5)

        candidates = await llm.generate_option_candidates(
            product=product,
            template=template,
            margin_band="55-70%",
            discount_headroom=15.0,
            n_options=6,
        )

        yield f"data: {json.dumps({'type': 'phase', 'phase': 'summaries', 'message': 'Crafting 3-second hooks and template visual layouts...'})}\n\n"
        await asyncio.sleep(0.5)

        summaries = await llm.generate_option_summaries(
            candidates=candidates,
            product=product,
            template=template,
        )

        generated_options = []
        for i, (cand, summ) in enumerate(zip(candidates, summaries)):
            opt_id = f"opt-{uuid.uuid4().hex[:8]}"
            opt_data = {
                "id": opt_id,
                "session_id": session_id,
                "template_id": template.id if template else "tmpl-001",
                "persona": cand.persona,
                "awareness_stage": cand.awareness_stage,
                "problem": cand.problem,
                "angle": cand.angle,
                "offer": cand.offer,
                "hook_line": summ.hook_line,
                "hook_layers": summ.hook_layers.model_dump() if summ.hook_layers else None,
                "bridge": summ.bridge,
                "summary": summ.how_it_looks,
                "rationale": summ.rationale,
                "claims_used": summ.claims_used,
                "status": "reviewing",
                "is_edited": False,
                "score": summ.score or 90,
                "created_at": datetime.utcnow().isoformat(),
            }
            generated_options.append(opt_data)
            yield f"data: {json.dumps({'type': 'option', 'option_index': i, 'option': opt_data})}\n\n"
            await asyncio.sleep(0.1)

        store.save_options(session_id, generated_options)
        yield f"data: {json.dumps({'type': 'done', 'total': len(generated_options)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/{session_id}/approve")
async def approve_options(session_id: str, request: ApprovalRequest):
    """
    FR-24, FR-25 — Approve selected options, create concept records with unique concept codes and ad names.
    """
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    created_concepts = []
    for option_id in request.option_ids:
        option = store.get_option(option_id)
        template_slug = "custom"
        if option:
            templates = _load_templates()
            tmpl = next((t for t in templates if t["id"] == option.get("template_id")), None)
            if tmpl:
                template_slug = tmpl.get("slug", "custom")

        code = "".join(uuid.uuid4().hex[:8].upper())
        ad_name = f"{session['seller_id']}_{code}_{template_slug}_{session['format']}".upper()
        concept = store.create_concept(
            session_id=session_id,
            option_id=option_id,
            ad_name=ad_name,
        )
        created_concepts.append(concept)

    return {"session_id": session_id, "concepts": created_concepts}
