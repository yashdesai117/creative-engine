"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Cpu,
  Video,
  ShieldCheck,
  ExternalLink,
  Trash2,
  Zap,
} from "lucide-react";
import {
  getStoredApiKeys,
  saveStoredApiKeys,
  getActiveProviderStatus,
  type ApiKeysConfig,
} from "@/lib/keys";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [keys, setKeys] = useState<ApiKeysConfig>(() => getStoredApiKeys());
  const [activeTab, setActiveTab] = useState<"gemini" | "claude" | "veo">("gemini");
  const [showGemini, setShowGemini] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const [showVeo, setShowVeo] = useState(false);

  // Testing status
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    message: string;
  } | null>(null);

  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeys(getStoredApiKeys());
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveStoredApiKeys(keys);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    const resetKeys: ApiKeysConfig = {
      geminiKey: "",
      geminiModel: "gemini-2.0-flash",
      claudeKey: "",
      claudeModel: "claude-3-5-sonnet-20241022",
      veoKey: "",
      defaultProvider: "gemini",
    };
    setKeys(resetKeys);
    saveStoredApiKeys(resetKeys);
    setTestResult(null);
  };

  const testKey = async (provider: "gemini" | "claude" | "veo") => {
    setTestingProvider(provider);
    setTestResult(null);

    const apiKey =
      provider === "gemini"
        ? keys.geminiKey
        : provider === "claude"
        ? keys.claudeKey
        : keys.veoKey;

    const model =
      provider === "gemini"
        ? keys.geminiModel
        : provider === "claude"
        ? keys.claudeModel
        : undefined;

    if (!apiKey?.trim()) {
      setTestResult({
        provider,
        success: false,
        message: "Please enter an API key first before testing.",
      });
      setTestingProvider(null);
      return;
    }

    try {
      const res = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          provider,
          success: true,
          message: data.message || "Connected successfully!",
        });
      } else {
        setTestResult({
          provider,
          success: false,
          message: data.error || "Connection failed. Please check your key.",
        });
      }
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err.message || "Network error while validating key.",
      });
    } finally {
      setTestingProvider(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-xl surface-elevated overflow-hidden z-10 shadow-2xl"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-strong)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--violet-subtle)", color: "var(--violet-400)" }}
              >
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white tracking-tight flex items-center gap-2">
                  AI Model & API Key Settings
                  <span className="badge badge-emerald text-[10px] py-0.5">Live Execution</span>
                </h2>
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  Keys stay secure in your browser. Real LLMs generate concepts instantly.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-[var(--text-3)] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Provider Tabs */}
          <div
            className="flex items-center px-6 pt-3 gap-2"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <button
              onClick={() => {
                setActiveTab("gemini");
                setTestResult(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-[12px] font-medium border-b-2 transition-all ${
                activeTab === "gemini"
                  ? "border-[var(--violet-500)] text-white"
                  : "border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Google Gemini
              {keys.geminiKey?.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("claude");
                setTestResult(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-[12px] font-medium border-b-2 transition-all ${
                activeTab === "claude"
                  ? "border-[var(--violet-500)] text-white"
                  : "border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Anthropic Claude
              {keys.claudeKey?.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("veo");
                setTestResult(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-[12px] font-medium border-b-2 transition-all ${
                activeTab === "veo"
                  ? "border-[var(--violet-500)] text-white"
                  : "border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}
            >
              <Video className="w-3.5 h-3.5 text-violet-400" />
              Google Flow / Veo
              {keys.veoKey?.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 space-y-5">
            {/* ── TAB 1: GEMINI ── */}
            {activeTab === "gemini" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-2)]">
                      Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[var(--violet-400)] hover:underline inline-flex items-center gap-1"
                    >
                      Get Gemini API Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGemini ? "text" : "password"}
                      value={keys.geminiKey || ""}
                      onChange={(e) =>
                        setKeys((prev) => ({ ...prev, geminiKey: e.target.value }))
                      }
                      placeholder="AIzaSy..."
                      className="input font-mono-ui text-[12px] pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowGemini(!showGemini)}
                        className="p-1 rounded text-[var(--text-3)] hover:text-white"
                        title={showGemini ? "Hide key" : "Show key"}
                      >
                        {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="text-[12px] font-medium text-[var(--text-2)] block mb-1.5">
                    Active Gemini Model
                  </label>
                  <select
                    value={keys.geminiModel || "gemini-2.0-flash"}
                    onChange={(e) =>
                      setKeys((prev) => ({ ...prev, geminiModel: e.target.value }))
                    }
                    className="input text-[12px]"
                  >
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Fastest & recommended)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (High speed)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep reasoning)</option>
                  </select>
                </div>

                {/* Test button & Status */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => testKey("gemini")}
                    disabled={testingProvider === "gemini"}
                    className="btn btn-secondary text-[12px] py-1.5 px-3"
                  >
                    {testingProvider === "gemini" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--violet-400)]" />
                        Validating Key...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Test Gemini Key
                      </>
                    )}
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[var(--text-2)]">
                    <input
                      type="radio"
                      name="defaultProvider"
                      checked={keys.defaultProvider === "gemini"}
                      onChange={() => setKeys((prev) => ({ ...prev, defaultProvider: "gemini" }))}
                      className="accent-[var(--violet-600)]"
                    />
                    Use as Primary LLM
                  </label>
                </div>
              </div>
            )}

            {/* ── TAB 2: CLAUDE ── */}
            {activeTab === "claude" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-2)]">
                      Claude API Key
                    </label>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[var(--violet-400)] hover:underline inline-flex items-center gap-1"
                    >
                      Get Claude API Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showClaude ? "text" : "password"}
                      value={keys.claudeKey || ""}
                      onChange={(e) =>
                        setKeys((prev) => ({ ...prev, claudeKey: e.target.value }))
                      }
                      placeholder="sk-ant-api03-..."
                      className="input font-mono-ui text-[12px] pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowClaude(!showClaude)}
                        className="p-1 rounded text-[var(--text-3)] hover:text-white"
                        title={showClaude ? "Hide key" : "Show key"}
                      >
                        {showClaude ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="text-[12px] font-medium text-[var(--text-2)] block mb-1.5">
                    Claude Model
                  </label>
                  <select
                    value={keys.claudeModel || "claude-3-5-sonnet-20241022"}
                    onChange={(e) =>
                      setKeys((prev) => ({ ...prev, claudeModel: e.target.value }))
                    }
                    className="input text-[12px]"
                  >
                    <option value="claude-3-5-sonnet-20241022">
                      claude-3-5-sonnet-20241022 (Elite creative quality)
                    </option>
                    <option value="claude-3-haiku-20240307">claude-3-haiku-20240307 (Fast & lightweight)</option>
                  </select>
                </div>

                {/* Test button & Status */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => testKey("claude")}
                    disabled={testingProvider === "claude"}
                    className="btn btn-secondary text-[12px] py-1.5 px-3"
                  >
                    {testingProvider === "claude" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--violet-400)]" />
                        Validating Key...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Test Claude Key
                      </>
                    )}
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[var(--text-2)]">
                    <input
                      type="radio"
                      name="defaultProvider"
                      checked={keys.defaultProvider === "claude"}
                      onChange={() => setKeys((prev) => ({ ...prev, defaultProvider: "claude" }))}
                      className="accent-[var(--violet-600)]"
                    />
                    Use as Primary LLM
                  </label>
                </div>
              </div>
            )}

            {/* ── TAB 3: VEO / FLOW ── */}
            {activeTab === "veo" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-2)]">
                      Google Flow / Veo API Key
                    </label>
                    <span className="text-[11px] text-[var(--text-3)]">
                      Google Cloud / AI Studio Video Pipeline
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showVeo ? "text" : "password"}
                      value={keys.veoKey || ""}
                      onChange={(e) =>
                        setKeys((prev) => ({ ...prev, veoKey: e.target.value }))
                      }
                      placeholder="AIzaSy... (Veo Video Key)"
                      className="input font-mono-ui text-[12px] pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowVeo(!showVeo)}
                        className="p-1 rounded text-[var(--text-3)] hover:text-white"
                        title={showVeo ? "Hide key" : "Show key"}
                      >
                        {showVeo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 rounded-lg text-[12px] space-y-1"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <Video className="w-3.5 h-3.5 text-[var(--violet-400)]" />
                    Direct Video Pipeline Ready
                  </div>
                  <p className="text-[var(--text-3)] text-[11px] leading-relaxed">
                    Once entered, Google Veo video storyboard generation will automatically unlock 1080p photorealistic rendering, scene-to-scene wardrobe continuity, and 14-word voiceover sync.
                  </p>
                </div>

                {/* Test button & Status */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => testKey("veo")}
                    disabled={testingProvider === "veo"}
                    className="btn btn-secondary text-[12px] py-1.5 px-3"
                  >
                    {testingProvider === "veo" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--violet-400)]" />
                        Validating Key...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Test Flow / Veo Key
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted locally
                  </span>
                </div>
              </div>
            )}

            {/* Test Feedback Notice */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-[12px] flex items-start gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{testResult.message}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderTop: "1px solid var(--border-subtle)",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-ghost text-[11px] text-[var(--rose-text)] hover:bg-rose-500/10 gap-1 px-2.5"
              title="Remove stored keys and revert to specimen mock mode"
            >
              <Trash2 className="w-3 h-3" />
              Reset to Mock
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary text-[12px] py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary text-[12px] py-1.5 px-5"
              >
                {savedToast ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    Saved!
                  </>
                ) : (
                  "Save & Activate"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Reusable Header Button/Pill component showing the live status of the API keys.
 */
export function ApiKeyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(() => getActiveProviderStatus());

  useEffect(() => {
    const handleUpdate = () => {
      setStatus(getActiveProviderStatus());
    };

    window.addEventListener("creative_engine_keys_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("creative_engine_keys_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] transition-all surface-card border hover:border-[var(--violet-400)]"
        style={{
          borderColor: status.isReady ? "var(--violet-border)" : "var(--border-subtle)",
          background: status.isReady ? "var(--violet-subtle)" : "rgba(255,255,255,0.03)",
        }}
        title="Configure Gemini, Claude, and Veo API keys for live AI generation"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            status.isReady ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
          }`}
        />
        <span className="font-medium" style={{ color: status.isReady ? "var(--text-1)" : "var(--text-3)" }}>
          {status.isReady ? `⚡ ${status.name}` : "⚙️ Add API Keys"}
        </span>
        {status.hasVeo && (
          <span className="text-[10px] text-[var(--violet-400)] bg-[var(--violet-subtle)] px-1.5 py-0.2 rounded border border-[var(--violet-border)]">
            Veo
          </span>
        )}
      </button>

      <ApiKeyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
