"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, LayoutTemplate, Sparkles, AlertTriangle } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { MOCK_TEMPLATES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/types";

const FAMILY_LABELS: Record<string, string> = {
  product_hero: "Product Hero",
  lifestyle: "Lifestyle",
  ugc_style: "UGC Style",
  problem_solution: "Problem → Solution",
  offer_led: "Offer-Led",
  testimonial: "Testimonial",
  comparison: "Comparison",
  gifting: "Gifting",
};

const FAMILY_COLORS: Record<string, string> = {
  product_hero: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  lifestyle: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  ugc_style: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  problem_solution: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  offer_led: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  testimonial: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  comparison: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  gifting: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
};

export function TemplateStep() {
  const { session, selectTemplate, deselectTemplate, setStep, generateOptions } = useSessionStore();
  const product = session?.product;

  const availableTemplates = MOCK_TEMPLATES.filter(
    (t) =>
      t.format === session?.format &&
      t.status === "active" &&
      (!product?.category || t.categories.includes(product.category))
  );

  const selectedIds = session?.selectedTemplateIds ?? [];
  const canProceed = selectedIds.length >= 1;

  const handleGenerate = async () => {
    if (!canProceed) return;
    setStep(3);
    await generateOptions();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-1">Select Templates</h2>
        <p className="text-[rgba(255,255,255,0.45)] text-sm">
          Choose one or more creative templates. Templates are filtered for{" "}
          <span className="text-indigo-400 font-medium">{product?.category}</span> ·{" "}
          <span className="text-indigo-400 font-medium">
            {session?.format === "banner" ? "Banner" : "Video"}
          </span>
          . The AI will generate distinct concepts for each selected template.
        </p>
      </motion.div>

      {/* AI Suggest banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] mb-6"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            Suggested for <span className="text-indigo-400">{product?.category}</span>
          </p>
          <p className="text-xs text-[rgba(255,255,255,0.45)]">
            Problem → Solution, Product Hero, and UGC Style work best for jewellery. Select templates from different families for maximum concept diversity.
          </p>
        </div>
      </motion.div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {availableTemplates.map((template, i) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedIds.includes(template.id)}
            index={i}
            onToggle={() => {
              if (selectedIds.includes(template.id)) {
                deselectTemplate(template.id);
              } else {
                selectTemplate(template.id);
              }
            }}
          />
        ))}
      </div>

      {/* Diversity hint */}
      {selectedIds.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15 mb-6"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-400">
            Good choice — {selectedIds.length} templates selected from different families. This maximises concept diversity.
          </p>
        </motion.div>
      )}

      {/* Summary + CTA */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(1)}
          className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          {selectedIds.length > 0 && (
            <span className="text-sm text-[rgba(255,255,255,0.45)]">
              <span className="text-white font-medium">{selectedIds.length}</span> template
              {selectedIds.length !== 1 ? "s" : ""} selected · ~{selectedIds.length * 6} concepts
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={!canProceed}
            onClick={handleGenerate}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
              canProceed
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_32px_rgba(99,102,241,0.5)]"
                : "bg-[rgba(30,30,48,0.6)] text-[rgba(255,255,255,0.25)] cursor-not-allowed"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Generate Concepts
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  index,
  onToggle,
}: {
  template: Template;
  isSelected: boolean;
  index: number;
  onToggle: () => void;
}) {
  const familyColor = FAMILY_COLORS[template.family] ?? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onToggle}
      className={cn(
        "cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200 group",
        isSelected
          ? "border-indigo-500/40 shadow-[0_0_24px_rgba(99,102,241,0.2),0_0_0_1px_rgba(99,102,241,0.2)]"
          : "border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.3)]"
      )}
    >
      {/* Thumbnail */}
      {template.thumbnailUrl && (
        <div className="relative h-36 overflow-hidden bg-[rgba(18,18,32,0.6)]">
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.9)] via-[rgba(8,8,16,0.2)] to-transparent" />
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.6)]"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          )}
          {/* Aspect ratio badges */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {template.aspectRatios.map((ar) => (
              <span
                key={ar}
                className="text-[10px] font-mono font-medium text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded"
              >
                {ar}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className={cn(
          "p-4",
          isSelected
            ? "bg-gradient-to-b from-indigo-500/10 to-[rgba(18,18,32,0.6)]"
            : "bg-[rgba(18,18,32,0.4)]"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-semibold text-white leading-tight">{template.name}</p>
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ml-2",
              template.certificationStatus === "certified"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            )}
          >
            {template.certificationStatus === "certified" ? "✓ Certified" : "Pending"}
          </span>
        </div>

        <span
          className={cn(
            "inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border mb-2",
            familyColor
          )}
        >
          {FAMILY_LABELS[template.family] ?? template.family}
        </span>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {template.spec.textSlots.length > 0 && (
            <span className="text-[10px] text-[rgba(255,255,255,0.35)]">
              {template.spec.textSlots.length} text slots
            </span>
          )}
          <span className="text-[rgba(255,255,255,0.15)]">·</span>
          <span className={cn(
            "text-[10px]",
            template.spec.humanPresence === "none"
              ? "text-[rgba(255,255,255,0.35)]"
              : "text-violet-400"
          )}>
            {template.spec.humanPresence === "none" ? "Product only" : `${template.spec.humanPresence} human`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
