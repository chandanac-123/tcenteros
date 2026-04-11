import { useAuthStore } from '@store/authStore'
import { checkPermission } from '@utils/helper'

export const usePermission = () => {
  const permissions = useAuthStore(state => state.auth?.permissions)

  const hasPermission = path => checkPermission(permissions, path)

  return { hasPermission }
}
