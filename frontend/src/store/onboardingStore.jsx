import { create } from 'zustand'

export const useOnboardingStore = create(set => ({
  centerTools: {},

  setTool: (toolId, value) =>
    set(state => ({
      centerTools: {
        ...state.centerTools,
        [toolId]: value
      }
    }))
}))
