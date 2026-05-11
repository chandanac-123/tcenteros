import { usePermission } from "@hooks/PermissionHook";

export const useAppPermissions = () => {
  const { hasPermission, hydrated } = usePermission();

  return {
    hydrated,

    // Dashboard
    canOverview: hasPermission('dashboard.submodules.overview'),
    canAddBranch: hasPermission('dashboard.submodules.add_branch'),
    canCreateBranch: hasPermission('dashboard.submodules.create_branch'),

    // Profile
    canEditProfile: hasPermission('profile.submodules.edit_profile'),

    // CRM
    canViewMember: hasPermission('crm.submodules.member.list'),
    canAddMember: hasPermission('crm.submodules.member.add'),
    canEditMember: hasPermission('crm.submodules.member.edit'),
    canDeleteMember: hasPermission('crm.submodules.member.delete'),
    canEnableMember: hasPermission('crm.submodules.member.enable_disable'),
    canViewLeads: hasPermission('crm.submodules.leads'),
    canConvertGuest: hasPermission('crm.submodules.guest.convert_to_member'),
    canAddVisitor: hasPermission('crm.submodules.visitor.add'),
    canConvertVisitor: hasPermission('crm.submodules.visitor.convert_to_member'),

    // Employee Management
    canEmployee: hasPermission('employee_management.submodules.employee.list'),
    canSalary: hasPermission('employee_management.submodules.salary_structure'),
    canPayroll: hasPermission('employee_management.submodules.payroll'),
    canAddEmployee: hasPermission('employee_management.submodules.employee.add'),
    canViewEmployee: hasPermission('employee_management.submodules.employee.view'),
    canEditEmployee: hasPermission('employee_management.submodules.employee.edit'),
    canDeleteEmployee: hasPermission('employee_management.submodules.employee.delete'),
    canEnableEmployee: hasPermission('employee_management.submodules.employee.enable_disable'),

    //Membership
    canListMembership: hasPermission('membership_plan.submodules.list'),
    canAddMembership: hasPermission('membership_plan.submodules.add'),
    canEditMembership: hasPermission('membership_plan.submodules.edit'),
    canDeleteMembership: hasPermission('membership_plan.submodules.delete'),
    canEnableMembership: hasPermission('membership_plan.submodules.enable_disable'),

    // Network
    canViewNetwork: hasPermission('network.submodules.list'),
    canApproveNetwork: hasPermission('network.submodules.netwrok_request_approve'),
    canAddAmount: hasPermission('network.submodules.add_network_amount'),
    canEnableNetwork: hasPermission('network.submodules.enable_disable'),

    // Wallet
    canAddTopup: hasPermission( 'wallet.submodules.add_topup'),

    // Notifications
    canViewNotifications: hasPermission('notification.enabled'),
  };
};
