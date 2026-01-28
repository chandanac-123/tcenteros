import { create } from 'zustand'

export const useAuthStore = create(set => ({
  user: !!localStorage.getItem('token'),
  login: (token) => {
    localStorage.setItem('token', token)
    set({ user: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: false })
  }
}))

// const { user, login, logout } = useAuthStore()