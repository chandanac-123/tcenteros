import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useProfilePermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canEditProfile: hasPermission(PERMISSIONS.PROFILE.EDIT_PROFILE)
  }
}
