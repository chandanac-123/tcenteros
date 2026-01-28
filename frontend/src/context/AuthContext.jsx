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



// import { create } from 'zustand'

// export const useAuthStore = create(set => ({
//   accessToken: null,
//   user: null,

//   login: (token, userData) =>
//     set({
//       accessToken: token,
//       user: userData
//     }),

//   logout: () =>
//     set({
//       accessToken: null,
//       user: null
//     })
// }))

// const isAuthenticated = useAuthStore(
//   state => Boolean(state.accessToken)
// )
