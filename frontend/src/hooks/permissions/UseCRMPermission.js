import { usePermission } from '@hooks/PermissionHook'
import { PERMISSIONS } from '@utils/permissions'

export const useCrmPermissions = () => {
  const { hasPermission, hydrated } = usePermission()

  return {
    hydrated,
    canViewMember: hasPermission(PERMISSIONS.CRM.MEMBER_LIST),
    canAddMember: hasPermission(PERMISSIONS.CRM.MEMBER_ADD),
    canEditMember: hasPermission(PERMISSIONS.CRM.MEMBER_EDIT),
    canDeleteMember: hasPermission(PERMISSIONS.CRM.MEMBER_DELETE),
    canEnableMember: hasPermission(PERMISSIONS.CRM.MEMBER_ENABLE_DISABLE),
    canViewLeads: hasPermission(PERMISSIONS.CRM.LEADS),
    canConvertGuest: hasPermission(PERMISSIONS.CRM.GUEST_CONVERT),
    canAddVisitor: hasPermission(PERMISSIONS.CRM.VISITOR_ADD),
    canConvertVisitor: hasPermission(PERMISSIONS.CRM.VISITOR_CONVERT)
  }
}
