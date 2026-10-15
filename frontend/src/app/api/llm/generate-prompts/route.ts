import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { product, concepts, format, keys } = await req.json();

    if (!product || !concepts || !Array.isArray(concepts)) {
      return NextResponse.json(
        { error: "Product and approved concepts are required" },
        { status: 400 }
      );
    }

    const provider =
      keys?.defaultProvider === "claude" && keys?.claudeKey
        ? "claude"
        : keys?.geminiKey
        ? "gemini"
        : keys?.claudeKey
        ? "claude"
        : null;

    if (!provider) {
      return NextResponse.json(
        { error: "No active LLM API key found. Please enter a Gemini or Claude API key." },
        { status: 400 }
      );
    }

    const isVideo = format === "video";

    const systemPrompt = `You are a world-class prompt engineer and video storyboard director for AI video generation tools (Google Flow, Veo, Midjourney, Kling, Runway Gen-3).
You enforce the following mandatory rules:
1. Product Fidelity: The real product must be strictly anchored without hallucination or shape mutation.
2. Character Wardrobe Consistency: Characters MUST wear the exact same clothing throughout all scenes.
3. Dialogue Pacing (Human-Writing standard): Spoken dialogue must be 12-14 words maximum per scene clip (~5 seconds of speaking in an 8-9 second video) so characters never sound rushed or cut off.
4. Hindi Dialogue: Audio voiceovers MUST be written in natural conversational Hindi Devanagari script with everyday words.
5. The Bridge: Scene 2 must seamlessly connect the problem to the product mechanism.
6. Meaningful Risk-Reversal CTA: The ad must ask for the sale with a clear guarantee.`;

    const generatedPrompts = await Promise.all(
      concepts.map(async (concept: any, index: number) => {
        const option = concept.option || concept;
        const userPrompt = `Write the production-ready ${isVideo ? "2-Part Video Storyboard Prompt + Script" : "Meta Ad Image Prompt"} for this approved concept.

PRODUCT:
- Title: ${product.title}
- Price: ₹${product.sp} (MRP: ₹${product.mrp}, ${product.discountPercent || 50}% off)
- Category: ${product.category}
- Description: ${product.description}

APPROVED CONCEPT:
- Persona: ${option.persona}
- Problem: ${option.problem}
- Angle: ${option.angle}
- Offer: ${option.offer}
- Hook: ${option.hookLine}
- Bridge: ${option.bridge}

${
  isVideo
    ? `Generate a structured 2-part video storyboard script + prompts:
[SCENE 1: 0–9 SECONDS — HOOK & AGITATION]
- Visual Prompt: Character description, exact wardrobe, camera movement, environment, product interaction.
- Spoken Dialogue (Hindi Devanagari, strictly 12-14 words):
- On-Screen Text Overlay:
- Audio Ambience:

[SCENE 2: 9–18 SECONDS — BRIDGE, MECHANISM & RISK-REVERSAL CTA]
- Visual Prompt: Same character, same wardrobe, macro product shot, demonstration.
- Spoken Dialogue (Hindi Devanagari, strictly 12-14 words with CTA):
- On-Screen Text Overlay:
- Final CTA:

[KEYFRAME STORYBOARD IMAGE PROMPT]
Photorealistic Midjourney / Flux keyframe prompt.`
    : `Generate a structured Banner Ad Image Prompt:
- Prompt Header & Aspect Ratio (1:1 / 4:5):
- Composition & Camera Angle:
- Lighting & Environment:
- Text Overlay Slots:
- Negative Prompts:`
}

Output the finalized prompt clearly.`

        let promptText = "";

        if (provider === "gemini") {
          const model = keys.geminiModel || "gemini-2.0-flash";
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keys.geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            promptText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
        } else if (provider === "claude") {
          const model = keys.claudeModel || "claude-3-5-sonnet-20241022";
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": keys.claudeKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model,
              max_tokens: 2048,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            promptText = data?.content?.[0]?.text || "";
          }
        }

        return {
          conceptId: concept.id,
          finalPrompt: promptText.trim() || `[GENERATED PROMPT FOR ${product.title}]\n\nAngle: ${option.angle}\nHook: ${option.hookLine}`,
        };
      })
    );

    return NextResponse.json({
      success: true,
      provider,
      prompts: generatedPrompts,
    });
  } catch (err: any) {
    console.error("API /api/llm/generate-prompts error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate prompts with LLM" },
      { status: 500 }
    );
  }
}
