"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Home,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSessionStore } from "@/lib/store";
import { MOCK_TEMPLATES } from "@/lib/mock-data";
import { cn, copyToClipboard, downloadCSV } from "@/lib/utils";
import type { Concept } from "@/lib/types";

export function OutputStep() {
  const { session, generatePrompts, isGeneratingPrompts, reset } = useSessionStore();
  const concepts = session?.concepts ?? [];
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (concepts.length > 0 && !concepts[0].finalPrompt) {
      generatePrompts();
    }
  }, []);

  const handleCopy = async (concept: Concept) => {
    await copyToClipboard(concept.finalPrompt);
    setCopiedId(concept.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!concepts.length) return;
    const rows = concepts.map((c) => ({
      "Concept Code": c.conceptCode,
      "Ad Name": c.adName,
      "Template": c.option.templateId,
      "Hook Line": c.option.hookLine,
      "Problem": c.option.problem,
      "Angle": c.option.angle,
      "Offer": c.option.offer,
      "Prompt": c.finalPrompt,
      "Approved At": c.approvedAt,
    }));
    downloadCSV(`creative_engine_${session?.sellerId ?? "concepts"}_${Date.now()}.csv`, rows);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">Session complete</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {concepts.length} Concept{concepts.length !== 1 ? "s" : ""} Approved
            </h2>
            <p className="text-[rgba(255,255,255,0.45)] text-sm">
              Copy the prompt and the ad name for each concept. Paste into your image or video model
              (Nano Banana, Grok, Midjourney, etc.). The attached reference image is your product
              anchor.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-[rgba(30,30,48,0.6)] border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.35)] text-[rgba(255,255,255,0.6)] hover:text-white rounded-xl text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </motion.div>

      {/* Generating state */}
      {isGeneratingPrompts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20 mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-white">Composing final prompts...</p>
            <p className="text-xs text-[rgba(255,255,255,0.4)]">
              Assembling compiler + family + template spec + category pack + concept slots
            </p>
          </div>
        </motion.div>
      )}

      {/* Concept cards */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {concepts.map((concept, i) => (
            <ConceptOutputCard
              key={concept.id}
              concept={concept}
              index={i}
              isCopied={copiedId === concept.id}
              onCopy={() => handleCopy(concept)}
              isGenerating={isGeneratingPrompts}
              product={session?.product}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 pt-8 border-t border-[rgba(99,102,241,0.1)] flex items-center justify-between"
      >
        <div className="text-sm text-[rgba(255,255,255,0.4)]">
          <span className="font-medium text-indigo-400">Next step: </span>
          Paste the prompt + reference image into your generation model. Record the ad name in Ads Manager.
        </div>
        <Link href="/" onClick={reset}>
          <button className="flex items-center gap-2 px-4 py-2 bg-[rgba(30,30,48,0.6)] border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.35)] text-[rgba(255,255,255,0.6)] hover:text-white rounded-xl text-sm font-medium transition-all">
            <Home className="w-4 h-4" />
            Back to Sessions
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

function ConceptOutputCard({
  concept,
  index,
  isCopied,
  onCopy,
  isGenerating,
  product,
}: {
  concept: Concept;
  index: number;
  isCopied: boolean;
  onCopy: () => void;
  isGenerating: boolean;
  product?: any;
}) {
  const [promptView, setPromptView] = useState<"preview" | "raw">("preview");
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const template = MOCK_TEMPLATES.find((t) => t.id === concept.option.templateId);

  const hasPrompt = !!concept.finalPrompt;
  const promptPreview = concept.finalPrompt.slice(0, 400);
  const isLong = concept.finalPrompt.length > 400;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Concept header */}
      <div className="px-6 py-5 border-b border-[rgba(99,102,241,0.1)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold text-[rgba(255,255,255,0.35)] bg-white/5 px-2 py-0.5 rounded">
                CONCEPT {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                {concept.conceptCode}
              </span>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Approved
              </span>
            </div>

            {/* Ad name */}
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-xs text-[rgba(255,255,255,0.6)] bg-[rgba(8,8,16,0.6)] border border-[rgba(99,102,241,0.15)] rounded-lg px-3 py-2 truncate">
                {concept.adName}
              </div>
              <button
                onClick={() => copyToClipboard(concept.adName)}
                className="p-2 bg-[rgba(30,30,48,0.6)] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.35)] rounded-lg transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-[rgba(255,255,255,0.5)] hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hook + PAO summary */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-[rgba(99,102,241,0.08)]">
        <div className="sm:col-span-4">
          <p className="text-[10px] font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-wider mb-1">
            Hook
          </p>
          <p className="text-sm font-bold text-white">"{concept.option.hookLine}"</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Problem</p>
          <p className="text-xs text-[rgba(255,255,255,0.6)]">{concept.option.problem}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Angle</p>
          <p className="text-xs text-[rgba(255,255,255,0.6)]">{concept.option.angle}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Offer</p>
          <p className="text-xs text-[rgba(255,255,255,0.6)]">{concept.option.offer}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-0.5">Template</p>
          <p className="text-xs text-[rgba(255,255,255,0.6)]">{template?.name ?? "—"}</p>
        </div>
      </div>

      {/* Prompt section */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPromptView("preview")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                promptView === "preview"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-[rgba(255,255,255,0.4)] hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setPromptView("raw")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                promptView === "raw"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-[rgba(255,255,255,0.4)] hover:text-white"
              )}
            >
              <Code className="w-3.5 h-3.5" />
              Raw
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCopy}
            disabled={!hasPrompt}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              isCopied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : hasPrompt
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.45)]"
                : "bg-[rgba(30,30,48,0.6)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
            )}
          >
            {isCopied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Prompt
              </>
            )}
          </motion.button>
        </div>

        {isGenerating && !hasPrompt ? (
          <div className="h-40 bg-[rgba(8,8,16,0.6)] border border-[rgba(99,102,241,0.1)] rounded-xl flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </motion.div>
            <span className="text-xs text-[rgba(255,255,255,0.4)]">Composing prompt...</span>
          </div>
        ) : hasPrompt ? (
          <div className="relative">
            <div className="prompt-textarea min-h-[120px] overflow-hidden">
              {showFullPrompt || !isLong
                ? concept.finalPrompt
                : promptPreview + "..."}
            </div>
            {isLong && (
              <button
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {showFullPrompt ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> Show full prompt ({concept.finalPrompt.length} chars)
                  </>
                )}
              </button>
            )}
          </div>
        ) : null}

        {/* Reference image */}
        {product?.referenceImages?.[0] && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
            <img
              src={product.referenceImages[0]}
              alt="Reference product"
              className="w-16 h-16 rounded-lg object-cover border border-[rgba(99,102,241,0.15)] flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-[rgba(255,255,255,0.6)] mb-0.5">Reference Image</p>
              <p className="text-xs text-[rgba(255,255,255,0.35)] mb-2">
                Attach this image to your generation model prompt as the product anchor.
              </p>
              <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download reference image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="px-6 py-4 border-t border-[rgba(99,102,241,0.08)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[rgba(255,255,255,0.35)]">Was this concept useful?</span>
          <button className="p-1.5 rounded-lg text-[rgba(255,255,255,0.3)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-[rgba(255,255,255,0.3)] hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] font-mono text-[rgba(255,255,255,0.2)]">
          v{concept.promptVersion} · {new Date(concept.approvedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}
