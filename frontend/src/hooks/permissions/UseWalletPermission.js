import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useWalletPermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canAddTopup: hasPermission(PERMISSIONS.WALLET.ADD_TOPUP)
  }
}
