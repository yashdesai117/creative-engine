"use client";

import { create } from "zustand";
import type {
  SessionFlowState,
  Session,
  Format,
  OptionDraft,
  Concept,
} from "@/lib/types";
import {
  MOCK_PRODUCT,
  MOCK_OPTIONS,
  MOCK_TEMPLATES,
  MOCK_PROMPT,
} from "@/lib/mock-data";
import { generateConceptCode, generateAdName, sleep } from "@/lib/utils";

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
      // Simulate network delay
      await sleep(1800);

      // In production: call POST /products/resolve
      // const response = await fetch('/api/products/resolve', {
      //   method: 'POST',
      //   body: JSON.stringify({ sellerId: inputForm.sellerId, link: inputForm.productLink }),
      // });

      const mockSession: Session = {
        id: `sess-${Date.now()}`,
        userId: "current-user",
        sellerId: inputForm.sellerId,
        format: inputForm.format,
        status: "confirming",
        product: { ...MOCK_PRODUCT, sellerId: inputForm.sellerId },
        selectedTemplateIds: [],
        options: [],
        concepts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({ session: mockSession, isFetching: false, currentStep: 1 });
    } catch (err) {
      set({
        isFetching: false,
        fetchError: "Could not fetch product. Please check the link and try again.",
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

    // Simulate streaming generation
    await sleep(800);
    set({ generationProgress: 15 });
    await sleep(600);
    set({ generationProgress: 30, generationStep: "candidates" });
    await sleep(800);
    set({ generationProgress: 45 });
    await sleep(700);
    set({ generationProgress: 60, generationStep: "summaries" });
    await sleep(600);
    set({ generationProgress: 75 });
    await sleep(500);
    set({ generationProgress: 90 });
    await sleep(400);
    set({ generationProgress: 100, generationStep: "done" });

    await sleep(300);

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
    await sleep(2500);

    set((state) => ({
      isGeneratingPrompts: false,
      session: state.session
        ? {
            ...state.session,
            concepts: state.session.concepts.map((c, i) => ({
              ...c,
              finalPrompt:
                i === 0 ? MOCK_PROMPT : `${MOCK_PROMPT}\n\n[CONCEPT VARIANT ${i + 1}]\nHook: ${c.option.hookLine}\nProblem: ${c.option.problem}`,
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
