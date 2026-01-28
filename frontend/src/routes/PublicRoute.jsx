import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "src/context/AuthContext"

const PublicRoute = () => {
  const { user } = useAuthStore()
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default PublicRoute
