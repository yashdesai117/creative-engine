"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Trash2,
  RefreshCw,
  Edit3,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { MOCK_TEMPLATES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { OptionDraft } from "@/lib/types";

export function ReviewStep() {
  const {
    session,
    selectOption,
    lockOption,
    discardOption,
    regenerateOption,
    updateOption,
    approveSelected,
  } = useSessionStore();

  const options = session?.options ?? [];
  const selectedCount = options.filter(
    (o) => o.status === "selected" || o.status === "locked"
  ).length;
  const discardedCount = options.filter((o) => o.status === "discarded").length;

  const canApprove = selectedCount >= 1;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8 gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Review Concepts</h2>
          <p className="text-[rgba(255,255,255,0.45)] text-sm">
            {options.length} concepts generated across {session?.selectedTemplateIds.length}{" "}
            templates. Review, edit, or regenerate. Select the ones you want to approve.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-[rgba(255,255,255,0.4)]">Selected</p>
            <p className="text-lg font-bold text-white">{selectedCount}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={!canApprove}
            onClick={approveSelected}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
              canApprove
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)]"
                : "bg-[rgba(30,30,48,0.6)] text-[rgba(255,255,255,0.25)] cursor-not-allowed"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Approve {selectedCount > 0 ? `(${selectedCount})` : ""}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Diversity check hint */}
      {selectedCount >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15 mb-5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-400">
            Good diversity: {selectedCount} concepts with distinct problems and angles selected.
          </p>
        </motion.div>
      )}

      {/* Options grid */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {options.map((option, i) => (
            <OptionCard
              key={option.id}
              option={option}
              index={i}
              onSelect={() => selectOption(option.id)}
              onLock={() => lockOption(option.id)}
              onDiscard={() => discardOption(option.id)}
              onRegenerate={() => regenerateOption(option.id)}
              onEdit={(field, value) => updateOption(option.id, { [field]: value } as any)}
            />
          ))}
        </AnimatePresence>
      </div>

      {options.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[rgba(255,255,255,0.4)] text-sm">No options generated yet</p>
        </div>
      )}

      {/* Bottom CTA */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={approveSelected}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm shadow-[0_4px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_32px_rgba(99,102,241,0.5)]"
          >
            <Sparkles className="w-4 h-4" />
            Approve {selectedCount} Concept{selectedCount !== 1 ? "s" : ""} & Generate Prompts
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function OptionCard({
  option,
  index,
  onSelect,
  onLock,
  onDiscard,
  onRegenerate,
  onEdit,
}: {
  option: OptionDraft;
  index: number;
  onSelect: () => void;
  onLock: () => void;
  onDiscard: () => void;
  onRegenerate: () => void;
  onEdit: (field: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const template = MOCK_TEMPLATES.find((t) => t.id === option.templateId);
  const isSelected = option.status === "selected";
  const isLocked = option.status === "locked";
  const isDiscarded = option.status === "discarded";
  const isPending = option.status === "pending";
  const isActive = isSelected || isLocked;

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField) {
      onEdit(editingField, editValue);
      setEditingField(null);
    }
  };

  if (isPending) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-6 flex items-center justify-center gap-3"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-5 h-5 text-indigo-400" />
        </motion.div>
        <p className="text-sm text-[rgba(255,255,255,0.5)]">Regenerating concept...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isDiscarded ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "rounded-2xl border transition-all duration-200",
        isActive
          ? "border-indigo-500/40 bg-gradient-to-br from-indigo-500/8 to-[rgba(18,18,32,0.5)] shadow-[0_0_32px_rgba(99,102,241,0.12)]"
          : isDiscarded
          ? "border-[rgba(99,102,241,0.08)] bg-[rgba(18,18,32,0.2)]"
          : "glass-card"
      )}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-[rgba(255,255,255,0.35)] bg-white/5 px-2 py-0.5 rounded">
              #{String(index + 1).padStart(2, "0")}
            </span>
            {template && (
              <span className="text-[10px] font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                {template.name}
              </span>
            )}
            {option.isEdited && (
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Edited
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
            {isDiscarded && (
              <span className="text-[10px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                Discarded
              </span>
            )}
          </div>

          {/* Score */}
          {option.score !== undefined && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-amber-400">{option.score}</span>
              <span className="text-[10px] text-[rgba(255,255,255,0.3)]">/100</span>
            </div>
          )}
        </div>

        {/* Hook line — most prominent */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Hook (first 3 seconds)
          </p>
          {editingField === "hookLine" ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 bg-[rgba(8,8,16,0.8)] border border-[rgba(99,102,241,0.4)] rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none"
              />
              <button onClick={saveEdit} className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-xs font-medium">Save</button>
              <button onClick={() => setEditingField(null)} className="px-3 py-2 bg-white/5 text-[rgba(255,255,255,0.5)] rounded-lg text-xs">Cancel</button>
            </div>
          ) : (
            <p className="text-base font-bold text-white leading-snug group/hook flex items-start gap-2">
              "{option.hookLine}"
              <button
                onClick={() => startEdit("hookLine", option.hookLine)}
                className="opacity-0 group-hover/hook:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[rgba(255,255,255,0.3)] hover:text-indigo-400" />
              </button>
            </p>
          )}
        </div>

        {/* PAO row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <PAOField
            label="Problem"
            value={option.problem}
            color="rose"
            editing={editingField === "problem"}
            editValue={editValue}
            onStartEdit={() => startEdit("problem", option.problem)}
            onEditChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
          />
          <PAOField
            label="Angle"
            value={option.angle}
            color="amber"
            editing={editingField === "angle"}
            editValue={editValue}
            onStartEdit={() => startEdit("angle", option.angle)}
            onEditChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
          />
          <PAOField
            label="Offer"
            value={option.offer}
            color="emerald"
            editing={editingField === "offer"}
            editValue={editValue}
            onStartEdit={() => startEdit("offer", option.offer)}
            onEditChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
          />
        </div>

        {/* Expandable rationale */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)] transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Strategic rationale
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 rounded-xl bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
                <p className="text-xs text-[rgba(255,255,255,0.55)] leading-relaxed">
                  {option.rationale}
                </p>
                {option.claimsUsed.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {option.claimsUsed.map((claim) => (
                      <span key={claim} className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                        ✓ {claim}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar */}
      {!isDiscarded && (
        <div className="border-t border-[rgba(99,102,241,0.1)] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActionBtn
              icon={RefreshCw}
              label="Regenerate"
              onClick={onRegenerate}
              variant="ghost"
            />
            {!isLocked && (
              <ActionBtn
                icon={Trash2}
                label="Discard"
                onClick={onDiscard}
                variant="danger"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isLocked && (
              <ActionBtn
                icon={Lock}
                label="Lock"
                onClick={onLock}
                variant="ghost"
              />
            )}
            {isLocked ? (
              <ActionBtn
                icon={Lock}
                label="Locked"
                onClick={onLock}
                variant="locked"
                active
              />
            ) : (
              <button
                onClick={onSelect}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                  isSelected
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                    : "bg-[rgba(30,30,48,0.6)] text-[rgba(255,255,255,0.5)] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.3)] hover:text-white"
                )}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selected
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-[rgba(255,255,255,0.2)]" />
                    Select
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {isDiscarded && (
        <div className="border-t border-[rgba(255,255,255,0.04)] px-5 py-3 flex justify-end">
          <button
            onClick={() => {}}
            className="text-xs text-[rgba(255,255,255,0.3)] hover:text-white transition-colors"
          >
            Restore
          </button>
        </div>
      )}
    </motion.div>
  );
}

function PAOField({
  label,
  value,
  color,
  editing,
  editValue,
  onStartEdit,
  onEditChange,
  onSave,
  onCancel,
}: {
  label: string;
  value: string;
  color: "rose" | "amber" | "emerald";
  editing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const colors = {
    rose: { label: "text-rose-400", bg: "bg-rose-500/8 border-rose-500/15" },
    amber: { label: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
    emerald: { label: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
  };

  const c = colors[color];

  return (
    <div className={cn("rounded-xl border p-3 group/field", c.bg)}>
      <div className="flex items-center justify-between mb-1.5">
        <p className={cn("text-[10px] font-bold uppercase tracking-wider", c.label)}>{label}</p>
        {!editing && (
          <button onClick={onStartEdit} className="opacity-0 group-hover/field:opacity-100 transition-opacity">
            <Edit3 className="w-3 h-3 text-[rgba(255,255,255,0.3)] hover:text-white" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-1.5">
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            rows={3}
            className="w-full bg-[rgba(8,8,16,0.8)] border border-[rgba(99,102,241,0.4)] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none resize-none"
          />
          <div className="flex gap-1.5">
            <button onClick={onSave} className="flex-1 py-1 bg-indigo-500 text-white rounded text-[10px] font-medium">Save</button>
            <button onClick={onCancel} className="flex-1 py-1 bg-white/5 text-[rgba(255,255,255,0.4)] rounded text-[10px]">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[rgba(255,255,255,0.75)] leading-relaxed">{value}</p>
      )}
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  variant,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant: "ghost" | "danger" | "locked";
  active?: boolean;
}) {
  const styles = {
    ghost: "text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-white/5",
    danger: "text-[rgba(255,255,255,0.35)] hover:text-rose-400 hover:bg-rose-500/10",
    locked: active
      ? "text-emerald-400 bg-emerald-500/10"
      : "text-[rgba(255,255,255,0.35)] hover:text-emerald-400 hover:bg-emerald-500/10",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        styles[variant]
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
