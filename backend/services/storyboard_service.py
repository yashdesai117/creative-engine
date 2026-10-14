"""
Storyboard Service — Translates approved concepts into 9-beat direct-response scripts
and multi-scene video storyboards anchoring character consistency and real product fidelity.
"""

from models.schemas import (
    OptionCandidate,
    OptionSummary,
    ProductResponse,
    TemplateResponse,
    AICharacterProfile,
    NineBeatScript,
    StoryboardScene,
    StoryboardResponse,
)
from services.character_service import character_service
import structlog

log = structlog.get_logger()


class StoryboardService:
    """
    Builds Eugene Schwartz / Claude Hopkins compliant 9-beat scripts
    and compiles multi-scene visual storyboards for video generation models.
    """

    def generate_nine_beat_script(
        self,
        candidate: OptionCandidate,
        summary: OptionSummary,
        product: ProductResponse,
        character: AICharacterProfile,
    ) -> NineBeatScript:
        """
        Assemble the complete 9-beat direct response sales argument:
        1. Hook (0-3s)
        2. Problem Agitation (3-12s)
        3. The Bridge (12-16s)
        4. Promise (16-20s)
        5. Mechanism (20-26s)
        6. Objection Handling (26-32s)
        7. Proof / Demonstration (32-38s)
        8. Offer (38-42s)
        9. Risk Reversal & CTA (42-45s)
        """
        # 1. Hindi Voiceover Script (Devanagari) — Human-Writing Standard
        # Conversational, personal, honest reactions — zero promotional AI slop
        hindi_hook = "डोंट जज मी, पर मैंने ये नेकलेस पहन के शावर ले लिया!"
        hindi_agitation = "क्योंकि पिछली बार जो चेन्स ली थीं, वो दो दिन में ही पसीने से काली पड़ गई थीं और स्किन पर हरा निशान छोड़ दिया था।"
        hindi_bridge = "गलती आपकी या मेरी नहीं है — बाज़ार में सस्ती ब्रास मेटल पर चांदी की पतली पॉलिश चिपका देते हैं। बट लुक एट दिस फिनिश।"
        hindi_promise = f"लेकिन {product.title} के साथ ऐसा बिल्कुल नहीं होता। मैं खुद इसे हफ़्तों से रोज़ पहन रही हूँ।"
        hindi_mechanism = "इसका बेस असली 925 स्टर्लिंग सिल्वर है, जिसपर रोडियम की कोटिंग है जो कभी काली नहीं पड़ती।"
        hindi_objection_proof = "जिम हो या शावर, स्किन पर कोई रैश नहीं होता। 12 हज़ार से ज़्यादा लड़कियाँ इसे पहन रही हैं।"
        hindi_offer_cta = f"वेबसाइट पर अभी फ्लैट {product.discount_percent:.0f}% ऑफ में सिर्फ ₹{product.sp:.0f} का मिल रहा है, 7-दिन की कम्प्लीट एक्सचेंज गारंटी के साथ। अभी नीचे टैप करके अपना सेट सिक्योर कर लो!"

        full_hindi = f"{hindi_hook} {hindi_agitation} {hindi_bridge} {hindi_promise} {hindi_mechanism} {hindi_objection_proof} {hindi_offer_cta}"

        # English / Andromeda transcript reference (humanized)
        hook_audio = (
            summary.hook_layers.audio
            if summary.hook_layers and summary.hook_layers.audio
            else "Don't judge me, but I literally took a shower wearing this layered necklace..."
        )

        problem_text = (
            f"If you're dealing with {candidate.problem.lower()}, cheap chains tarnish and leave ugly green marks on your skin within days."
        )

        bridge_text = (
            summary.bridge
            if summary.bridge
            else "It's not your skin's fault — most brands just wash thin silver over cheap brass. But look at this finish."
        )

        promise_text = (
            f"I wear {product.title} everyday, and it looks just as shiny as day one."
        )

        mechanism_text = (
            "Pure 925 sterling silver hallmarked core, sealed with anti-tarnish rhodium plating."
        )

        objection_text = "Completely hypoallergenic and nickel-free, even for super sensitive skin."
        proof_text = "Over 12,000+ verified customer reviews across India."
        offer_text = f"Flat {product.discount_percent:.0f}% off today at ₹{product.sp:.0f} with premium gift box."
        risk_cta_text = f"7-day risk-free exchange guarantee with flat {product.discount_percent:.0f}% off at ₹{product.sp:.0f}. Tap the link below to secure your 3-layer set before this batch sells out!"

        return NineBeatScript(
            hook=hook_audio,
            problem_agitation=problem_text,
            bridge=bridge_text,
            promise=promise_text,
            mechanism=mechanism_text,
            objection_handling=objection_text,
            proof=proof_text,
            offer=offer_text,
            risk_reversal_cta=risk_cta_text,
            hindi_full_voiceover=full_hindi,
        )

    def build_storyboard(
        self,
        concept_id: str,
        candidate: OptionCandidate,
        summary: OptionSummary,
        product: ProductResponse,
        character: AICharacterProfile,
        script: NineBeatScript,
        aspect_ratio: str = "9:16",
    ) -> StoryboardResponse:
        """
        Translates the strategic script into MAX 2 PARTS (8–10 seconds each)
        specifically engineered for Google Veo / Google Flow generation limits.
        Spoken audio is provided in Hindi (Devanagari) to guarantee zero pronunciation errors.
        """
        char_anchor = character.visual_anchor_prompt

        scenes = [
            # ─────────────────────────────────────────────────────────────────
            # PART 1 (0–9 Seconds): HOOK & THE BRIDGE (AVOID ABRUPT PRODUCT DROP)
            # ─────────────────────────────────────────────────────────────────
            StoryboardScene(
                scene_number=1,
                part_number=1,
                beat_name="Part 1 (0–9s): The 3-Layer Hook & The Problem Bridge",
                duration_seconds=9.0,
                keyframe_image_prompt=(
                    f"Photorealistic 8k vertical keyframe (9:16) for Midjourney / Nano Banana / Flux: "
                    f"Medium portrait of {character.name} ({char_anchor}), an authentic 26yo Indian woman with warm wheatish skin, "
                    f"wavy dark hair, small round maroon bindi, wearing a solid pastel lilac-lavender linen button-down shirt. "
                    f"She is seated at a wooden dressing table mirror in a sunlit Bangalore bedroom (soft 4500K morning daylight). "
                    f"SHE IS ALREADY WEARING the {product.title} on her collarbone: EXACTLY 3 delicate sterling silver chains (16\", 18\", 20\") "
                    f"with 1 tiny crescent moon pendant and 1 tiny star pendant (STRICT MATCH to reference image GCNK-221, NO extra chains, NO coin charms). "
                    f"She touches the moon pendant gently, looking into the mirror with an amused, candid confession expression. 35mm f/1.8 lens, natural pores, zero plastic wax sheen."
                ),
                video_motion_prompt=(
                    f"Google Veo / Flow Image-to-Video prompt: "
                    f"Animate from Keyframe 1. {character.name} touches the layered necklace on her collarbone in the mirror (0-2s), "
                    f"then turns warmly to camera at 2.5s with a playful, candid smile as she speaks Part 1 dialogue. "
                    f"Conversational gentle handheld camera, natural lip sync, speech finishes comfortably at 7.2s leaving 1.8s visual buffer. "
                    f"NO product changing, NO extra chain layers. 24fps cinematic realism."
                ),
                visual_prompt=(
                    f"Single continuous environment: Sunlit Bangalore bedroom vanity. "
                    f"{character.name} in solid lilac linen shirt with maroon bindi, wearing {product.title} (3 fine chains, moon and star charms). "
                    f"Turns to camera and gestures candidly to the necklace on her neck. Warm natural lighting, 9:16 vertical."
                ),
                spoken_audio_hindi=(
                    "डोंट जज मी, पर मैंने ये पहन के शावर ले लिया... क्योंकि पुरानी चेन्स दो दिन में ही काली पड़ जाती थीं! बट लुक एट दिस फिनिश।"
                ),
                spoken_audio_hinglish=(
                    "Don't judge me, par maine yeh pehen ke shower le liya... kyunki purani chains 2 din mein hi kaali pad jaati thi! But look at this finish."
                ),
                spoken_audio=f"{script.hook} {script.bridge}",
                text_overlay="डोंट जज मी... 🚿❌",
                camera_motion="Conversational handheld eye-level, gentle punch-in at 2.5s to collarbone",
                technical_consistency_anchors=(
                    f"Character Seed: {character.name}_{character.id} (maroon bindi, wavy hair) | "
                    f"Wardrobe: Pastel lilac linen shirt (fixed across both parts) | "
                    f"Location: Bangalore bedroom vanity (fixed across both parts) | "
                    f"Product: GCNK-221 3-layer silver necklace only | Aspect: 9:16 Vertical"
                ),
            ),
            # ─────────────────────────────────────────────────────────────────
            # PART 2 (9–18 Seconds): EXACT SAME SCENE — MECHANISM & MEANINGFUL CTA
            # ─────────────────────────────────────────────────────────────────
            StoryboardScene(
                scene_number=2,
                part_number=2,
                beat_name="Part 2 (9–18s): 925 Hallmark Mechanism & Meaningful Risk-Reversal CTA",
                duration_seconds=9.0,
                keyframe_image_prompt=(
                    f"Photorealistic 8k vertical keyframe (9:16) for Midjourney / Nano Banana / Flux: "
                    f"EXACT SAME SCENE CONTINUITY: Same sunlit Bangalore bedroom vanity, same 4500K soft daylight, same woman {character.name} "
                    f"in the same pastel lilac linen shirt with maroon bindi. "
                    f"Close-up framing on her collarbone and hand: she gently tilts the {product.title} clasp and pendant towards camera, "
                    f"revealing the razor-sharp laser-engraved '925' hallmark stamp with high-mirror rhodium anti-tarnish gleam. "
                    f"The 3 delicate silver chains (lengths 16\", 18\", 20\") lie neatly across her skin without tangling or extra layers. "
                    f"Shallow depth of field, 85mm f/2.0 portrait macro, ultra-crisp metallic texture, zero AI plastic sheen."
                ),
                video_motion_prompt=(
                    f"Google Veo / Flow Image-to-Video prompt: "
                    f"Animate from Keyframe 2. MATCHING SCENE CONTINUITY: Camera glides across the sharp '925' hallmark stamp and gleaming silver chains (0-3s), "
                    f"then tilts smoothly up to {character.name}'s smiling face (3-5s) as she delivers Part 2 dialogue in the same lilac shirt. "
                    f"Speech completes cleanly at 7.4s. At 7.8s she gestures warmly down towards the offer badge. "
                    f"Graphic overlay appears: 'FLAT {product.discount_percent:.0f}% OFF · ₹{product.sp:.0f} · 7-DAY GUARANTEE'. 24fps cinematic realism."
                ),
                visual_prompt=(
                    f"SAME ROOM & OUTFIT CONTINUITY: Close-up on 925 hallmark stamp on Ananya's neck, "
                    f"tilts to her confident smile in same room, wearing same lilac shirt. "
                    f"Animated lower-third offer badge: Flat {product.discount_percent:.0f}% OFF · ₹{product.sp:.0f} · 7-Day Exchange Guarantee."
                ),
                spoken_audio_hindi=(
                    f"ये रियल 925 सिल्वर है विथ रोडियम—ज़ीरो टार्निश! वेबसाइट पर अभी फ्लैट {product.discount_percent:.0f}% ऑफ में सिर्फ ₹{product.sp:.0f} का है, 7-दिन की एक्सचेंज गारंटी के साथ। अभी नीचे टैप करके अपना सेट सिक्योर कर लो!"
                ),
                spoken_audio_hinglish=(
                    f"Yeh real 925 silver hai with rhodium—zero tarnish! Website pe abhi flat {product.discount_percent:.0f}% off mein sirf Rs. {product.sp:.0f} ka hai, 7-day exchange guarantee ke saath. Abhi neeche tap karke apna set secure kar lo!"
                ),
                spoken_audio=f"{script.mechanism} {script.offer} {script.risk_reversal_cta}",
                text_overlay=f"Real 925 Silver ✨ • Flat {product.discount_percent:.0f}% Off • सिर्फ ₹{product.sp:.0f} • 7-Day Guarantee 👇",
                camera_motion="Macro punch on 925 hallmark, smooth tilt up to hero smile and tap gesture",
                technical_consistency_anchors=(
                    f"SAME CHARACTER: {character.name}_{character.id} with lilac shirt & maroon bindi | "
                    f"SAME LOCATION: Bangalore bedroom vanity | "
                    f"SAME PRODUCT: GCNK-221 (strictly 3 chains, star & moon pendants) | Aspect: 9:16 Vertical"
                ),
            ),
        ]

        total_duration = sum(s.duration_seconds for s in scenes)

        return StoryboardResponse(
            concept_id=concept_id,
            character=character,
            script=script,
            scenes=scenes,
            total_parts=2,
            total_duration_seconds=total_duration,
            aspect_ratio=aspect_ratio,
            status="ready_for_render",
        )


storyboard_service = StoryboardService()
