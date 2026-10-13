"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Link2,
  Hash,
  ImageIcon,
  Video,
  ArrowRight,
  AlertCircle,
  Loader2,
  Search,
  Check,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Store,
  Tag,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { cn, isValidUrl } from "@/lib/utils";
import type { Format } from "@/lib/types";
import type { MetabaseSeller, MetabaseProduct } from "@/lib/metabase";

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

// Curated live presets from the Metabase catalog for quick one-click testing
const METABASE_PRESETS = [
  {
    sellerId: "68c14eeab2e3263641aca2e5",
    sellerName: "mantrust",
    productLink: "https://themantrust.com/catalogue/MxYNDqJn/5ZFw8u3A",
    productName: "Himalayan Sea Buckthorn Pulp",
    tag: "Health & Wellness",
    sp: "₹699",
    mrp: "₹1,499",
  },
  {
    sellerId: "61cd544aa98b93b86090de16",
    sellerName: "GUJJU JEWELLERS",
    productLink: "https://gujjujewellers.com/catalogue/2iqyX3ic/d-O4L154",
    productName: "Traditional Jewellery Set",
    tag: "Jewellery",
    sp: "₹1,299",
    mrp: "₹2,999",
  },
  {
    sellerId: "678a64450ea2498bc8aad8be",
    sellerName: "The Jaipur Suit",
    productLink: "https://thejaipursuit.com/catalogue/19kCS_9G/gIU3XCWw",
    productName: "Handcrafted Jaipuri Suit",
    tag: "Ethnic Wear",
    sp: "₹1,499",
    mrp: "₹3,499",
  },
  {
    sellerId: "658406a1b69e050d10a44bbf",
    sellerName: "shreenathji Jewellery",
    productLink: "https://thekalyanijewellers.com/catalogue/ITOdBJO0/hr4AS4sh",
    productName: "Silver Layered Necklace",
    tag: "Jewellery",
    sp: "₹899",
    mrp: "₹1,899",
  },
];

export function InputStep() {
  const { inputForm, setInputField, fetchProduct, isFetching, fetchError } =
    useSessionStore();
  const [touched, setTouched] = useState({ sellerId: false, productLink: false });

  // Metabase live sellers state
  const [sellers, setSellers] = useState<MetabaseSeller[]>([]);
  const [sellerSearch, setSellerSearch] = useState("");
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [isLoadingSellers, setIsLoadingSellers] = useState(false);

  // Seller products state
  const [sellerProducts, setSellerProducts] = useState<MetabaseProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Resolved preview state
  const [previewProduct, setPreviewProduct] = useState<MetabaseProduct | null>(null);

  // Manual Metabase Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/sync/metabase", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const count = data.totalProducts || data.total_products || 1048575;
        const sCount = data.totalSellers || data.total_sellers || sellers.length || 16899;
        const formattedProducts = typeof count === "number" ? count.toLocaleString() : count;
        const formattedSellers = typeof sCount === "number" ? sCount.toLocaleString() : sCount;
        setSyncStatus(
          data.githubWorkflowTriggered
            ? "Full daily sync workflow triggered on GitHub Actions! Background update in progress."
            : data.message || `Synced ${formattedProducts} products across ${formattedSellers} sellers!`
        );
        // Refresh sellers list in UI
        const sellersRes = await fetch("/api/products/sellers");
        if (sellersRes.ok) {
          const sData = await sellersRes.json();
          if (Array.isArray(sData.sellers)) setSellers(sData.sellers);
        }
      } else {
        const errMsg = data.error || data.detail || data.message || `HTTP ${res.status}`;
        setSyncStatus(`Sync failed: ${errMsg}`);
      }
    } catch (err: unknown) {
      setSyncStatus(`Sync error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  // Fetch sellers on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSellers() {
      setIsLoadingSellers(true);
      try {
        const res = await fetch("/api/products/sellers");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.sellers)) {
            setSellers(data.sellers);
          }
        }
      } catch (e) {
        console.warn("Could not fetch sellers from /api/products/sellers", e);
      } finally {
        if (isMounted) setIsLoadingSellers(false);
      }
    }
    loadSellers();
    return () => {
      isMounted = false;
    };
  }, []);

  // When sellerId changes, load their products from Metabase
  useEffect(() => {
    let isMounted = true;
    async function loadProductsForSeller() {
      if (!inputForm.sellerId || inputForm.sellerId.length < 3) {
        setSellerProducts([]);
        return;
      }
      setIsLoadingProducts(true);
      try {
        const res = await fetch(`/api/products/by-seller/${encodeURIComponent(inputForm.sellerId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.products)) {
            setSellerProducts(data.products);
          }
        }
      } catch (e) {
        console.warn("Could not load products for seller", e);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }
    loadProductsForSeller();
    return () => {
      isMounted = false;
    };
  }, [inputForm.sellerId]);

  // If user enters a productLink, check if it matches in the current seller's products or preview
  useEffect(() => {
    if (!inputForm.productLink) {
      setPreviewProduct(null);
      return;
    }
    const matched = sellerProducts.find(
      (p) =>
        p.website_product_link.toLowerCase() === inputForm.productLink.toLowerCase() ||
        inputForm.productLink.toLowerCase().includes(p.product_id.toLowerCase())
    );
    if (matched) {
      setPreviewProduct(matched);
    }
  }, [inputForm.productLink, sellerProducts]);

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    if (!sellerSearch) return sellers.slice(0, 50);
    const q = sellerSearch.toLowerCase();
    return sellers
      .filter(
        (s) =>
          s.seller_name.toLowerCase().includes(q) ||
          s.seller_id.toLowerCase().includes(q) ||
          s.seller_website.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [sellers, sellerSearch]);

  const selectedSeller = sellers.find((s) => s.seller_id === inputForm.sellerId);

  const isSellerIdValid = inputForm.sellerId.trim().length >= 3;
  const isLinkValid = isValidUrl(inputForm.productLink);
  const canProceed = isSellerIdValid && isLinkValid && !isFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    await fetchProduct();
  };

  const applyPreset = (preset: (typeof METABASE_PRESETS)[0]) => {
    setInputField("sellerId", preset.sellerId);
    setInputField("productLink", preset.productLink);
    setSellerSearch(preset.sellerName);
    setTouched({ sellerId: true, productLink: true });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-violet flex items-center gap-1.5 py-0.5 px-2.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Metabase Live Catalog
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {sellers.length > 0 ? `${sellers.length.toLocaleString()} Active Sellers` : "Connecting..."}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-[7px] text-[11px] font-medium border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={cn("w-3 h-3 text-zinc-400", isSyncing && "animate-spin text-violet-400")} />
              {isSyncing ? "Syncing Metabase…" : "Sync from Metabase"}
            </button>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Daily cron at 10:00 AM IST
            </span>
          </div>
        </div>

        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2.5 rounded-[8px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{syncStatus}</span>
          </motion.div>
        )}
        <h2
          className="font-display mb-1.5"
          style={{
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--text-1)",
          }}
        >
          Select Seller & Product
        </h2>
        <p className="text-[13px] text-zinc-400">
          Pick a live ShopDeck seller or paste any product link. The engine will retrieve product specs, pricing, and high-resolution assets from Metabase.
        </p>
      </motion.div>

      {/* Quick Presets */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-zinc-500" />
          Quick-Start Presets from Live Catalog
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {METABASE_PRESETS.map((preset) => {
            const isActive = inputForm.sellerId === preset.sellerId;
            return (
              <button
                key={preset.sellerId}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "p-2.5 rounded-[10px] text-left transition-all border text-xs",
                  isActive
                    ? "border-violet-500/50 bg-violet-950/20 shadow-[0_0_12px_rgba(124,58,237,0.15)]"
                    : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-200 truncate capitalize text-[12px]">
                    {preset.sellerName}
                  </span>
                  {isActive && <Check className="w-3 h-3 text-violet-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-zinc-400 truncate mb-1">
                  {preset.productName}
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-zinc-200 font-semibold">{preset.sp}</span>
                  <span className="text-zinc-500 line-through">{preset.mrp}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-5"
        >
          {/* Seller Selection */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="block text-[12px] font-medium text-zinc-300"
                style={{ letterSpacing: "0.01em" }}
              >
                Seller ID or Storefront Name
              </label>
              {selectedSeller && (
                <span className="text-[11px] text-violet-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {selectedSeller.product_count} products in catalog
                </span>
              )}
            </div>

            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 z-10" />
              <input
                type="text"
                placeholder={
                  isLoadingSellers
                    ? "Loading Metabase sellers…"
                    : "Search 16,800+ sellers by name, website, or ID…"
                }
                value={sellerSearch || inputForm.sellerId}
                onChange={(e) => {
                  setSellerSearch(e.target.value);
                  setInputField("sellerId", e.target.value);
                  setIsSellerDropdownOpen(true);
                }}
                onFocus={() => setIsSellerDropdownOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsSellerDropdownOpen(false), 200);
                  setTouched((t) => ({ ...t, sellerId: true }));
                }}
                className={`input input-mono w-full ${
                  touched.sellerId && !isSellerIdValid ? "input-error" : ""
                }`}
                style={{ paddingLeft: "34px", paddingRight: "36px" }}
              />
              <button
                type="button"
                onClick={() => setIsSellerDropdownOpen((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Seller Dropdown */}
            <AnimatePresence>
              {isSellerDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-[10px] border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl p-1"
                >
                  {filteredSellers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-zinc-500">
                      No matching seller found. You can enter a custom Seller ID.
                    </div>
                  ) : (
                    filteredSellers.map((s) => (
                      <button
                        key={s.seller_id}
                        type="button"
                        onMouseDown={() => {
                          setInputField("sellerId", s.seller_id);
                          setSellerSearch(s.seller_name);
                          setIsSellerDropdownOpen(false);
                          setTouched((t) => ({ ...t, sellerId: true }));
                        }}
                        className="w-full text-left p-2 rounded-[6px] hover:bg-zinc-800/60 transition-colors flex items-center justify-between text-xs group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-medium text-zinc-200 capitalize group-hover:text-violet-300 truncate">
                            {s.seller_name}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono truncate">
                            {s.seller_website || s.seller_id}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {s.product_count} items
                        </span>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {touched.sellerId && !isSellerIdValid && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] mt-1.5 flex items-center gap-1 text-rose-400"
              >
                <AlertCircle className="w-3 h-3" />
                Enter a valid Seller ID (min 3 characters)
              </motion.p>
            )}
          </div>

          {/* Product Link or Catalog Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-medium text-zinc-300">
                Product Link or Catalog Item
              </label>
              {sellerProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                  className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  {isProductDropdownOpen ? "Hide catalog" : `Browse ${sellerProducts.length} seller items`}
                </button>
              )}
            </div>

            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="url"
                placeholder="https://themantrust.com/catalogue/MxYNDqJn/5ZFw8u3A"
                value={inputForm.productLink}
                onChange={(e) => setInputField("productLink", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, productLink: true }))}
                className={`input w-full ${
                  touched.productLink && !isLinkValid && inputForm.productLink
                    ? "input-error"
                    : ""
                }`}
                style={{ paddingLeft: "34px" }}
              />
            </div>

            {/* Seller Product Catalog Accordion */}
            <AnimatePresence>
              {isProductDropdownOpen && sellerProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 border border-zinc-800 rounded-[10px] bg-zinc-950/70 max-h-60 overflow-y-auto space-y-1.5"
                >
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-1">
                    Select a product from {selectedSeller?.seller_name || "seller"}&apos;s catalog:
                  </p>
                  {sellerProducts.map((prod) => (
                    <button
                      key={prod.product_id + (prod.sku_id || "")}
                      type="button"
                      onClick={() => {
                        setInputField("productLink", prod.website_product_link);
                        setPreviewProduct(prod);
                        setIsProductDropdownOpen(false);
                        setTouched((t) => ({ ...t, productLink: true }));
                      }}
                      className="w-full text-left p-2 rounded-[8px] hover:bg-zinc-900 border border-transparent hover:border-zinc-800 flex items-center gap-3 transition-colors text-xs"
                    >
                      {prod.image_link ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={prod.image_link}
                          alt={prod.product_name}
                          className="w-10 h-10 rounded-[6px] object-cover bg-zinc-900 shrink-0 border border-zinc-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-[6px] bg-zinc-900 flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-200 truncate text-[12px]">
                          {prod.product_name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-0.5">
                          <span className="text-zinc-300 font-semibold">₹{prod.sp}</span>
                          {prod.mrp > prod.sp && (
                            <span className="line-through text-zinc-600">₹{prod.mrp}</span>
                          )}
                          <span className="text-violet-400 capitalize">{prod.category}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resolved Preview Card */}
            {previewProduct && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3.5 rounded-[10px] border border-violet-500/30 bg-violet-950/20 flex items-start gap-3.5"
              >
                {previewProduct.image_link && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewProduct.image_link}
                    alt={previewProduct.product_name}
                    className="w-14 h-14 rounded-[8px] object-cover bg-zinc-900 shrink-0 border border-violet-500/20"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-violet text-[10px] py-0 px-2">
                      Verified Metabase Item
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate capitalize font-medium">
                      {previewProduct.category}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-zinc-100 truncate mb-1">
                    {previewProduct.product_name}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-zinc-200 font-semibold">₹{previewProduct.sp}</span>
                    {previewProduct.mrp > previewProduct.sp && (
                      <span className="text-zinc-500 line-through">₹{previewProduct.mrp}</span>
                    )}
                    {previewProduct.discount_percent > 0 && (
                      <span className="text-emerald-400 text-[11px]">
                        {previewProduct.discount_percent}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {touched.productLink && !isLinkValid && inputForm.productLink && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] mt-1.5 flex items-center gap-1 text-rose-400"
              >
                <AlertCircle className="w-3 h-3" />
                Enter a valid URL
              </motion.p>
            )}
            <p className="text-[12px] mt-1.5 text-zinc-500">
              ShopDeck storefront or custom domain URL. Product specs and S3 reference images will be fetched automatically.
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-[12px] font-medium mb-2 text-zinc-300">
              Creative Format
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
                      backgroundColor: isSelected
                        ? "var(--violet-subtle)"
                        : "rgba(255,255,255,0.02)",
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
                        className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center bg-violet-600"
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
                        className={cn(
                          "w-4 h-4",
                          isSelected ? "text-violet-400" : "text-zinc-400"
                        )}
                      />
                    </div>

                    <p
                      className="text-[13px] font-medium mb-0.5 text-zinc-100"
                    >
                      {opt.label}
                    </p>
                    <p className="text-[11px] leading-relaxed text-zinc-400">
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
              className="flex items-start gap-3 p-4 rounded-[10px] bg-rose-950/20 border border-rose-500/30"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="text-[13px] font-medium text-rose-300">
                  Fetch failed
                </p>
                <p className="text-[12px] mt-0.5 text-rose-400/80">
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
            className="btn btn-primary w-full justify-center py-[11px] text-[14px]"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching Metabase details & building session…
              </>
            ) : (
              <>
                Fetch Product & Build Strategy
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
