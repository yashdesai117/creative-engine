"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Image as ImageIcon,
  Tag,
  Package,
  ArrowRight,
  Star,
  Database,
  User,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";

const SOURCE_LABELS: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  database: { label: "ShopDeck DB", icon: Database, color: "text-emerald-400" },
  fallback: { label: "Page scrape", icon: AlertTriangle, color: "text-amber-400" },
  user_override: { label: "Edited by you", icon: User, color: "text-indigo-400" },
};

export function ConfirmStep() {
  const { session, setStep, updateOption } = useSessionStore();
  const product = session?.product;
  const [selectedImages, setSelectedImages] = useState<string[]>(product?.referenceImages ?? []);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (!product) return null;

  const toggleImage = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url)
        ? prev.filter((u) => u !== url)
        : [...prev, url]
    );
  };

  const canProceed = selectedImages.length >= 1;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-1">Confirm Product</h2>
        <p className="text-[rgba(255,255,255,0.45)] text-sm">
          Review the fetched product details. You can correct any field before proceeding. Select at
          least one reference image.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Reference Images
            </p>
            <p className="text-xs text-[rgba(255,255,255,0.35)] mb-3">
              Select images to anchor the creative. At least one required.
            </p>
            <div className="space-y-2">
              {product.images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleImage(img.url)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left",
                    selectedImages.includes(img.url)
                      ? "border-indigo-500/40 bg-indigo-500/10"
                      : "border-[rgba(99,102,241,0.15)] bg-[rgba(18,18,32,0.4)] hover:border-[rgba(99,102,241,0.3)]"
                  )}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(30,30,48,0.5)]">
                    <img
                      src={img.url}
                      alt={img.alt ?? `Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[rgba(255,255,255,0.6)] truncate">
                      {img.alt ?? `Image ${i + 1}`}
                    </p>
                    {img.isReference && (
                      <span className="text-[10px] text-indigo-400 font-medium">Main image</span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                      selectedImages.includes(img.url)
                        ? "bg-indigo-500"
                        : "border border-[rgba(99,102,241,0.2)]"
                    )}
                  >
                    {selectedImages.includes(img.url) && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
            {selectedImages.length === 0 && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Select at least one image
              </p>
            )}
          </div>
        </motion.div>

        {/* Right: Product details */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Identity */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Product Details
            </p>
            <div className="space-y-4">
              <FieldRow
                label="Title"
                value={product.title}
                source={product.fieldSources.title}
                multiline
              />
              <FieldRow
                label="Category"
                value={product.category}
                source={product.fieldSources.category}
              />
              <FieldRow
                label="Seller ID"
                value={product.sellerId}
                source="database"
              />
              <FieldRow
                label="Product ID"
                value={product.productId}
                source="database"
              />
              {product.isInStock ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgba(255,255,255,0.4)]">Status</span>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    In Stock · Published
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgba(255,255,255,0.4)]">Status</span>
                  <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Pricing & Economics
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceCard
                label="Selling Price"
                value={formatCurrency(product.sp)}
                subtext="SP"
                color="indigo"
              />
              <PriceCard
                label="Market Price"
                value={formatCurrency(product.mrp)}
                subtext="MRP"
                color="default"
              />
              <PriceCard
                label="Discount"
                value={`${product.discountPercent}%`}
                subtext="off MRP"
                color="emerald"
              />
              {product.marginPercent !== undefined && (
                <PriceCard
                  label="Gross Margin"
                  value={`${product.marginPercent}%`}
                  subtext="admin only"
                  color="violet"
                  restricted
                />
              )}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)]">
              <p className="text-xs text-[rgba(255,255,255,0.45)] leading-relaxed">
                <span className="text-indigo-400 font-medium">Guardrail: </span>
                Offers generated by AI will stay within the configured margin floor. CP is never sent
                to the model.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Description
            </p>
            <p className="text-sm text-[rgba(255,255,255,0.65)] leading-relaxed">
              {product.description}
            </p>
            <div className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] flex items-center justify-between">
              <span className="text-xs text-[rgba(255,255,255,0.3)] flex items-center gap-1">
                <Database className="w-3 h-3" />
                Source: ShopDeck DB
              </span>
              <span className="text-xs text-[rgba(255,255,255,0.3)]">
                Fetched {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex items-center justify-between"
      >
        <button
          onClick={() => setStep(0)}
          className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!canProceed}
          onClick={() => setStep(2)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
            canProceed
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_32px_rgba(99,102,241,0.5)]"
              : "bg-[rgba(30,30,48,0.6)] text-[rgba(255,255,255,0.25)] cursor-not-allowed"
          )}
        >
          Confirm & Select Templates
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  source,
  multiline,
}: {
  label: string;
  value: string;
  source: string;
  multiline?: boolean;
}) {
  const src = SOURCE_LABELS[source] ?? SOURCE_LABELS.database;

  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-[rgba(255,255,255,0.4)] w-20 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1">
        <p className={cn("text-sm text-white font-medium", multiline && "leading-relaxed")}>{value}</p>
        <span className={cn("text-[10px] font-medium flex items-center gap-1 mt-0.5", src.color)}>
          <src.icon className="w-2.5 h-2.5" />
          {src.label}
        </span>
      </div>
    </div>
  );
}

function PriceCard({
  label,
  value,
  subtext,
  color,
  restricted,
}: {
  label: string;
  value: string;
  subtext: string;
  color: "indigo" | "emerald" | "violet" | "default";
  restricted?: boolean;
}) {
  const colors = {
    indigo: "text-indigo-300",
    emerald: "text-emerald-400",
    violet: "text-violet-400",
    default: "text-[rgba(255,255,255,0.7)]",
  };

  return (
    <div className="p-3 rounded-xl bg-[rgba(18,18,32,0.4)] border border-[rgba(99,102,241,0.1)]">
      <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1">{label}</p>
      <p className={cn("text-lg font-bold", colors[color])}>{value}</p>
      <p className="text-[10px] text-[rgba(255,255,255,0.3)] mt-0.5">{subtext}</p>
      {restricted && (
        <span className="text-[9px] text-violet-400 font-medium">🔒 admin</span>
      )}
    </div>
  );
}
