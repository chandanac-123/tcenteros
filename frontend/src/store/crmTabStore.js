import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCrmStore = create(
  persist(
    (set) => ({
      selectedTab: 1,
      setSelectedTab: (id) => set({ selectedTab: id }),
}), { name: 'crm_selected_tab', } ) )