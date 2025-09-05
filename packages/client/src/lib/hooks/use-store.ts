import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StorePersist {
  bears: number;
  setBears: (bears: number) => void;
}

export const useStorePersist = create<StorePersist>()(
  persist(
    (set) => ({
      bears: 0,
      setBears: (bears: number) => set({ bears }),
    }),
    { name: "zustand" }
  )
);
