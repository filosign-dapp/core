import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateForm } from "@/src/pages/dashboard/envelope/create/types";

interface OnboardingForm {
  name: string;
}

interface StorePersist {
  createForm: CreateForm | null;
  setCreateForm: (form: CreateForm) => void;
  clearCreateForm: () => void;

  onboardingForm: OnboardingForm | null;
  setOnboardingForm: (form: OnboardingForm | null) => void;
  clearOnboardingForm: () => void;
}

export const useStorePersist = create<StorePersist>()(
  persist(
    (set) => ({
      createForm: null,
      setCreateForm: (form: CreateForm) => set({ createForm: form }),
      clearCreateForm: () => set({ createForm: null }),

      onboardingForm: null,
      setOnboardingForm: (form: OnboardingForm | null) => set({ onboardingForm: form }),
      clearOnboardingForm: () => set({ onboardingForm: null }),
    }),
    { name: "zustand" }
  )
);
