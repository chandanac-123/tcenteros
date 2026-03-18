import { applyTheme } from '@utils/helper'
import { create } from 'zustand'

export const useBrandingStore = create(set => ({
  branding: {
    logo_url: null,
    primary_color: '#1452D4',
    secondary_color: '#8B24E2'
  },

  setBranding: data => {
    const merged = { ...data }
    applyTheme(merged)
    set({ branding: merged })
    localStorage.setItem('branding', JSON.stringify(merged))
  },

  loadBrandingFromStorage: () => {
    const saved = localStorage.getItem('branding')
    if (saved) {
      const parsed = JSON.parse(saved)
      applyTheme(parsed)
      set({ branding: parsed })
    }
  },

  loadBrandingFromAPI: apiData => {
    if (!apiData) return
    const brandingData = {
      logo_url: apiData?.logo_url || null,
      primary_color: apiData?.primary_color || '#1452D4',
      secondary_color: apiData?.secondary_color || '#100F0F'
    }

    applyTheme(brandingData)
    set({ branding: brandingData })
    localStorage.setItem('branding', JSON.stringify(brandingData))
  }
}))
