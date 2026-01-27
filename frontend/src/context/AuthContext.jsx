import { createContext, useContext, useState } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  // Example: token-based auth
  const [user, setUser] = useState(
    localStorage.getItem("token") ? true : false
  )

  const login = (token) => {
    localStorage.setItem("token", token)
    setUser(true)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
