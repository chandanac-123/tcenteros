import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialPartnerOnboardingDraft = {
  full_name: '',
  mobile: '',
  email: '',
  address_line_1: '',
  city: '',
  state: '',
  country: '',
  previous_sales_experience: '',
  account_holder_name: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  terms_accepted: false
}

export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      //  CENTER MANAGEMENT TOOLs
      featureIdMap: {},
      setFeatureIdMap: featureMap => set({ featureIdMap: featureMap }),
      centerTools: {},
      onboardId: null,
      setOnboardId: id => set({ onboardId: id }),
      partnerOnboardingResponse: null,
      setPartnerOnboardingResponse: response =>
        set({ partnerOnboardingResponse: response }),
      partnerOnboardingDraft: initialPartnerOnboardingDraft,
      setPartnerOnboardingDraft: values =>
        set(state => ({
          partnerOnboardingDraft: {
            ...state.partnerOnboardingDraft,
            ...values
          }
        })),
      resetPartnerOnboardingDraft: () =>
        set({ partnerOnboardingDraft: initialPartnerOnboardingDraft }),

      // UPDATED: store enabled + feature_id
      setTool: (toolKey, enabled, featureId, featureName) =>
        set(state => ({
          centerTools: {
            ...state.centerTools,
            [toolKey]: {
              enabled,
              feature_id: featureId ?? toolKey,
              feature_name: featureName
            }
          }
        })),

      //  OTHER ONBOARDING STATE

      attendanceType: null,
      setAttendanceType: type => set({ attendanceType: type }),

      sellableItem: 'merchandise',
      setSellableItem: type => set({ sellableItem: type }),

      typeSelectionId: '',
      typeSelectionName: '',
      setTypeSelection: (id, name) =>
        set({ typeSelectionId: id, typeSelectionName: name }),

      classMode: 'in-person',
      setClassMode: value => set({ classMode: value }),

      memberCount: '50-150',
      setMemberCount: value => set({ memberCount: value }),

      trainerCount: '3-5',
      setTrainerCount: value => set({ trainerCount: value }),

      digitalToolsSelected: ['website'],
      setDigitalToolsSelected: value => set({ digitalToolsSelected: value }),

      marketingSupportType: [],
      setMarketingSupportType: value => set({ marketingSupportType: value }),

      resetStore: () =>
        set({
          featureIdMap: {},
          centerTools: {},
          onboardId: null,
          partnerOnboardingResponse: null,
          partnerOnboardingDraft: initialPartnerOnboardingDraft,
          attendanceType: null,
          sellableItem: 'merchandise',
          typeSelectionId: '',
          typeSelectionName: '',
          classMode: 'in-person',
          memberCount: '50-150',
          trainerCount: '3-5',
          digitalToolsSelected: ['website'],
          marketingSupportType: []
        })
    }),
    {
      name: 'onboarding-storage'
    }
  )
)
