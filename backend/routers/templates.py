"""
Templates router — list, filter, and manage templates.
"""

from fastapi import APIRouter, Query
from models.schemas import TemplateResponse, TemplateSpec, TextSlot
from typing import Optional
import json
from pathlib import Path

router = APIRouter()

# Load templates from seed file
TEMPLATES_PATH = Path(__file__).parent.parent / "data" / "templates.json"


def _load_templates() -> list[dict]:
    if TEMPLATES_PATH.exists():
        return json.loads(TEMPLATES_PATH.read_text())
    return []


@router.get("", response_model=list[TemplateResponse])
async def list_templates(
    format: Optional[str] = Query(None, description="Filter by format: banner or video"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    status: str = Query("active", description="Filter by status"),
):
    """
    FR-12 — Return templates filtered by format and category.
    Only active templates with matching category are shown.
    """
    templates = _load_templates()

    if format:
        templates = [t for t in templates if t.get("format") == format]
    if category:
        templates = [t for t in templates if category in t.get("categories", [])]
    templates = [t for t in templates if t.get("status", "active") == status]

    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str):
    templates = _load_templates()
    template = next((t for t in templates if t["id"] == template_id), None)
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")
    return template
