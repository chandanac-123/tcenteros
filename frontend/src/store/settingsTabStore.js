import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsTabStore = create(
  persist(
    (set) => ({
      selectedTab: 1,
      setSelectedTab: (id) => set({ selectedTab: id }),
    }),
    {
      name: 'settings_selected_tab',
    }
  )
)
