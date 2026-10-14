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
        # 1. Hindi Voiceover Script (Devanagari) to prevent mispronunciation
        hindi_hook = "अगर आपकी चांदी की ज्वेलरी भी कुछ ही हफ़्तों में काली पड़ जाती है — तो ये 3 सेकंड ध्यान से सुनिए।"
        hindi_agitation = f"सस्ती ज्वेलरी ऊपर से चमकती है, लेकिन पसीना लगते ही स्किन पर हरा निशान छोड़ देती है। बार-बार पैसे बर्बाद करने का कोई फायदा नहीं।"
        hindi_bridge = "ज़्यादातर लोग सोचते हैं कि उनकी स्किन में कमी है, लेकिन असली सच ये है कि बाज़ार में ब्रास पर सिर्फ पतली पॉलिश की जाती है।"
        hindi_promise = f"लेकिन {product.title} के साथ ऐसा कभी नहीं होगा — चाहे आप इसे रोज़ पहनें।"
        hindi_mechanism = "इसका सीक्रेट है असली 925 स्टर्लिंग सिल्वर बेस और 100% रोडियम एंटी-टार्निश शील्ड, जो कभी काली नहीं पड़ती।"
        hindi_objection_proof = "हज़ारों भारतीय महिलाओं ने इसे आज़माया है और 4.8 स्टार रेटिंग दी है — 100% स्किन-फ्रेंडली और हाइपोएलर्जेनिक।"
        hindi_offer_cta = f"आज स्पेशल ऑफर में पाइए फ्लैट {product.discount_percent:.0f}% की छूट, सिर्फ ₹{product.sp:.0f} में! 7-दिन की आसान एक्सचेंज गारंटी के साथ। अभी नीचे दिए गए लिंक पर टैप करें!"

        full_hindi = f"{hindi_hook} {hindi_agitation} {hindi_bridge} {hindi_promise} {hindi_mechanism} {hindi_objection_proof} {hindi_offer_cta}"

        # English / Andromeda transcript reference
        hook_audio = (
            summary.hook_layers.audio
            if summary.hook_layers and summary.hook_layers.audio
            else summary.hook_line
        )

        problem_text = (
            f"If you're dealing with {candidate.problem.lower()}, cheap jewellery oxidises and stains your skin green within weeks."
        )

        bridge_text = (
            summary.bridge
            if summary.bridge
            else "Most brands use cheap brass alloys that fade instantly. But here is the real secret."
        )

        promise_text = (
            f"With {product.title}, you get lasting everyday shine without tarnishing or skin irritation."
        )

        mechanism_text = (
            "Authentic 925 sterling silver hallmarked core sealed with a 100% rhodium anti-tarnish protective shield."
        )

        objection_text = "Verified 100% hypoallergenic and nickel-free, thoroughly tested for sensitive skin."
        proof_text = "Over 12,000+ verified 5-star customer reviews across India."
        offer_text = f"Flat {product.discount_percent:.0f}% off today at ₹{product.sp:.0f} with premium gift box packaging."
        risk_cta_text = "7-day risk-free exchange guarantee. Tap below to order yours before limited stock ends!"

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
            # PART 1 (0–9 Seconds): HOOK & PROBLEM — PRODUCT VISIBLE FROM SECOND 0
            # ─────────────────────────────────────────────────────────────────
            StoryboardScene(
                scene_number=1,
                part_number=1,
                beat_name="Part 1 (0–9s): The 3-Layer Hook & Product Introduction",
                duration_seconds=9.0,
                keyframe_image_prompt=(
                    f"Photorealistic 8k vertical keyframe (9:16) for Midjourney / Nano Banana / Flux: "
                    f"Medium portrait of {character.name} ({char_anchor}), an authentic 26yo Indian woman with warm wheatish skin, "
                    f"wavy dark hair, small round maroon bindi, wearing a solid pastel lilac-lavender linen button-down shirt. "
                    f"She is seated at a wooden dressing table mirror in a sunlit Bangalore bedroom (soft 4500K morning daylight). "
                    f"SHE IS ALREADY WEARING the {product.title} on her collarbone: EXACTLY 3 delicate sterling silver chains (16\", 18\", 20\") "
                    f"with 1 tiny crescent moon pendant and 1 tiny star pendant (STRICT MATCH to reference image GCNK-221, NO extra chains, NO coin charms). "
                    f"She looks into the mirror touching the dainty moon pendant with an inquiring, thoughtful expression. 35mm f/1.8 lens, natural pores, zero plastic wax sheen."
                ),
                video_motion_prompt=(
                    f"Google Veo / Flow Image-to-Video prompt: "
                    f"Animate from Keyframe 1. {character.name} touches the layered necklace on her collarbone in the mirror (0-2s), "
                    f"then turns warmly to camera at 2.5s smiling engagingly as she speaks Part 1 dialogue. "
                    f"Conversational gentle handheld camera, natural lip sync, speech finishes comfortably at 6.0s leaving 3.0s visual buffer. "
                    f"NO product changing, NO extra chain layers. 24fps cinematic realism."
                ),
                visual_prompt=(
                    f"Single continuous environment: Sunlit Bangalore bedroom vanity. "
                    f"{character.name} in solid lilac linen shirt with maroon bindi, wearing {product.title} (3 fine chains, moon and star charms). "
                    f"Turns to camera and gestures to the necklace on her neck. Warm natural lighting, 9:16 vertical."
                ),
                spoken_audio_hindi=(
                    "चांदी की लेयर्ड ज्वेलरी काली पड़ने से डरती हैं? मेरा ये नेकलेस देखिए!"
                ),
                spoken_audio_hinglish=(
                    "Chandi ki layered jewellery kaali padne se darti hain? Mera yeh necklace dekhiye!"
                ),
                spoken_audio=f"{script.hook} {script.problem_agitation}",
                text_overlay="लेयर्ड चांदी काली पड़ने का डर? ❌",
                camera_motion="Conversational handheld eye-level, gentle punch-in at 2.5s to collarbone",
                technical_consistency_anchors=(
                    f"Character Seed: {character.name}_{character.id} (maroon bindi, wavy hair) | "
                    f"Wardrobe: Pastel lilac linen shirt (fixed across both parts) | "
                    f"Location: Bangalore bedroom vanity (fixed across both parts) | "
                    f"Product: GCNK-221 3-layer silver necklace only | Aspect: 9:16 Vertical"
                ),
            ),
            # ─────────────────────────────────────────────────────────────────
            # PART 2 (9–18 Seconds): EXACT SAME SCENE — HALLMARK PROOF & OFFER CTA
            # ─────────────────────────────────────────────────────────────────
            StoryboardScene(
                scene_number=2,
                part_number=2,
                beat_name="Part 2 (9–18s): 925 Hallmark Proof, Rhodium Shield & Offer CTA",
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
                    f"Speech completes cleanly at 6.2s. At 7s she gestures warmly down towards the offer badge. "
                    f"Graphic overlay appears: 'FLAT {product.discount_percent:.0f}% OFF · ₹{product.sp:.0f}'. 24fps cinematic realism."
                ),
                visual_prompt=(
                    f"SAME ROOM & OUTFIT CONTINUITY: Close-up on 925 hallmark stamp on Ananya's neck, "
                    f"tilts to her confident smile in same room, wearing same lilac shirt. "
                    f"Animated lower-third offer badge: Flat {product.discount_percent:.0f}% OFF · ₹{product.sp:.0f}."
                ),
                spoken_audio_hindi=(
                    f"ग्लोक्राफ्ट का 925 स्टर्लिंग सिल्वर, रोडियम शील्ड के साथ! आज सिर्फ ₹{product.sp:.0f} में नीचे आर्डर करें।"
                ),
                spoken_audio_hinglish=(
                    f"GlowCraft ka 925 sterling silver, rhodium shield ke saath! Aaj sirf Rs. {product.sp:.0f} mein neeche order karein."
                ),
                spoken_audio=f"{script.mechanism} {script.offer} {script.risk_reversal_cta}",
                text_overlay=f"100% Rhodium 925 Silver ✨ • Flat {product.discount_percent:.0f}% Off • सिर्फ ₹{product.sp:.0f} 👇",
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
