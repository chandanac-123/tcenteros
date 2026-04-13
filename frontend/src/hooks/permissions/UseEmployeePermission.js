import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useEmployeePermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canEmployee: hasPermission(PERMISSIONS.EMPLOYEE.LIST),
    canSalary: hasPermission(PERMISSIONS.SALARY.LIST),
    canPayroll: hasPermission(PERMISSIONS.PAYROLL.LIST),
    canAddEmployee: hasPermission(PERMISSIONS.EMPLOYEE.ADD),
    canViewEmployee: hasPermission(PERMISSIONS.EMPLOYEE.VIEW),
    canEditEmployee: hasPermission(PERMISSIONS.EMPLOYEE.EDIT),
    canDeleteEmployee: hasPermission(PERMISSIONS.EMPLOYEE.DELETE),
    canEnableEmployee: hasPermission(PERMISSIONS.EMPLOYEE.ENABLE_DISABLE)
  }
}
