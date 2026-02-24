import { create } from "zustand";

export const useNetworkTabStore = create((set) => ({
    activeTab: "Requests",
    setActiveTab: (tab) => set({ activeTab: tab }),
}));