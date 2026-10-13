import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function generateConceptCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function generateAdName(params: {
  sellerId: string;
  conceptCode: string;
  templateSlug: string;
  format: string;
}): string {
  return `${params.sellerId}_${params.conceptCode}_${params.templateSlug}_${params.format}`.toUpperCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "Recently";
  }
}

export function getDiscountPercent(mrp: number, sp: number): number {
  if (mrp <= 0 || sp >= mrp) return 0;
  return Math.round(((mrp - sp) / mrp) * 100);
}

export function getMarginPercent(sp: number, cp: number): number {
  if (sp <= 0) return 0;
  return Math.round(((sp - cp) / sp) * 100);
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "text-amber-400 bg-amber-400/10",
    approved: "text-emerald-400 bg-emerald-400/10",
    launched: "text-cyan-400 bg-cyan-400/10",
    selected: "text-brand-400 bg-brand-400/10",
    locked: "text-emerald-400 bg-emerald-400/10",
    discarded: "text-rose-400 bg-rose-400/10",
    generating: "text-violet-400 bg-violet-400/10",
    certified: "text-emerald-400 bg-emerald-400/10",
    pending: "text-amber-400 bg-amber-400/10",
    failed: "text-rose-400 bg-rose-400/10",
  };
  return map[status] ?? "text-gray-400 bg-gray-400/10";
}

export function downloadCSV(filename: string, rows: Array<Record<string, string>>) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => `"${(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
