"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Zap,
  LayoutTemplate,
  TrendingUp,
} from "lucide-react";
import { MOCK_SESSIONS } from "@/lib/mock-data";
import { getRelativeTime, cn } from "@/lib/utils";
import type { Session } from "@/lib/types";

const STATUS_CONFIG: Record<
  string,
  { label: string; dotColor: string; badgeClass: string }
> = {
  input:      { label: "Draft",      dotColor: "#52525B", badgeClass: "badge-zinc" },
  confirming: { label: "Draft",      dotColor: "#52525B", badgeClass: "badge-zinc" },
  templates:  { label: "Draft",      dotColor: "#52525B", badgeClass: "badge-zinc" },
  generating: { label: "Generating", dotColor: "#8B5CF6", badgeClass: "badge-violet" },
  reviewing:  { label: "In Review",  dotColor: "#FBBF24", badgeClass: "badge-amber" },
  approved:   { label: "Approved",   dotColor: "#34D399", badgeClass: "badge-emerald" },
};

const METRICS = [
  { label: "Sessions Today",    value: "12", delta: "+3", icon: Zap },
  { label: "Concepts Approved", value: "47", delta: "+8", icon: CheckCircle2 },
  { label: "Prompts Generated", value: "156", delta: "+21", icon: Sparkles },
  { label: "Templates Active",  value: "6",  delta: "",   icon: LayoutTemplate },
];

const FILTER_TABS = [
  { key: "all",       label: "All" },
  { key: "approved",  label: "Approved" },
  { key: "reviewing", label: "In Review" },
  { key: "generating",label: "Generating" },
  { key: "input",     label: "Drafts" },
];

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = MOCK_SESSIONS.filter((s) => {
    const isDraft = ["input", "confirming", "templates"].includes(s.status);
    const matchSearch =
      !search ||
      s.sellerId.toLowerCase().includes(search.toLowerCase()) ||
      (s.product?.title ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "all" ||
      s.status === activeFilter ||
      (activeFilter === "input" && isDraft);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--canvas)" }}>
      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 glass-panel"
        style={{ borderBottom: "1px solid var(--border-subtle)", borderLeft: "none", borderRight: "none", borderTop: "none", borderRadius: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: "var(--violet-600)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-[15px] font-semibold tracking-tight font-display"
              style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}
            >
              Creative Engine
            </span>
            <span className="badge badge-violet text-[10px]">v2</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px]" style={{ color: "var(--text-4)" }}>ShopDeck Growth</p>
              <p className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>Yash Desai</p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
              style={{ background: "var(--violet-600)" }}
            >
              YD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="pt-10 pb-8 flex items-start justify-between gap-4"
        >
          <div>
            <h1
              className="font-display heading-fade mb-1.5"
              style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              Sessions
            </h1>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              Turn any product into strategically distinct Meta ad prompts in under 5 minutes.
            </p>
          </div>
          <Link href="/sessions/new" className="mt-1 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="btn btn-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              New Session
            </motion.button>
          </Link>
        </motion.div>

        {/* ── Metrics ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.07 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-8"
          style={{
            background: "var(--border-faint)",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
          }}
        >
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex flex-col gap-2 p-5"
              style={{ backgroundColor: "var(--surface)" }}
            >
              <p className="metric-label">{m.label}</p>
              <div className="flex items-end gap-2">
                <p className="metric-value">{m.value}</p>
                {m.delta && (
                  <span
                    className="text-[11px] font-medium pb-0.5"
                    style={{ color: "var(--emerald-text)" }}
                  >
                    {m.delta}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.12 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4"
        >
          {/* Search */}
          <div className="relative" style={{ maxWidth: "280px" }}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "var(--text-4)" }}
            />
            <input
              type="text"
              placeholder="Search sessions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-[13px]"
              style={{ paddingLeft: "34px", height: "34px", padding: "0 12px 0 34px" }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {FILTER_TABS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="text-[12px] font-medium px-3 h-[34px] rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--violet-subtle)" : "transparent",
                    color: isActive ? "var(--violet-400)" : "var(--text-3)",
                    border: isActive ? "1px solid var(--violet-border)" : "1px solid transparent",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Sessions Table ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.38, delay: 0.18 }}
          className="mb-12"
          style={{
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Table head */}
          <div
            className="hidden sm:grid items-center px-5 h-9"
            style={{
              gridTemplateColumns: "14px 44px 1fr 120px 76px 80px 28px",
              gap: "12px",
              borderBottom: "1px solid var(--border-faint)",
              backgroundColor: "var(--surface)",
            }}
          >
            {["", "", "Product", "Category", "Format", "Updated", ""].map((col, i) => (
              <span key={i} className="metric-label">{col}</span>
            ))}
          </div>

          {/* Rows */}
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => (
              <SessionRow
                key={s.id}
                session={s as any}
                index={i}
                isLast={i === filtered.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Empty */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-2"
              style={{ backgroundColor: "var(--surface)" }}
            >
              <Search className="w-5 h-5" style={{ color: "var(--text-4)" }} />
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
                No sessions match your filter
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ── Empty state (no data at all) ── */}
        {MOCK_SESSIONS.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--violet-subtle)", border: "1px solid var(--violet-border)" }}
            >
              <Sparkles className="w-7 h-7" style={{ color: "var(--violet-400)" }} />
            </div>
            <h3
              className="font-display text-[20px] font-bold mb-2"
              style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}
            >
              No sessions yet
            </h3>
            <p className="text-[13px] mb-8 max-w-xs mx-auto" style={{ color: "var(--text-3)" }}>
              Start your first session to generate strategic creative briefs and Meta ad prompts.
            </p>
            <Link href="/sessions/new">
              <button className="btn btn-primary">Start Your First Session</button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function SessionRow({
  session,
  index,
  isLast,
}: {
  session: Session;
  index: number;
  isLast: boolean;
}) {
  const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.input;
  const isGenerating = session.status === "generating";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link href={session.status === "approved" ? `/sessions/${session.id}` : "/sessions/new"}>
        <div
          className="row-interactive flex sm:grid items-center px-5 py-3 group"
          style={{
            gridTemplateColumns: "14px 44px 1fr 120px 76px 80px 28px",
            gap: "12px",
            borderBottom: isLast ? "none" : "1px solid var(--border-faint)",
            backgroundColor: "var(--surface)",
          }}
        >
          {/* Status dot */}
          <div className="hidden sm:flex items-center justify-center">
            <span
              className={isGenerating ? "status-dot-pulse" : "status-dot"}
              style={{ backgroundColor: cfg.dotColor }}
            />
          </div>

          {/* Thumbnail */}
          <div
            className="hidden sm:block w-[44px] h-[44px] rounded-[8px] overflow-hidden flex-shrink-0"
            style={{
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--elevated)",
            }}
          >
            {session.product?.images?.[0] && (
              <img
                src={session.product.images[0].url}
                alt={session.product.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-medium truncate"
              style={{ color: "var(--text-1)" }}
            >
              {session.product?.title ?? "Loading product…"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="font-mono-ui text-[11px]"
                style={{ color: "var(--text-4)" }}
              >
                {session.sellerId}
              </span>
              <span className={`badge sm:hidden ${cfg.badgeClass}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Category */}
          <p
            className="hidden sm:block text-[12px] truncate"
            style={{ color: "var(--text-3)" }}
          >
            {session.product?.category ?? "—"}
          </p>

          {/* Format */}
          <p
            className="hidden sm:block text-[12px]"
            style={{ color: "var(--text-3)" }}
          >
            {session.format === "banner" ? "Banner" : "Video"}
          </p>

          {/* Time */}
          <p
            className="hidden sm:block text-[12px] whitespace-nowrap"
            style={{ color: "var(--text-4)" }}
          >
            {getRelativeTime(session.updatedAt)}
          </p>

          {/* Arrow */}
          <div className="hidden sm:flex items-center justify-center">
            <ChevronRight
              className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
              style={{ color: "var(--violet-400)" }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
