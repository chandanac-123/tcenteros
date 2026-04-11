import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useMembershipPermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canListMembership: hasPermission(PERMISSIONS.MEMBERSHIP.LIST),
    canAddMembership: hasPermission(PERMISSIONS.MEMBERSHIP.ADD),
    canEditMembership: hasPermission(PERMISSIONS.MEMBERSHIP.EDIT),
    canDeleteMembership: hasPermission(PERMISSIONS.MEMBERSHIP.DELETE),
    canEnableMembership: hasPermission(PERMISSIONS.MEMBERSHIP.ENABLE_DISABLE)
  }
}
