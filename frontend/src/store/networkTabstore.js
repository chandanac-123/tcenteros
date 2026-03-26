import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useNetworkTabStore = create((set) => ({
    activeTab: "requests",
    setActiveTab: (tab) => set({ activeTab: tab }),
}));

export const useInventoryStore = create(
  persist(
    (set) => ({
      activeTab: "overview",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "inventory_tab", 
    }
  )
);