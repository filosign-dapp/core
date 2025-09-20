import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateForm } from "@/src/pages/dashboard/envelope/create/types";

interface OnboardingForm {
  name: string;
  pin: string;
  hasOnboarded: boolean;
  selectedSignature?: string;
}

interface SidebarState {
  isOpen: boolean;
  expandedItems: string[];
  lastClickedMenu?: string;
}

interface StorePersist {
  createForm: CreateForm | null;
  setCreateForm: (form: CreateForm) => void;
  clearCreateForm: () => void;

  onboardingForm: OnboardingForm | null;
  setOnboardingForm: (form: OnboardingForm | null) => void;
  clearOnboardingForm: () => void;

  sidebar: SidebarState;
  setSidebar: (sidebar: Partial<SidebarState>) => void;
}

export const useStorePersist = create<StorePersist>()(
  persist(
    (set, get) => ({
      createForm: null,
      setCreateForm: (form: CreateForm) => set({ createForm: form }),
      clearCreateForm: () => set({ createForm: null }),

      onboardingForm: null,
      setOnboardingForm: (form: OnboardingForm | null) => set({ onboardingForm: form }),
      clearOnboardingForm: () => set({ onboardingForm: null }),

      sidebar: {
        isOpen: true,
        expandedItems: [],
        lastClickedMenu: undefined,
      },
      setSidebar: (updates: Partial<SidebarState>) =>
        set((state) => ({
          sidebar: { ...state.sidebar, ...updates }
        })),
    }),
    { name: "zustand" }
  )
);
