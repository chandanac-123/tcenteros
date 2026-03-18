import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useNetworkTabStore = create((set) => ({
    activeTab: "Requests",
    setActiveTab: (tab) => set({ activeTab: tab }),
}));

export const useInventoryStore = create(
  persist(
    (set) => ({
      activeTab: "Overview",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "inventory_tab", 
    }
  )
);