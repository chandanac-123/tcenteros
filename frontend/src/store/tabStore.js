import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* -----------------------------
   Generic Tab Store (Reusable)
-------------------------------- */
const createTabStore = storageKey =>
  create(
    persist(
      set => ({
        selectedTab: 1,
        setSelectedTab: id => set({ selectedTab: id })
      }),
      {
        name: storageKey
      }
    )
  )

export const useSettingsTabStore = createTabStore('settings_selected_tab')
export const useAttendanceStore = createTabStore('attendance_selected_tab')
export const useIventoriesTabStore = createTabStore('iventories_selected_tab')

/* -----------------------------
   CRM Store (Custom)
-------------------------------- */
export const useCrmStore = create(
  persist(
    set => ({
      selectedTab: 1,
      setSelectedTab: id => set({ selectedTab: id }),

      memberView: 'list',
      setMemberView: view => set({ memberView: view }),

      selectedMemberId: null,
      setSelectedMemberId: id => set({ selectedMemberId: id })
    }),
    {
      name: 'crm_store'
    }
  )
)
