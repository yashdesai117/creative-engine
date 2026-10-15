/**
 * Client-side API Key Manager for Gemini, Claude, and Google Flow / Veo.
 * Securely persists keys in localStorage so users can configure them directly from the dashboard.
 */

export interface ApiKeysConfig {
  geminiKey?: string;
  geminiModel?: string; // e.g. "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"
  claudeKey?: string;
  claudeModel?: string; // e.g. "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"
  veoKey?: string; // Google Veo / Flow API Key or Project Token
  defaultProvider: "gemini" | "claude";
}

const STORAGE_KEY = "creative_engine_api_keys_v1";

export const DEFAULT_KEYS_CONFIG: ApiKeysConfig = {
  geminiKey: "",
  geminiModel: "gemini-2.0-flash",
  claudeKey: "",
  claudeModel: "claude-3-5-sonnet-20241022",
  veoKey: "",
  defaultProvider: "gemini",
};

export function getStoredApiKeys(): ApiKeysConfig {
  if (typeof window === "undefined") return DEFAULT_KEYS_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_KEYS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_KEYS_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_KEYS_CONFIG;
  }
}

export function saveStoredApiKeys(keys: Partial<ApiKeysConfig>): ApiKeysConfig {
  if (typeof window === "undefined") return DEFAULT_KEYS_CONFIG;
  const current = getStoredApiKeys();
  const updated: ApiKeysConfig = {
    ...current,
    ...keys,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch custom event so all open tabs/components react immediately
  window.dispatchEvent(new CustomEvent("creative_engine_keys_updated", { detail: updated }));
  return updated;
}

export function hasActiveLlmKey(): boolean {
  const keys = getStoredApiKeys();
  if (keys.defaultProvider === "gemini") {
    return Boolean(keys.geminiKey?.trim());
  }
  return Boolean(keys.claudeKey?.trim());
}

export function getActiveProviderStatus(): {
  provider: "gemini" | "claude" | "none";
  name: string;
  model: string;
  isReady: boolean;
  hasVeo: boolean;
} {
  const keys = getStoredApiKeys();
  const hasGemini = Boolean(keys.geminiKey?.trim());
  const hasClaude = Boolean(keys.claudeKey?.trim());
  const hasVeo = Boolean(keys.veoKey?.trim());

  if (keys.defaultProvider === "claude" && hasClaude) {
    return {
      provider: "claude",
      name: "Claude 3.5 Sonnet",
      model: keys.claudeModel || "claude-3-5-sonnet-20241022",
      isReady: true,
      hasVeo,
    };
  }

  if (hasGemini) {
    return {
      provider: "gemini",
      name: "Google Gemini",
      model: keys.geminiModel || "gemini-2.0-flash",
      isReady: true,
      hasVeo,
    };
  }

  if (hasClaude) {
    return {
      provider: "claude",
      name: "Claude 3.5 Sonnet",
      model: keys.claudeModel || "claude-3-5-sonnet-20241022",
      isReady: true,
      hasVeo,
    };
  }

  return {
    provider: "none",
    name: "Mock / Specimen Mode",
    model: "simulated",
    isReady: false,
    hasVeo,
  };
}
