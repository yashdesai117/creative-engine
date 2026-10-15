"use client";

import { create } from "zustand";
import type {
  SessionFlowState,
  Session,
  Format,
  OptionDraft,
  Concept,
  ProductData,
} from "@/lib/types";
import {
  MOCK_PRODUCT,
  MOCK_OPTIONS,
  MOCK_TEMPLATES,
  MOCK_PROMPT,
  MOCK_BANNER_PROMPT,
  MOCK_VIDEO_PROMPT_2PARTS,
} from "@/lib/mock-data";
import { generateConceptCode, generateAdName, sleep } from "@/lib/utils";
import { getStoredApiKeys, hasActiveLlmKey } from "@/lib/keys";

const initialInputForm = {
  sellerId: "",
  productLink: "",
  format: "banner" as Format,
};

const initialState = {
  session: null as Session | null,
  currentStep: 0,
  inputForm: { ...initialInputForm },
  isFetching: false,
  fetchError: null as string | null,
  isGenerating: false,
  generationProgress: 0,
  generationStep: null as SessionFlowState["generationStep"],
  isGeneratingPrompts: false,
};

export const useSessionStore = create<SessionFlowState>()((set, get) => ({
  ...initialState,

  setInputField: (field, value) =>
    set((state) => ({
      inputForm: { ...state.inputForm, [field]: value },
    })),

  setStep: (step) => set({ currentStep: step }),

  fetchProduct: async () => {
    const { inputForm } = get();
    set({ isFetching: true, fetchError: null });

    try {
      let resolvedProduct: ProductData | null = null;

      try {
        const response = await fetch("/api/products/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellerId: inputForm.sellerId,
            seller_id: inputForm.sellerId,
            productLink: inputForm.productLink,
            product_link: inputForm.productLink,
            format: inputForm.format,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const marginPercent =
            data.sp && data.cp && data.sp > 0
              ? Math.round(((data.sp - data.cp) / data.sp) * 1000) / 10
              : undefined;

          resolvedProduct = {
            sellerId: data.seller_id || data.sellerId || inputForm.sellerId,
            productLink: inputForm.productLink,
            productId: data.product_id || data.productId || "PROD-001",
            title: data.title || "ShopDeck Product",
            description: data.description || "",
            category: data.category || "General",
            sp: Number(data.sp) || 0,
            mrp: Number(data.mrp) || Number(data.sp) || 0,
            cp: data.cp ? Number(data.cp) : undefined,
            discountPercent: Number(data.discount_percent ?? data.discountPercent) || 0,
            marginPercent,
            images: Array.isArray(data.images) ? data.images : [],
            referenceImages: Array.isArray(data.images)
              ? data.images.map((img: { url: string }) => img.url)
              : [],
            variant: data.variant || undefined,
            isInStock: Boolean(data.is_in_stock ?? data.isInStock ?? true),
            isPublished: Boolean(data.is_published ?? data.isPublished ?? true),
            fieldSources: data.field_sources || data.fieldSources || {
              title: "database",
              sp: "database",
              mrp: "database",
              category: "database",
            },
            fetchedAt: data.fetched_at || data.fetchedAt || new Date().toISOString(),
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          let errMsg: string = errData.error || errData.message || "";
          if (!errMsg && errData.detail) {
            if (typeof errData.detail === "string") {
              errMsg = errData.detail;
            } else if (Array.isArray(errData.detail)) {
              errMsg = errData.detail
                .map((d: any) => `${d.loc ? d.loc.slice(1).join(".") + ": " : ""}${d.msg || JSON.stringify(d)}`)
                .join("; ");
            } else {
              errMsg = JSON.stringify(errData.detail);
            }
          }
          throw new Error(
            errMsg || `Product not found in Metabase catalog (HTTP ${response.status})`
          );
        }
      } catch (apiErr: unknown) {
        const msg = apiErr instanceof Error ? apiErr.message : String(apiErr);
        console.warn("Product resolution failed:", msg);
        set({
          isFetching: false,
          fetchError:
            msg ||
            "Could not find this product in the Metabase catalog. Please choose one of the available catalog items or check the product link.",
        });
        return;
      }

      if (!resolvedProduct) {
        set({
          isFetching: false,
          fetchError:
            "Product could not be identified in Metabase. Please verify the URL or select an item from the catalog.",
        });
        return;
      }

      const session: Session = {
        id: `sess-${Date.now()}`,
        userId: "current-user",
        sellerId: resolvedProduct.sellerId,
        format: inputForm.format,
        status: "confirming",
        product: resolvedProduct,
        selectedTemplateIds: [],
        options: [],
        concepts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({ session, isFetching: false, currentStep: 1 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({
        isFetching: false,
        fetchError: msg || "Could not fetch product. Please check the link and try again.",
      });
    }
  },

  selectTemplate: (templateId) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            selectedTemplateIds: state.session.selectedTemplateIds.includes(templateId)
              ? state.session.selectedTemplateIds
              : [...state.session.selectedTemplateIds, templateId],
          }
        : null,
    })),

  deselectTemplate: (templateId) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            selectedTemplateIds: state.session.selectedTemplateIds.filter(
              (id) => id !== templateId
            ),
          }
        : null,
    })),

  generateOptions: async () => {
    set({
      isGenerating: true,
      generationProgress: 0,
      generationStep: "candidates",
    });

    const { session } = get();
    const keys = getStoredApiKeys();
    const hasKey = Boolean(
      (keys.defaultProvider === "claude" && keys.claudeKey?.trim()) ||
      (keys.defaultProvider === "gemini" && keys.geminiKey?.trim()) ||
      keys.geminiKey?.trim() ||
      keys.claudeKey?.trim()
    );

    // If an API key is entered, perform real generation using the user's key
    if (hasKey && session?.product) {
      let progressTimer: any;
      try {
        set({ generationProgress: 15, generationStep: "candidates" });
        let currentP = 15;
        progressTimer = setInterval(() => {
          currentP = Math.min(currentP + 12, 88);
          set({
            generationProgress: currentP,
            generationStep: currentP > 50 ? "summaries" : "candidates",
          });
        }, 500);

        const res = await fetch("/api/llm/generate-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: session.product,
            templateIds: session.selectedTemplateIds,
            format: session.format,
            keys,
          }),
        });

        clearInterval(progressTimer);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `LLM generation error (status ${res.status})`);
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.options) && data.options.length > 0) {
          set({ generationProgress: 100, generationStep: "done" });
          await sleep(350);
          set((state) => ({
            isGenerating: false,
            generationStep: null,
            currentStep: 4,
            session: state.session
              ? {
                  ...state.session,
                  status: "reviewing",
                  options: data.options,
                }
              : null,
          }));
          return;
        }
      } catch (err: any) {
        if (progressTimer) clearInterval(progressTimer);
        console.warn("Live LLM options generation failed, using specimens:", err.message);
      }
    }

    // Default specimen generation simulation
    await sleep(600);
    set({ generationProgress: 20 });
    await sleep(500);
    set({ generationProgress: 40, generationStep: "candidates" });
    await sleep(500);
    set({ generationProgress: 65, generationStep: "summaries" });
    await sleep(400);
    set({ generationProgress: 85 });
    await sleep(300);
    set({ generationProgress: 100, generationStep: "done" });
    await sleep(250);

    set((state) => ({
      isGenerating: false,
      generationStep: null,
      currentStep: 4,
      session: state.session
        ? {
            ...state.session,
            status: "reviewing",
            options: MOCK_OPTIONS,
          }
        : null,
    }));
  },

  updateOption: (optionId, updates) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            options: state.session.options.map((o) =>
              o.id === optionId ? { ...o, ...updates, isEdited: true } : o
            ),
          }
        : null,
    })),

  selectOption: (optionId) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            options: state.session.options.map((o) =>
              o.id === optionId
                ? { ...o, status: o.status === "selected" ? "reviewing" : "selected" }
                : o
            ),
          }
        : null,
    })),

  lockOption: (optionId) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            options: state.session.options.map((o) =>
              o.id === optionId
                ? { ...o, status: o.status === "locked" ? "reviewing" : "locked" }
                : o
            ),
          }
        : null,
    })),

  discardOption: (optionId) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            options: state.session.options.map((o) =>
              o.id === optionId ? { ...o, status: "discarded" } : o
            ),
          }
        : null,
    })),

  regenerateOption: async (optionId) => {
    // Simulate regeneration
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            options: state.session.options.map((o) =>
              o.id === optionId ? { ...o, status: "pending" } : o
            ),
          }
        : null,
    }));

    await sleep(2000);

    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            options: state.session.options.map((o) =>
              o.id === optionId
                ? { ...o, status: "reviewing", isEdited: false, score: Math.floor(Math.random() * 20) + 75 }
                : o
            ),
          }
        : null,
    }));
  },

  approveSelected: async () => {
    const { session } = get();
    if (!session) return;

    const selectedOptions = session.options.filter(
      (o) => o.status === "selected" || o.status === "locked"
    );

    const concepts: Concept[] = selectedOptions.map((option) => {
      const template = MOCK_TEMPLATES.find((t) => t.id === option.templateId);
      const conceptCode = generateConceptCode();
      return {
        id: `concept-${Date.now()}-${Math.random()}`,
        conceptCode,
        adName: generateAdName({
          sellerId: session.sellerId,
          conceptCode,
          templateSlug: template?.slug ?? "custom",
          format: session.format,
        }),
        optionId: option.id,
        option,
        finalPrompt: "",
        promptVersion: "1.0",
        status: "draft",
        approvedBy: "current-user",
        approvedAt: new Date().toISOString(),
      };
    });

    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            status: "approved",
            concepts,
          }
        : null,
      currentStep: 5,
    }));
  },

  generatePrompts: async () => {
    set({ isGeneratingPrompts: true });

    const { session } = get();
    const isVideo = session?.format === "video";
    const baseMock = isVideo ? MOCK_VIDEO_PROMPT_2PARTS : MOCK_BANNER_PROMPT;

    const keys = getStoredApiKeys();
    const hasKey = Boolean(
      (keys.defaultProvider === "claude" && keys.claudeKey?.trim()) ||
      (keys.defaultProvider === "gemini" && keys.geminiKey?.trim()) ||
      keys.geminiKey?.trim() ||
      keys.claudeKey?.trim()
    );

    if (hasKey && session?.product && session?.concepts?.length > 0) {
      try {
        const res = await fetch("/api/llm/generate-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: session.product,
            concepts: session.concepts,
            format: session.format,
            keys,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.prompts)) {
            const promptMap = new Map<string, string>();
            data.prompts.forEach((p: { conceptId: string; finalPrompt: string }) => {
              promptMap.set(p.conceptId, p.finalPrompt);
            });

            set((state) => ({
              isGeneratingPrompts: false,
              session: state.session
                ? {
                    ...state.session,
                    concepts: state.session.concepts.map((c) => ({
                      ...c,
                      finalPrompt: promptMap.get(c.id) || c.finalPrompt || baseMock,
                      status: "approved",
                    })),
                  }
                : null,
            }));
            return;
          }
        }
      } catch (err: any) {
        console.warn("Live prompt generation failed, falling back to specimens:", err.message);
      }
    }

    await sleep(2000);

    set((state) => ({
      isGeneratingPrompts: false,
      session: state.session
        ? {
            ...state.session,
            concepts: state.session.concepts.map((c, i) => ({
              ...c,
              finalPrompt:
                i === 0
                  ? baseMock
                  : `${baseMock}\n\n[VARIANT ${i + 1} — ANGLE: ${c.option.angle}]\nHook: ${c.option.hookLine}\nProblem: ${c.option.problem}`,
              status: "approved",
            })),
          }
        : null,
    }));
  },

  copyPrompt: (conceptId) => {
    const { session } = get();
    const concept = session?.concepts.find((c) => c.id === conceptId);
    if (concept?.finalPrompt) {
      navigator.clipboard.writeText(concept.finalPrompt);
    }
  },

  reset: () =>
    set({
      ...initialState,
      inputForm: { ...initialInputForm },
    }),
}));
