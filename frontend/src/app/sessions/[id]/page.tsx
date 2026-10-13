"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, Sparkles, Copy, Download, CheckCircle2, Clock } from "lucide-react";
import { MOCK_SESSIONS, MOCK_OPTIONS, MOCK_PROMPT } from "@/lib/mock-data";
import { getRelativeTime, formatCurrency, cn } from "@/lib/utils";

function SessionDetailContent() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const session = MOCK_SESSIONS.find((s) => s.id === id);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[rgba(255,255,255,0.4)] mb-4">Session not found</p>
          <Link href="/">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">
              Back to Sessions
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810]">
      <nav className="sticky top-0 z-50 border-b border-[rgba(99,102,241,0.12)] bg-[rgba(8,8,16,0.9)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-1.5 text-[rgba(255,255,255,0.45)] hover:text-white transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" />
                Sessions
              </button>
            </Link>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                {session.sellerId}
              </span>
              <span className="text-sm font-semibold text-white truncate max-w-xs">
                {session.product?.title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[rgba(255,255,255,0.35)] hidden sm:block">
              {getRelativeTime(session.updatedAt)}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Approved
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Session Results</h1>
          <p className="text-[rgba(255,255,255,0.45)] text-sm">
            Approved concepts with generation prompts ready to use.
          </p>
        </motion.div>

        {/* Product summary */}
        {session.product && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 mb-8 flex items-start gap-4"
          >
            {session.product.images[0] && (
              <img
                src={session.product.images[0].url}
                alt={session.product.title}
                className="w-16 h-16 rounded-xl object-cover border border-[rgba(99,102,241,0.15)] flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-0.5">{session.product.title}</p>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mb-2">
                {session.product.category} · SP: {formatCurrency(session.product.sp)} · {session.product.discountPercent}% off MRP
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[rgba(255,255,255,0.35)]">Templates used:</span>
                <span className="text-[10px] font-medium text-indigo-400">{session.selectedTemplateIds.length}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sample concept */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                CONCEPT 01
              </span>
              <span className="text-[10px] font-medium text-emerald-400">✓ Approved</span>
            </div>
            <p className="text-base font-bold text-white">
              "Green neck from cheap jewellery? Never again."
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="prompt-textarea min-h-[200px] text-sm">
              {MOCK_PROMPT}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => navigator.clipboard.writeText(MOCK_PROMPT)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold"
              >
                <Copy className="w-4 h-4" />
                Copy Prompt
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SessionDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080810] flex items-center justify-center text-[rgba(255,255,255,0.4)]">
          Loading session...
        </div>
      }
    >
      <SessionDetailContent />
    </Suspense>
  );
}
