import { applyTheme } from '@utils/helper'
import { create } from 'zustand'

const defaultBranding = {
  logo_url: null,
  primary_color: '#1452D4',
  secondary_color: '#100F0F'
}

export const useBrandingStore = create(set => ({
  branding: defaultBranding,

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
    const brandingData = {
      logo_url: apiData?.logo_url || defaultBranding.logo_url,
      primary_color: apiData?.primary_color || defaultBranding.primary_color,
      secondary_color:
        apiData?.secondary_color || defaultBranding.secondary_color
    }

    applyTheme(brandingData)
    set({ branding: brandingData })
    localStorage.setItem('branding', JSON.stringify(brandingData))
  }
}))
