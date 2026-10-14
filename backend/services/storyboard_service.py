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
            # PART 1 (0–9 Seconds): THE HOOK, FRICTION & THE BRIDGE
            # ─────────────────────────────────────────────────────────────────
            StoryboardScene(
                scene_number=1,
                part_number=1,
                beat_name="Part 1 (0–9s): The 3-Layer Hook & Friction Bridge",
                duration_seconds=9.0,
                visual_prompt=(
                    f"Google Veo / Flow prompt (Part 1, 9:16 vertical): "
                    f"Cinematic handheld medium shot of {character.name} ({char_anchor}). "
                    f"She holds a dull, tarnished necklace near her collarbone with a relatable, frustrated expression, "
                    f"then gestures in realization as soft warm indoor daylight illuminates the scene. "
                    f"Natural Indian apartment interior background, subtle 35mm bokeh, smooth conversational camera motion, "
                    f"photorealistic skin texture, no AI plastic glaze."
                ),
                spoken_audio_hindi=(
                    "अगर आपकी चांदी की ज्वेलरी भी कुछ ही हफ़्तों में काली पड़ जाती है और स्किन हरी हो जाती है — "
                    "तो ये 3 सेकंड ध्यान से सुनिए। बाज़ार की सस्ती ज्वेलरी ब्रास पर सिर्फ पतली पॉलिश होती है जो पसीने से उतर जाती है!"
                ),
                spoken_audio_hinglish=(
                    "Agar aapki silver jewellery bhi kuch hi hafton mein kaali pad jaati hai aur skin hari ho jaati hai — "
                    "toh yeh 3 second dhyan se suniye. Bazaar ki sasti jewellery brass par sirf patli polish hoti hai jo paseene se utar jaati hai!"
                ),
                spoken_audio=f"{script.hook} {script.problem_agitation} {script.bridge}",
                text_overlay="चांदी 2 हफ़्ते में काली क्यों पड़ती है? ❌",
                camera_motion="Conversational handheld eye-level, gentle punch-in at 2.5s",
                technical_consistency_anchors=(
                    f"Character Seed: {character.name}_{character.id} | "
                    f"Lighting: Warm 4500K soft daylight, 35mm f/1.8 lens | "
                    f"Palette: Warm neutral pastels | Aspect: 9:16 Vertical"
                ),
            ),
            # ─────────────────────────────────────────────────────────────────
            # PART 2 (9–18 Seconds): THE MECHANISM, PROOF & MARGIN-SAFE OFFER
            # ─────────────────────────────────────────────────────────────────
            StoryboardScene(
                scene_number=2,
                part_number=2,
                beat_name="Part 2 (9–18s): Unique Mechanism, Proof & Margin-Safe Offer",
                duration_seconds=9.0,
                visual_prompt=(
                    f"Google Veo / Flow prompt (Part 2, 9:16 vertical): "
                    f"MATCHING SCENE CONTINUITY: Seamless transition from Part 1 with identical lighting and color grade. "
                    f"Extreme macro close-up of {product.title} (STRICT MATCH to attached reference product image — do not redraw). "
                    f"Pristine gleaming silver shine, sharp laser hallmark 925 engraving visible, water droplet rolling off anti-tarnish rhodium layer. "
                    f"Cuts smoothly to {character.name} wearing the necklace with a radiant, confident smile against the same warm indoor background. "
                    f"Bottom safe-zone animated badge: 'FLAT 60% OFF · ₹{product.sp:.0f}'."
                ),
                spoken_audio_hindi=(
                    f"लेकिन ये है ग्लोक्राफ्ट 925 स्टर्लिंग सिल्वर, जिसपर है 100% रोडियम एंटी-टार्निश शील्ड। "
                    f"चाहे रोज़ पहनो, चमक हमेशा नई जैसी रहेगी! आज स्पेशल ऑफर में सिर्फ ₹{product.sp:.0f} — नीचे टैप करके अभी मँगवाएँ!"
                ),
                spoken_audio_hinglish=(
                    f"Lekin yeh hai GlowCraft 925 sterling silver, jispar hai 100% rhodium anti-tarnish shield. "
                    f"Chahe roz pehno, chamak hamesha nayi jaisi rahegi! Aaj special offer mein sirf Rs. {product.sp:.0f} — neeche tap karke abhi mangwayein!"
                ),
                spoken_audio=f"{script.promise} {script.mechanism} {script.proof} {script.offer} {script.risk_reversal_cta}",
                text_overlay=f"100% Rhodium 925 Silver ✨ • Flat {product.discount_percent:.0f}% Off • सिर्फ ₹{product.sp:.0f} 👇",
                camera_motion="Macro slow glide orbit across hallmark, transitioning to medium hero smile",
                technical_consistency_anchors=(
                    f"Match Part 1 Character Seed: {character.name}_{character.id} | "
                    f"Product Anchor: Reference product image GCNK-221 geometry locked | "
                    f"Lighting: 4500K continuous key light | Aspect: 9:16 Vertical"
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
