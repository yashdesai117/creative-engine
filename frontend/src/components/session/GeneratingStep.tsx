"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Cpu, CheckCircle2 } from "lucide-react";
import { useSessionStore } from "@/lib/store";

const GENERATION_PHASES = [
  {
    id: "candidates",
    icon: Brain,
    label: "Generating concepts",
    detail: "Problem + Angle + Offer for each template",
    range: [0, 55],
  },
  {
    id: "summaries",
    icon: Cpu,
    label: "Writing summaries",
    detail: "Hook lines, rationale, claim validation",
    range: [55, 95],
  },
  {
    id: "done",
    icon: CheckCircle2,
    label: "Finalising",
    detail: "Diversity check and guardrail pass",
    range: [95, 100],
  },
];

const THINKING_LINES = [
  "Reading product category: Jewellery...",
  "Loading category pack for Jewellery...",
  "Identifying distinct personas from product data...",
  "Building angle candidates (Problem Agitation, Contrarian Truth, Social Proof)...",
  "Applying guardrail: offer within margin floor...",
  "Checking claim against approved list for Jewellery...",
  "Scoring hook specificity (Clarity · Relevance · Novelty · Specificity · Credibility)...",
  "Running diversity check across concept set...",
  "Validating offer accuracy against live product page...",
  "Compiling final option summaries...",
];

export function GeneratingStep() {
  const { generationProgress, generationStep } = useSessionStore();

  const thinkingLineCount = Math.floor((generationProgress / 100) * THINKING_LINES.length);
  const visibleLines = THINKING_LINES.slice(0, thinkingLineCount + 1);

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        {/* Spinner orb */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--violet-subtle)", border: "1px solid var(--violet-border)" }}
            animate={{ boxShadow: ["0 0 12px var(--violet-glow)", "0 0 32px var(--violet-glow)", "0 0 12px var(--violet-glow)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute w-2 h-2 rounded-full top-1 left-1/2 -translate-x-1/2"
              style={{ background: "var(--violet-500)" }}
            />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6" style={{ color: "var(--violet-400)" }} />
          </div>
        </div>

        <h2
          className="font-display mb-1.5"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text-1)" }}
        >
          Generating Concepts
        </h2>
        <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
          Analysing your product and building distinct creative options.
          Takes about 15–30 seconds.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-medium" style={{ color: "var(--text-3)" }}>
            Progress
          </p>
          <p
            className="font-mono-ui text-[12px] font-medium"
            style={{ color: "var(--violet-400)" }}
          >
            {generationProgress}%
          </p>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--border-subtle)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--violet-500)", animation: "progress-glow 2s ease infinite" }}
            animate={{ width: `${generationProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Phase indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {GENERATION_PHASES.map((phase) => {
          const isActive = generationStep === phase.id;
          const isDone = generationProgress > phase.range[1];

          return (
            <motion.div
              key={phase.id}
              animate={{ opacity: isDone ? 1 : isActive ? 1 : 0.38 }}
              className="p-3 rounded-[10px] text-center"
              style={{
                border: isDone
                  ? "1px solid var(--emerald-border)"
                  : isActive
                  ? "1px solid var(--violet-border)"
                  : "1px solid var(--border-subtle)",
                background: isDone
                  ? "var(--emerald-subtle)"
                  : isActive
                  ? "var(--violet-subtle)"
                  : "var(--surface)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  background: isDone
                    ? "var(--emerald-subtle)"
                    : isActive
                    ? "rgba(124,58,237,0.15)"
                    : "var(--elevated)",
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--emerald-text)" }} />
                ) : (
                  <phase.icon
                    className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`}
                    style={{ color: isActive ? "var(--violet-400)" : "var(--text-4)" }}
                  />
                )}
              </div>
              <p className="text-[11px] font-medium leading-tight mb-0.5" style={{ color: "var(--text-1)" }}>
                {phase.label}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: "var(--text-4)" }}>
                {phase.detail}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="terminal"
      >
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "#EF4444", opacity: 0.7 }} />
          <div className="terminal-dot" style={{ background: "#F59E0B", opacity: 0.7 }} />
          <div className="terminal-dot" style={{ background: "#10B981", opacity: 0.7 }} />
          <span className="ml-2 text-[10px]" style={{ color: "var(--text-4)" }}>
            creative-engine · inference
          </span>
        </div>
        <div className="p-4 space-y-1.5 max-h-36 overflow-hidden">
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <span style={{ color: "var(--violet-500)" }}>›</span>
              <span
                style={{
                  color: i === visibleLines.length - 1
                    ? "var(--violet-400)"
                    : "var(--text-3)",
                }}
              >
                {line}
              </span>
              {i === visibleLines.length - 1 && generationProgress < 100 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ color: "var(--violet-400)" }}
                >
                  █
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
