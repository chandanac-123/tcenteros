import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useNetworkPermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canViewNetwork: hasPermission(PERMISSIONS.NETWORK.LIST),
    canApproveNetwork: hasPermission(PERMISSIONS.NETWORK.APPROVE),
    canAddAmount: hasPermission(PERMISSIONS.NETWORK.ADD_AMOUNT),
    canEnableNetwork: hasPermission(PERMISSIONS.NETWORK.ENABLE_DISABLE)
  }
}
