import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateForm } from "@/src/pages/dashboard/envelope/create/types";

interface StorePersist {
  createForm: CreateForm | null;
  setCreateForm: (form: CreateForm) => void;
  clearCreateForm: () => void;
}

export const useStorePersist = create<StorePersist>()(
  persist(
    (set) => ({
      createForm: null,
      setCreateForm: (form: CreateForm) => set({ createForm: form }),
      clearCreateForm: () => set({ createForm: null }),
    }),
    { name: "zustand" }
  )
);
