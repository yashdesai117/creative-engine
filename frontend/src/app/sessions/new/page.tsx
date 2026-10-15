"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { useSessionStore } from "@/lib/store";
import { InputStep } from "@/components/session/InputStep";
import { ConfirmStep } from "@/components/session/ConfirmStep";
import { TemplateStep } from "@/components/session/TemplateStep";
import { GeneratingStep } from "@/components/session/GeneratingStep";
import { ReviewStep } from "@/components/session/ReviewStep";
import { OutputStep } from "@/components/session/OutputStep";
import { ApiKeyButton } from "@/components/modals/ApiKeyModal";

const STEPS = [
  { label: "Inputs",    desc: "Seller ID and product link" },
  { label: "Confirm",   desc: "Verify product data" },
  { label: "Templates", desc: "Select creative templates" },
  { label: "Generate",  desc: "AI generates concepts" },
  { label: "Review",    desc: "Pick and refine options" },
  { label: "Output",    desc: "Copy prompts & export" },
];

const STEP_COMPONENTS = [
  InputStep,
  ConfirmStep,
  TemplateStep,
  GeneratingStep,
  ReviewStep,
  OutputStep,
];

export default function NewSessionPage() {
  const currentStep = useSessionStore((s) => s.currentStep);
  const reset = useSessionStore((s) => s.reset);
  const CurrentStepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--canvas)" }}>

      {/* ── Left Sidebar (desktop) ── */}
      <aside
        className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ borderRight: "1px solid var(--border-subtle)", backgroundColor: "var(--surface)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 h-[56px] shrink-0"
          style={{ borderBottom: "1px solid var(--border-faint)" }}
        >
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: "var(--violet-600)" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className="text-[14px] font-semibold font-display"
            style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Creative Engine
          </span>
        </div>

        {/* Back link */}
        <div className="px-4 pt-4 pb-2">
          <Link href="/" onClick={reset}>
            <button
              className="btn btn-ghost w-full justify-start text-[12px] gap-1.5"
              style={{ color: "var(--text-3)" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              All Sessions
            </button>
          </Link>
        </div>

        {/* Step list */}
        <div className="flex-1 px-4 pb-6 pt-2">
          <p
            className="metric-label px-3 mb-3"
            style={{ color: "var(--text-4)" }}
          >
            Progress
          </p>

          <div className="space-y-0.5">
            {STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;

              return (
                <div key={i}>
                  <div
                    className={`step-item ${isActive ? "step-item-active" : isDone ? "step-item-done" : ""}`}
                  >
                    {/* Node */}
                    <div
                      className={`step-node ${
                        isDone
                          ? "step-node-done"
                          : isActive
                          ? "step-node-active"
                          : "step-node-pending"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3" style={{ color: "var(--emerald-text)" }} />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>

                    {/* Label */}
                    <div className="min-w-0">
                      <p
                        className="text-[13px] font-medium leading-tight"
                        style={{
                          color: isActive ? "var(--text-1)" : isDone ? "var(--text-3)" : "var(--text-4)",
                        }}
                      >
                        {step.label}
                      </p>
                      <p
                        className="text-[11px] mt-0.5 leading-tight"
                        style={{ color: "var(--text-4)" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={`step-connector ${isDone ? "step-connector-done" : ""}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 shrink-0 space-y-3"
          style={{ borderTop: "1px solid var(--border-faint)" }}
        >
          <div className="flex justify-start">
            <ApiKeyButton />
          </div>
          <div>
            <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <div
              className="step-progress-track mt-2"
              style={{ background: "var(--border-subtle)" }}
            >
              <div
                className="step-progress-fill transition-all duration-500"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%`, height: "2px", background: "var(--violet-500)", borderRadius: "2px" }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Desktop top bar with API Key config */}
        <div className="hidden lg:flex items-center justify-end px-8 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <ApiKeyButton />
        </div>

        {/* Mobile top nav */}
        <header
          className="lg:hidden sticky top-0 z-50 glass-panel"
          style={{ borderBottom: "1px solid var(--border-subtle)", borderLeft: "none", borderRight: "none", borderTop: "none", borderRadius: 0 }}
        >
          <div className="max-w-3xl mx-auto px-4 h-[56px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" onClick={reset}>
                <button
                  className="btn btn-ghost text-[12px] gap-1 px-2"
                  style={{ color: "var(--text-3)" }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </Link>
              <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />
              <span className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>
                {STEPS[currentStep].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ApiKeyButton />
              <span className="font-mono-ui text-[11px]" style={{ color: "var(--text-4)" }}>
                {currentStep + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          {/* Mobile progress bar */}
          <div style={{ background: "var(--border-faint)", height: "2px" }}>
            <div
              className="transition-all duration-500"
              style={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                height: "2px",
                background: "var(--violet-500)",
              }}
            />
          </div>
        </header>

        {/* Step content */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <CurrentStepComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
