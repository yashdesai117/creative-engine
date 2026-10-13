"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Link2,
  Hash,
  ImageIcon,
  Video,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { cn, isValidUrl } from "@/lib/utils";
import type { Format } from "@/lib/types";

const FORMAT_OPTIONS: Array<{
  value: Format;
  label: string;
  desc: string;
  icon: LucideIcon;
  badge?: string;
}> = [
  {
    value: "banner",
    label: "Banner / Image",
    desc: "Static image or carousel ads. Square, portrait, or landscape.",
    icon: ImageIcon,
  },
  {
    value: "video",
    label: "Video",
    desc: "Video script + scene prompts. Reels, stories, feed video.",
    icon: Video,
    badge: "Soon",
  },
];

const WORKFLOW = [
  "Product details, pricing, and images are fetched from ShopDeck",
  "You select creative templates matching your format and category",
  "AI generates Problem + Angle + Offer candidates",
  "You review, refine, and lock your preferred options",
  "Copy final prompts straight into your image or video model",
];

export function InputStep() {
  const { inputForm, setInputField, fetchProduct, isFetching, fetchError } =
    useSessionStore();
  const [touched, setTouched] = useState({ sellerId: false, productLink: false });

  const isSellerIdValid = inputForm.sellerId.trim().length >= 3;
  const isLinkValid = isValidUrl(inputForm.productLink);
  const canProceed = isSellerIdValid && isLinkValid && !isFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    await fetchProduct();
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2
          className="font-display mb-1.5"
          style={{
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--text-1)",
          }}
        >
          Start a New Session
        </h2>
        <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
          Enter a seller ID and product link. The engine will fetch product data
          and build strategic creative options tailored to this product.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-5"
        >
          {/* Seller ID */}
          <div>
            <label
              className="block text-[12px] font-medium mb-1.5"
              style={{ color: "var(--text-2)", letterSpacing: "0.01em" }}
            >
              Seller ID
            </label>
            <div className="relative">
              <Hash
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "var(--text-4)" }}
              />
              <input
                type="text"
                placeholder="e.g. SD-4821"
                value={inputForm.sellerId}
                onChange={(e) => setInputField("sellerId", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, sellerId: true }))}
                className={`input input-mono ${
                  touched.sellerId && !isSellerIdValid ? "input-error" : ""
                }`}
                style={{ paddingLeft: "34px" }}
              />
            </div>
            {touched.sellerId && !isSellerIdValid && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] mt-1.5 flex items-center gap-1"
                style={{ color: "var(--rose-text)" }}
              >
                <AlertCircle className="w-3 h-3" />
                Enter a valid Seller ID (min 3 characters)
              </motion.p>
            )}
          </div>

          {/* Product Link */}
          <div>
            <label
              className="block text-[12px] font-medium mb-1.5"
              style={{ color: "var(--text-2)", letterSpacing: "0.01em" }}
            >
              Product Link
            </label>
            <div className="relative">
              <Link2
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "var(--text-4)" }}
              />
              <input
                type="url"
                placeholder="https://store.shopdeck.com/seller/product"
                value={inputForm.productLink}
                onChange={(e) => setInputField("productLink", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, productLink: true }))}
                className={`input ${
                  touched.productLink && !isLinkValid && inputForm.productLink
                    ? "input-error"
                    : ""
                }`}
                style={{ paddingLeft: "34px" }}
              />
            </div>
            {touched.productLink && !isLinkValid && inputForm.productLink && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] mt-1.5 flex items-center gap-1"
                style={{ color: "var(--rose-text)" }}
              >
                <AlertCircle className="w-3 h-3" />
                Enter a valid URL
              </motion.p>
            )}
            <p className="text-[12px] mt-1.5" style={{ color: "var(--text-4)" }}>
              ShopDeck storefront URL. Short links are resolved automatically.
            </p>
          </div>

          {/* Format */}
          <div>
            <label
              className="block text-[12px] font-medium mb-2"
              style={{ color: "var(--text-2)", letterSpacing: "0.01em" }}
            >
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((opt) => {
                const isSelected = inputForm.format === opt.value && !opt.badge;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => (opt.badge ? null : setInputField("format", opt.value))}
                    className="relative p-4 rounded-[10px] text-left transition-all"
                    style={{
                      border: isSelected
                        ? "1px solid var(--violet-border)"
                        : "1px solid var(--border-default)",
                      backgroundColor: isSelected ? "var(--violet-subtle)" : "rgba(255,255,255,0.02)",
                      cursor: opt.badge ? "not-allowed" : "pointer",
                      opacity: opt.badge ? 0.55 : 1,
                      boxShadow: isSelected
                        ? "0 0 0 1px var(--violet-border), 0 2px 12px rgba(124,58,237,0.08)"
                        : "none",
                    }}
                  >
                    {opt.badge && (
                      <span
                        className="absolute top-2.5 right-2.5 badge badge-amber"
                        style={{ fontSize: "10px" }}
                      >
                        {opt.badge}
                      </span>
                    )}

                    {isSelected && !opt.badge && (
                      <div
                        className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "var(--violet-600)" }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}

                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(124,58,237,0.16)"
                          : "rgba(255,255,255,0.04)",
                      }}
                    >
                      <opt.icon
                        className="w-4 h-4"
                        style={{ color: isSelected ? "var(--violet-400)" : "var(--text-3)" }}
                      />
                    </div>

                    <p
                      className="text-[13px] font-medium mb-0.5"
                      style={{ color: "var(--text-1)" }}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fetch error */}
          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-[10px]"
              style={{
                background: "var(--rose-subtle)",
                border: "1px solid var(--rose-border)",
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--rose-text)" }} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: "var(--rose-text)" }}>
                  Fetch failed
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--rose-text)", opacity: 0.75 }}>
                  {fetchError}
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.01 } : {}}
            whileTap={canProceed ? { scale: 0.99 } : {}}
            className="btn btn-primary w-full justify-center py-[10px] text-[14px]"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching product…
              </>
            ) : (
              <>
                Fetch Product
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Workflow steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-5 rounded-[10px]"
        style={{
          border: "1px solid var(--border-subtle)",
          backgroundColor: "rgba(255,255,255,0.015)",
        }}
      >
        <p
          className="metric-label mb-3"
          style={{ color: "var(--text-4)" }}
        >
          How it works
        </p>
        <div className="space-y-2.5">
          {WORKFLOW.map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "var(--violet-subtle)",
                  border: "1px solid var(--violet-border)",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--violet-400)",
                }}
              >
                {i + 1}
              </span>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
