import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    set => ({
      openedCartResponse: null,
      setOpenedCartResponse: payload => set({ openedCartResponse: payload }),
      clearOpenedCartResponse: () => set({ openedCartResponse: null })
    }),
    {
      name: 'cart_store'
    }
  )
)
