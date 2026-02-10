import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    set => ({
      auth: null,
      accessToken: null,
      refreshToken: null,
      setAuth: auth =>
        set({
          auth,
          accessToken: auth?.access_token || null, // use the correct property name
          refreshToken: auth?.refresh_token || null
        }),
      clearAuth: () => ({
        auth: null,
        accessToken: null,
        refreshToken: null
      })
    }),
    { name: 'auth-store' }
  )
)
