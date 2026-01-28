import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// In your zustand store
export const useOnboardingStore = create(
  persist(
    set => ({
      centerTools: {},
      attendanceType: 'manual',
      sellableItem: 'merchandise',
      slotControl: null, // 'yes' or 'no'
      payment_Billing: null, // 'yes' or 'no'
      reportAndInsight: 'basic-report',
      trainerAndStaff: null, // 'yes' or 'no'
      setTool: (toolId, value) =>
        set(state => ({
          centerTools: {
            ...state.centerTools,
            [toolId]: value
          }
        })),
      setAttendanceType: type => set({ attendanceType: type }),
      setSellableItem: type => set({ sellableItem: type }),
      setSlotControl: value => set({ slotControl: value }),
      setPaymentBilling: value => set({ payment_Billing: value }),
      setReportAndInsight: value => set({ reportAndInsight: value }),
      setTrainerAndStaff: value => set({ trainerAndStaff: value })
    }),
    {
      name: 'onboarding-storage'
    }
  )
)
