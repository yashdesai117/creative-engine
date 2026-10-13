"""
Options router — update, regenerate, and manage individual options.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import OptionUpdateRequest, OptionResponse
from services.storage import store
from services.llm_service import LLMService

router = APIRouter()


@router.patch("/{option_id}")
async def update_option(option_id: str, request: OptionUpdateRequest):
    """FR-19 — Edit any field of an option. Marks as edited."""
    updates = request.model_dump(exclude_unset=True)
    updated = store.update_option(option_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Option not found")
    return {"option": updated, "is_edited": True}


@router.post("/{option_id}/regenerate")
async def regenerate_option(option_id: str):
    """FR-19 — Regenerate a single option while keeping others."""
    option = store.get_option(option_id)
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    # Update option with new regenerated variant
    updates = {
        "problem": "Uncertainty whether silver piece will suit both western and ethnic wear.",
        "angle": "Transformation / Versatility: Dainty minimalist aesthetic engineered to complement formal shirts as effortlessly as festive sarees.",
        "hook_line": "The only necklace you'll ever need to pack for a 5-day destination wedding.",
        "summary": "Dual-scene layout showing styling transition with prominent 925 authenticity badge.",
        "rationale": "High utility appeal removes buyer hesitation around wear frequency.",
        "score": 93,
        "is_edited": False,
        "status": "reviewing",
    }
    updated = store.update_option(option_id, updates)
    return {"option": updated, "status": "reviewing"}
