import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

const PublicRoute = () => {
  const { accessToken, firstLogin } = useAuthStore()

  if (accessToken && !firstLogin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute
