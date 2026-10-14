"""
Character Service — Generates consistent Indian AI characters tailored to product persona.
Maintains visual and demographic continuity across multi-scene video creatives.
"""

from models.schemas import AICharacterProfile, ProductResponse
import structlog
import uuid

log = structlog.get_logger()


class CharacterService:
    """
    Manages AI Character generation and consistency.
    Rule: Always Indian unless specified otherwise.
    Gender, age, styling, and tone vary according to the product & target persona.
    """

    def generate_character_profile(
        self,
        product: ProductResponse,
        persona: str | None = None,
        custom_ethnicity: str = "Indian",
    ) -> AICharacterProfile:
        """
        Derive an authentic Indian AI character tailored to product category, price point, and persona.
        """
        category = product.category.lower() if product.category else "general"
        sp = product.sp

        # Demographic rules based on product & category
        if "jewellery" in category:
            name = "Ananya" if sp < 1500 else "Meera"
            gender = "Female"
            age_range = "24–29" if sp < 1000 else "28–35"
            context = "Urban Indian working professional in Bangalore/Mumbai, wears contemporary chic attire, balances office wear with minimalist aesthetic jewellery"
            appearance = "Warm wheatish skin tone, expressive brown eyes, shoulder-length subtle wavy dark hair, natural radiant makeup"
            clothing = "Crisp pastel linen button-down shirt or elegant solid monochrome collar dress"
        elif "beauty" in category or "personal care" in category:
            name = "Rhea" if "hair" in product.title.lower() else "Pooja"
            gender = "Female"
            age_range = "22–32"
            context = "Modern Indian woman dealing with city pollution, hard water, and hectic daily routine, values clean science-backed daily care"
            appearance = "Glowing natural Indian skin texture, genuine relatable smile, soft tied-back hair"
            clothing = "Clean white organic cotton lounge tee or relaxed linen aesthetic"
        elif "fashion" in category or "apparel" in category:
            name = "Kavya"
            gender = "Female"
            age_range = "23–30"
            context = "Fashion-conscious Indian creative professional, looks for versatile day-to-night styling"
            appearance = "Dusky warm Indian complexion, confident posture, modern layered hair"
            clothing = "Contemporary fusion silhouette, subtle tasteful silver accessories"
        elif "home" in category or "kitchen" in category:
            name = "Priya"
            gender = "Female"
            age_range = "28–38"
            context = "Modern Indian homemaker and working professional managing a smart, organized urban apartment"
            appearance = "Warm relatable Indian facial features, warm smile, neat ponytail"
            clothing = "Comfortable smart-casual kurti or cotton polo"
        else:
            name = "Aarav" if "men" in product.title.lower() else "Pooja"
            gender = "Male" if "men" in product.title.lower() else "Female"
            age_range = "25–34"
            context = "Relatable urban Indian consumer seeking reliable, quality daily solutions"
            appearance = "Warm Indian skin tone, clean groomed appearance, authentic relatable expression"
            clothing = "Casual smart urban everyday wear"

        if persona and persona != "Target Indian Consumer":
            context = f"{context}. Specifically tailored to persona: {persona}"

        # Master prompt that anchors visual consistency across Nano Banana, Grok, Kling, Midjourney, etc.
        visual_anchor = (
            f"Photorealistic 8k portrait of {name}, an authentic {age_range} year old {custom_ethnicity} {gender.lower()}, "
            f"{appearance}, wearing {clothing}. Natural cinematic lighting, neutral clean indoor background, "
            f"subtle depth of field, 35mm lens photography, true-to-life skin textures, non-stock authentic expression."
        )

        char_id = f"char_ind_{uuid.uuid4().hex[:8]}"

        return AICharacterProfile(
            id=char_id,
            name=name,
            ethnicity=custom_ethnicity,
            gender=gender,
            age_range=age_range,
            persona_context=context,
            appearance_traits=appearance,
            clothing_style=clothing,
            visual_anchor_prompt=visual_anchor,
            reference_image_url=None,
        )


character_service = CharacterService()
