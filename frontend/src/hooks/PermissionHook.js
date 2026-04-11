import { useAuthStore } from '@store/authStore'
import { checkPermission } from '@utils/helper'

export const usePermission = () => {
  const permissions = useAuthStore(state => state.auth?.permissions)
  const hydrated = useAuthStore(state => state._hasHydrated)

  const hasPermission = path => {
    if (!hydrated) return false
    return checkPermission(permissions, path)
  }

  return { hasPermission, hydrated }
}
