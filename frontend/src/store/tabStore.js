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
        setSelectedTab: id => set({ selectedTab: id }),
        resetSelectedTab: () => set({ selectedTab: 1 })
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
  set => ({
    selectedTab: 1,
    setSelectedTab: id => set({ selectedTab: id }),

    memberView: 'list',
    setMemberView: view => set({ memberView: view }),

    visitorView: 'list',
    setVisitorView: view => set({ visitorView: view }),

    guestView: 'list',
    setGuestView: view => set({ guestView: view }),

    selectedMemberId: null,
    setSelectedMemberId: id => set({ selectedMemberId: id }),

    selectedVisitorId: null,
    setSelectedVisitorId: id => set({ selectedVisitorId: id }),

    selectedGuestId: null,
    setSelectedGuestId: id => set({ selectedGuestId: id }),

    clearSelectedIds: () =>
      set({
        selectedMemberId: null,
        selectedVisitorId: null,
        selectedGuestId: null
      }),

    resetCrmState: () =>
      set({
        selectedTab: 1,
        memberView: 'list',
        visitorView: 'list',
        guestView: 'list',
        selectedMemberId: null,
        selectedVisitorId: null,
        selectedGuestId: null
      })
  }),
  {
    name: 'crm_store'
  }
)
