import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const createTabStore = (storageKey) =>
  create(
    persist(
      (set) => ({
        selectedTab: 1,
        setSelectedTab: (id) => set({ selectedTab: id }),
      }),
      {
        name: storageKey,
      }
    )
  )

export const useCrmStore = createTabStore('crm_selected_tab')
export const useSettingsTabStore = createTabStore('settings_selected_tab')
export const useAttendanceStore = createTabStore('attendance_selected_tab')
export const useIventoriesTabStore = createTabStore('iventories_selected_tab')