import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

const PrivateRoute = () => {
  const accessToken = useAuthStore(state => state.accessToken)
  return accessToken ? <Outlet /> : <Navigate to='/login' replace />
}

export default PrivateRoute
