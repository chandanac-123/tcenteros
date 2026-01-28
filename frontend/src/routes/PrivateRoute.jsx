import { Navigate, Outlet } from 'react-router-dom'
import {  useAuthStore } from '../context/AuthContext'

const PrivateRoute = () => {
  const { user } = useAuthStore()
  return user ? <Outlet /> : <Navigate to='/login' replace />
}

export default PrivateRoute
