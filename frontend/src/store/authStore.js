import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: null,
      accessToken: null,
      refreshToken: null,
      userNumber: null,
      firstLogin: false,
      _hasHydrated: false,
      setAuth: (auth, firstLogin) =>
        set((state) => ({
          auth: {
            ...(state.auth || {}),
            ...auth,
          },
          accessToken: auth?.access_token ?? state.accessToken,
          refreshToken: auth?.refresh_token ?? state.refreshToken,
          firstLogin: firstLogin ?? state.firstLogin,
        })),
      setUserNumber: (number) => set({ userNumber: number }),
      setFirstLogin: (value) => set({ firstLogin: value }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      clearAuth: () =>
        set({
          auth: null,
          accessToken: null,
          refreshToken: null,
          userNumber: null,
        }),
    }),
    {
      name: "auth-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
