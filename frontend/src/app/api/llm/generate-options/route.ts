import { NextRequest, NextResponse } from "next/server";
import { MOCK_TEMPLATES } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, templateIds, format, keys } = body;

    if (!product || !product.title) {
      return NextResponse.json(
        { error: "Product data is required for generation" },
        { status: 400 }
      );
    }

    const provider = keys?.defaultProvider === "claude" && keys?.claudeKey ? "claude" : keys?.geminiKey ? "gemini" : keys?.claudeKey ? "claude" : null;

    if (!provider) {
      return NextResponse.json(
        { error: "No active LLM API key found. Please enter a Gemini or Claude API key." },
        { status: 400 }
      );
    }

    const selectedTemplates = MOCK_TEMPLATES.filter((t) =>
      Array.isArray(templateIds) && templateIds.length > 0
        ? templateIds.includes(t.id)
        : true
    ).slice(0, 3);

    const templateSummaries = selectedTemplates
      .map(
        (t) =>
          `- Template ${t.name} (Family: ${t.family}, Format: ${t.format}): ${t.spec.layout}. Visual world: ${t.spec.visualWorld}. Rules: ${t.spec.doRules.join(", ")}`
      )
      .join("\n");

    const systemPrompt = `You are an elite creative director and direct-response performance marketer for Indian D2C e-commerce brands on Meta (Instagram & Facebook).
You understand Meta Andromeda vector-space targeting: Creative IS targeting. Distinct concepts must vary by Persona × Problem × Angle × Offer.

HUMAN-WRITING STANDARD (CRITICAL):
- Never use promotional AI puffery ('revolutionary', 'stands as a testament', 'game-changer', 'unleash', 'pure perfection').
- Video hooks and voiceover dialogues must sound like a real Indian person talking casually to a friend on FaceTime or Instagram close friends, using natural conversational Indian English or Hinglish.
- Spoken dialogues must be concise: maximum 12-14 words per line (~5 seconds speech) so delivery is relaxed and natural.
- Each concept must include 'The Bridge' (Eugene Schwartz / Claude Hopkins continuity) transitioning seamlessly from the agitated problem to the unique mechanism without an abrupt product drop.`;

    const userPrompt = `Generate 6 distinct, hyper-converting creative concepts for this Indian product.

PRODUCT:
- Title: ${product.title}
- Category: ${product.category}
- Selling Price: ₹${product.sp}
- MRP: ₹${product.mrp}
- Discount: ${product.discountPercent || Math.round(((product.mrp - product.sp) / product.mrp) * 100)}% off
- Description: ${product.description || "Premium D2C product"}

TEMPLATES TO ANCHOR:
${templateSummaries}

FORMAT: ${format || "video"}

REQUIREMENTS FOR EACH OF THE 6 CONCEPTS:
1. persona: Hyper-specific Indian persona (age, city, daily lifestyle context, specific pain point).
2. awareness_stage: One of [unaware, problem_aware, solution_aware, product_aware, most_aware].
3. problem: Concrete relatable situation (not generic category).
4. angle: Specific strategic angle (Problem Agitation, Contrarian Truth, Social Proof, Curiosity Gap, Comparison, Transformation).
5. offer: Irresistible offer staying within margin (e.g. discount, BOGO, bundle, prepaid extra off, free gift).
6. hook_line: The primary scroll-stopping hook statement.
7. hook_layers:
   - visual: Intriguing 0-3s visual scene stopping the thumb.
   - audio: Authentic spoken line (under 14 words, natural conversational tone).
   - copy: On-screen punchy text overlay.
8. bridge: 1-sentence transition connecting the pain to the product mechanism.
9. summary: How the creative looks inside the template visual world.
10. rationale: Why this specific angle converts this persona on Meta feeds.
11. claims_used: Array of 2-3 specific product benefits.
12. score: Number between 82 and 98 based on viral hook potential.

Return a valid JSON array of 6 objects with keys:
[{"template_id", "persona", "awareness_stage", "problem", "angle", "offer", "hook_line", "hook_layers": {"visual", "audio", "copy"}, "bridge", "summary", "rationale", "claims_used", "score"}]`;

    let rawJsonText = "";

    // ── Call Gemini ──
    if (provider === "gemini") {
      const model = keys.geminiModel || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keys.geminiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API error (HTTP ${res.status})`);
      }

      const data = await res.json();
      rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // ── Call Claude ──
    if (provider === "claude") {
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
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: `${userPrompt}\n\nIMPORTANT: Respond with ONLY the raw JSON array, without any markdown formatting or commentary.` }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Claude API error (HTTP ${res.status})`);
      }

      const data = await res.json();
      rawJsonText = data?.content?.[0]?.text || "";
    }

    // Parse clean JSON
    let parsed: any[] = [];
    try {
      let cleaned = rawJsonText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed) && (parsed as any).concepts) {
        parsed = (parsed as any).concepts;
      }
    } catch (parseErr) {
      console.error("Failed to parse LLM options JSON:", parseErr, rawJsonText);
      throw new Error("LLM returned non-standard JSON. Please try again.");
    }

    // Format into engine Options
    const options = parsed.map((item: any, i: number) => {
      const assignedTmpl =
        item.template_id ||
        (selectedTemplates[i % selectedTemplates.length]?.id ?? "tmpl-001");

      return {
        id: `opt-${Date.now()}-${i + 1}`,
        templateId: assignedTmpl,
        persona: item.persona || "Target Indian Consumer",
        awarenessStage: item.awareness_stage || "problem_aware",
        problem: item.problem || "Everyday usage pain point",
        angle: item.angle || "Problem Agitation",
        offer: item.offer || `Special offer on ${product.title}`,
        hookLine: item.hook_line || item.hook || "Stop scrolling if you need this.",
        hookLayers: {
          visual: item.hook_layers?.visual || "Close-up hero product view",
          audio: item.hook_layers?.audio || item.hook_line || "Listen to this.",
          copy: item.hook_layers?.copy || item.hook_line || "Watch this ⚡",
        },
        bridge: item.bridge || "Here is why this changes everything.",
        summary: item.summary || `Authentic layout showcasing ${product.title}`,
        rationale: item.rationale || "Targets high-intent problem-aware shoppers.",
        claimsUsed: Array.isArray(item.claims_used)
          ? item.claims_used
          : ["Authentic quality", "Value pricing"],
        status: "reviewing",
        isEdited: false,
        score: Number(item.score) || Math.floor(Math.random() * 10) + 85,
      };
    });

    return NextResponse.json({
      success: true,
      provider,
      count: options.length,
      options,
    });
  } catch (err: any) {
    console.error("API /api/llm/generate-options error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate options with LLM" },
      { status: 500 }
    );
  }
}
