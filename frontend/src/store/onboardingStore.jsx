import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// In your zustand store
export const useOnboardingStore = create(
  persist(
    set => ({
      centerTools: {},
      setTool: (toolId, value) =>
        set(state => ({
          centerTools: {
            ...state.centerTools,
            [toolId]: value
          }
        })),
      attendanceType: 'manual',
      setAttendanceType: type => set({ attendanceType: type }),
      sellableItem: 'merchandise',
      setSellableItem: type => set({ sellableItem: type }),
      slotControl: null, // 'yes' or 'no'
      setSlotControl: value => set({ slotControl: value }),
      payment_Billing: null, // 'yes' or 'no'
      setPaymentBilling: value => set({ payment_Billing: value }),
      reportAndInsight: 'basic-report',
      setReportAndInsight: value => set({ reportAndInsight: value }),
      trainerAndStaff: null, // 'yes' or 'no'
      setTrainerAndStaff: value => set({ trainerAndStaff: value }),
      typeSelection: 'dance',
      setTypeSelection: value => set({ typeSelection: value }),
      classMode: 'in-person',
      setClassMode: value => set({ classMode: value }),
      memberCount: '50-150',
      setMemberCount: value => set({ memberCount: value }),
      trainerCount: '3-5',
      setTrainerCount: value => set({ trainerCount: value }),
      digitalToolsSelected: ['website'],
      setDigitalToolsSelected: value => set({ digitalToolsSelected: value }),
      marketingSupportType: 'metacampaign',
      setMarketingSupportType: value => set({ marketingSupportType: value })
    }),
    {
      name: 'onboarding-storage'
    }
  )
)
