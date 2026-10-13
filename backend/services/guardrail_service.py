"""
Guardrail Service — enforces offer safety and claim validation.
Ensures offers stay within margin floor. CP is NEVER exposed.
"""

from config import settings
import structlog

log = structlog.get_logger()


# Approved claims per category
APPROVED_CLAIMS: dict[str, list[str]] = {
    "Jewellery": [
        "925 sterling silver",
        "Anti-tarnish coating",
        "Rhodium plated",
        "Gold plated",
        "Hypoallergenic",
        "Daily wear",
        "Water resistant",
        "Handcrafted",
        "Nickel free",
        "BIS hallmarked",
    ],
    "Fashion": [
        "100% cotton",
        "Breathable fabric",
        "Machine washable",
        "Pre-shrunk",
        "Colorfast",
        "Sustainable materials",
    ],
    "Beauty & Personal Care": [
        "Dermatologist tested",
        "Paraben free",
        "Sulfate free",
        "Cruelty free",
        "Vegan",
        "Natural ingredients",
    ],
    "Sports & Fitness": [
        "Anti-slip grip",
        "Latex free",
        "Eco-friendly material",
        "Durable",
        "Professional grade",
    ],
    "default": ["Genuine product", "Quality assured", "Made in India"],
}

ALLOWED_OFFER_TYPES = [
    "percentage_off",
    "bundle",
    "free_shipping",
    "prepaid_incentive",
    "limited_time",
]


class GuardrailService:
    """
    FR-22, Section 9 — Enforces offer and claim guardrails.
    Runs server-side — not just discouraged in prompts.
    """

    def __init__(self, margin_floor: float = None):
        self.margin_floor = margin_floor or settings.MARGIN_FLOOR_DEFAULT

    def validate_offer(
        self,
        offer: str,
        sp: float,
        cp: float,  # Only available server-side from product_costs table
        mrp: float,
        discount_headroom: float,
    ) -> tuple[bool, str]:
        """
        Validate that an offer doesn't push margin below floor.
        Returns (is_valid, rejection_reason).
        CP is only available here — never in the LLM prompt.
        """
        # Check if offer would require additional discount
        extracted_discount = self._extract_discount_percent(offer)

        if extracted_discount is not None:
            effective_sp = sp * (1 - extracted_discount / 100)
            gross_margin = (effective_sp - cp) / effective_sp * 100

            if gross_margin < self.margin_floor:
                return False, (
                    f"Offer would reduce gross margin to {gross_margin:.1f}%, "
                    f"below the {self.margin_floor}% floor."
                )

        return True, ""

    def validate_claims(
        self, claims: list[str], category: str, product_description: str
    ) -> tuple[list[str], list[str]]:
        """
        FR-22 — Check claims against approved list for category.
        Returns (approved_claims, rejected_claims).
        """
        approved = APPROVED_CLAIMS.get(category, []) + APPROVED_CLAIMS["default"]

        # Case-insensitive check
        approved_lower = [a.lower() for a in approved]

        valid = []
        rejected = []

        for claim in claims:
            claim_lower = claim.lower()
            # Check approved list
            if any(approved_claim in claim_lower for approved_claim in approved_lower):
                valid.append(claim)
            # Check if claim exists in product description
            elif claim_lower in product_description.lower():
                valid.append(claim)
            else:
                rejected.append(claim)

        return valid, rejected

    def get_margin_band(self, sp: float, cp: float) -> str:
        """
        Convert CP + SP to a margin band string for the LLM.
        CP is never sent to the LLM — only the band.
        """
        margin = (sp - cp) / sp * 100
        if margin < 20:
            return "10-20%"
        elif margin < 35:
            return "20-35%"
        elif margin < 50:
            return "35-50%"
        elif margin < 65:
            return "50-65%"
        else:
            return "65%+"

    def get_discount_headroom(self, sp: float, cp: float, mrp: float) -> float:
        """
        How much additional discount (% of SP) the offer can propose
        while keeping gross margin above the floor.
        """
        min_sp = cp / (1 - self.margin_floor / 100)
        max_additional_discount = max(0, (sp - min_sp) / sp * 100)
        return round(max_additional_discount, 1)

    def _extract_discount_percent(self, offer: str) -> float | None:
        """Try to extract a discount percentage from an offer string."""
        import re
        match = re.search(r"(\d+)%\s*off", offer.lower())
        if match:
            return float(match.group(1))
        return None
