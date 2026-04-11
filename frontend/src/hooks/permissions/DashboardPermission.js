import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useDashboardPermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canOverview: hasPermission(PERMISSIONS.DASHBOARD.OVERVIEW),
    canAddBranch: hasPermission(PERMISSIONS.DASHBOARD.ADD_BRANCH),
    canCreateBranch: hasPermission(PERMISSIONS.DASHBOARD.CREATE_BRANCH),
  }
}
