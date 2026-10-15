import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, model } = await req.json();

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid API key." },
        { status: 400 }
      );
    }

    const cleanKey = apiKey.trim();
    const startTime = Date.now();

    // 1. Google Gemini
    if (provider === "gemini") {
      const targetModel = model || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say 'OK'" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.error?.message || `Google API returned status ${res.status}`;
        return NextResponse.json(
          { success: false, error: errMsg },
          { status: 400 }
        );
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "OK";

      return NextResponse.json({
        success: true,
        message: `Connected to Google Gemini (${targetModel}) in ${latencyMs}ms!`,
        model: targetModel,
        latencyMs,
        reply: reply.trim(),
      });
    }

    // 2. Anthropic Claude
    if (provider === "claude") {
      const targetModel = model || "claude-3-5-sonnet-20241022";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": cleanKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 10,
          messages: [{ role: "user", content: "Say 'OK'" }],
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.error?.message || `Anthropic API returned status ${res.status}`;
        return NextResponse.json(
          { success: false, error: errMsg },
          { status: 400 }
        );
      }

      const data = await res.json();
      const reply = data?.content?.[0]?.text || "OK";

      return NextResponse.json({
        success: true,
        message: `Connected to Claude (${targetModel}) in ${latencyMs}ms!`,
        model: targetModel,
        latencyMs,
        reply: reply.trim(),
      });
    }

    // 3. Google Flow / Veo
    if (provider === "veo" || provider === "flow") {
      // Test key against Google Generative AI models endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
      const res = await fetch(url, { method: "GET" });
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.error?.message || `Veo/Flow validation failed (HTTP ${res.status})`;
        return NextResponse.json(
          { success: false, error: errMsg },
          { status: 400 }
        );
      }

      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name) : [];
      const hasVeo = models.some((m: string) => m.includes("veo") || m.includes("video"));

      return NextResponse.json({
        success: true,
        message: hasVeo
          ? `Connected to Google Veo & Video Models in ${latencyMs}ms!`
          : `Connected to Google AI Studio for Veo/Flow pipelines in ${latencyMs}ms!`,
        latencyMs,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown provider: ${provider}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("API test error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to connect to API" },
      { status: 500 }
    );
  }
}
