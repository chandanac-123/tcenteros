import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    set => ({
      auth: null,
      accessToken: null,
      refreshToken: null,
      firstLogin: false,
      setAuth: (auth, firstLogin = false) =>
        set({
          auth,
          accessToken: auth?.access_token || null,
          refreshToken: auth?.refresh_token || null,
          firstLogin
        }),
        setFirstLogin: value => set({ firstLogin: value }),
      clearAuth: () =>
        set({
          auth: null,
          accessToken: null,
          refreshToken: null
        })
    }),
    { name: 'auth-store' }
  )
)
