import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      //  CENTER MANAGEMENT TOOLs
      featureIdMap: {},
      setFeatureIdMap: featureMap => set({ featureIdMap: featureMap }),
      centerTools: {},
      onboardId: null,
      setOnboardId: id => set({ onboardId: id }),

      // UPDATED: store enabled + feature_id
      setTool: (toolKey, enabled, featureId) =>
        set(state => ({
          centerTools: {
            ...state.centerTools,
            [toolKey]: {
              enabled,
              feature_id: featureId ?? toolKey
            }
          }
        })),

      //  OTHER ONBOARDING STATE

      attendanceType: null,
      setAttendanceType: type => set({ attendanceType: type }),

      sellableItem: 'merchandise',
      setSellableItem: type => set({ sellableItem: type }),

      slotControl: null,
      setSlotControl: value => set({ slotControl: value }),

      payment_Billing: null,
      setPaymentBilling: value => set({ payment_Billing: value }),

      reportAndInsight: 'basic-report',
      setReportAndInsight: value => set({ reportAndInsight: value }),

      trainerAndStaff: null,
      setTrainerAndStaff: value => set({ trainerAndStaff: value }),

      typeSelectionId: '',
      typeSelectionName: '',
      setTypeSelection: (id, name) => set({ typeSelectionId: id, typeSelectionName: name }),

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
