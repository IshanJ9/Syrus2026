/* ── Zustand store — single source of truth ── */

import { create } from "zustand";
import type {
  JewelryDesign,
  AppStatus,
  OptimizationSuggestion,
} from "@/types/jewelry";

interface JewelryState {
  // App status
  status: AppStatus;
  errorMessage: string;

  // Upload
  uploadedImagePath: string;
  uploadedFileName: string;

  // Design (populated after generation)
  design: JewelryDesign | null;

  // Budget
  budgetTarget: number;
  suggestions: OptimizationSuggestion[];

  // Actions
  setStatus: (s: AppStatus, msg?: string) => void;
  setUpload: (path: string, name: string) => void;
  setDesign: (d: JewelryDesign) => void;
  updateDesignField: <K extends keyof JewelryDesign>(
    key: K,
    value: JewelryDesign[K]
  ) => void;
  setBudgetTarget: (b: number) => void;
  setSuggestions: (s: OptimizationSuggestion[]) => void;
  reset: () => void;
}

const initialState = {
  status: "idle" as AppStatus,
  errorMessage: "",
  uploadedImagePath: "",
  uploadedFileName: "",
  design: null as JewelryDesign | null,
  budgetTarget: 0,
  suggestions: [] as OptimizationSuggestion[],
};

export const useJewelryStore = create<JewelryState>((set) => ({
  ...initialState,

  setStatus: (status, msg) =>
    set({ status, errorMessage: msg ?? "" }),

  setUpload: (path, name) =>
    set({ uploadedImagePath: path, uploadedFileName: name }),

  setDesign: (design) =>
    set({ design, status: "ready" }),

  updateDesignField: (key, value) =>
    set((state) => {
      if (!state.design) return {};
      return { design: { ...state.design, [key]: value } };
    }),

  setBudgetTarget: (budgetTarget) => set({ budgetTarget }),

  setSuggestions: (suggestions) => set({ suggestions }),

  reset: () => set(initialState),
}));
