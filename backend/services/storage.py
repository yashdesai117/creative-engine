"""
Storage and repository layer for Creative Engine sessions, options, and concepts.
Handles local in-memory persistence with Supabase Postgres compatibility.
"""

from typing import Optional, Any
from datetime import datetime
import uuid
import random
import string
from models.schemas import (
    SessionResponse,
    SessionStatus,
    Format,
    ProductResponse,
    OptionResponse,
    ConceptResponse,
    ConceptStatus,
)


class InMemoryStore:
    def __init__(self):
        self.sessions: dict[str, dict] = {}
        self.products: dict[str, dict] = {}
        self.options: dict[str, dict] = {}
        self.concepts: dict[str, dict] = {}

    def create_session(self, seller_id: str, format: Format, product_snapshot: Optional[dict] = None) -> SessionResponse:
        session_id = str(uuid.uuid4())
        now = datetime.utcnow()
        session_data = {
            "id": session_id,
            "seller_id": seller_id,
            "format": format,
            "status": SessionStatus.input,
            "product": product_snapshot,
            "selected_template_ids": [],
            "options": [],
            "concepts": [],
            "created_at": now,
            "updated_at": now,
        }
        self.sessions[session_id] = session_data
        return SessionResponse(
            id=session_id,
            seller_id=seller_id,
            format=format,
            status=SessionStatus.input,
            selected_template_ids=[],
            created_at=now,
            updated_at=now,
        )

    def get_session(self, session_id: str) -> Optional[dict]:
        return self.sessions.get(session_id)

    def list_sessions(self, seller_id: Optional[str] = None, status: Optional[str] = None) -> list[dict]:
        results = list(self.sessions.values())
        if seller_id:
            results = [s for s in results if s.get("seller_id") == seller_id]
        if status:
            results = [s for s in results if s.get("status") == status]
        return results

    def update_session(self, session_id: str, updates: dict) -> Optional[dict]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        session.update(updates)
        session["updated_at"] = datetime.utcnow()
        return session

    def save_options(self, session_id: str, options: list[dict]):
        session = self.sessions.get(session_id)
        if session:
            session["options"] = options
            session["status"] = SessionStatus.reviewing
            session["updated_at"] = datetime.utcnow()
        for opt in options:
            self.options[opt["id"]] = opt

    def get_option(self, option_id: str) -> Optional[dict]:
        return self.options.get(option_id)

    def update_option(self, option_id: str, updates: dict) -> Optional[dict]:
        opt = self.options.get(option_id)
        if not opt:
            return None
        opt.update(updates)
        opt["is_edited"] = True
        return opt

    def create_concept(
        self,
        session_id: str,
        option_id: str,
        ad_name: str,
        final_prompt: str = "",
        prompt_version: str = "1.0",
    ) -> dict:
        code = "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", k=8))
        concept_id = str(uuid.uuid4())
        concept_data = {
            "id": concept_id,
            "session_id": session_id,
            "concept_code": code,
            "option_id": option_id,
            "ad_name": ad_name,
            "final_prompt": final_prompt,
            "prompt_version": prompt_version,
            "status": ConceptStatus.approved,
            "approved_by": "growth_user",
            "approved_at": datetime.utcnow().isoformat(),
            "ad_id": None,
        }
        self.concepts[concept_id] = concept_data
        session = self.sessions.get(session_id)
        if session:
            session.setdefault("concepts", []).append(concept_data)
            session["status"] = SessionStatus.approved
        return concept_data

    def get_concept(self, concept_id: str) -> Optional[dict]:
        return self.concepts.get(concept_id)

    def update_concept(self, concept_id: str, updates: dict) -> Optional[dict]:
        c = self.concepts.get(concept_id)
        if not c:
            return None
        c.update(updates)
        return c


# Global in-memory instance
store = InMemoryStore()
