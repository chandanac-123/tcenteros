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

    //superadmin
    //Subscription
    canActiveSubscriptionList: hasPermission("subscription.submodules.active_subcription.list"),
    canActiveSubscriptionView: hasPermission("subscription.submodules.active_subcription.view"),
    canRenewalCalender: hasPermission("subscription.submodules.renewal_calender.list"),
    canRenwalView: hasPermission("subscription.submodules.renewal_calender.view"),
    canExpiringList: hasPermission("subscription.submodules.expiring_soon.list"),
    canSendReminderExpiring: hasPermission("subscription.submodules.expiring_soon.send_reminder"),
    canAddGraceExpiring: hasPermission("subscription.submodules.expiring_soon.add_grace"),
    canListFailedPayment: hasPermission("subscription.submodules.failed_payments.list"),
    canSuspendFailedPayment: hasPermission("subscription.submodules.failed_payments.suspend"),

    //Plateform Feature
    canFeatureList: hasPermission("plateform_feature.submodules.list"),
    canFeatureAdd: hasPermission("plateform_feature.submodules.add"),
    canFeatureUpdate: hasPermission("plateform_feature.submodules.edit"),
    canFeatureDelete: hasPermission("plateform_feature.submodules.delete"),

    //Partner
    canPartnerList: hasPermission("partner.submodules.list"),
    canPartnerView: hasPermission("partner.submodules.view"),

    //Branching
    canBranchingList: hasPermission("partner.submodules.list"),
    canBranchingAdd: hasPermission("partner.submodules.add"),

    //Revenue Billing
    canSasRevenueOverview: hasPermission("revenue_billing.submodules.sas_revenue"),
    canPartnerCommisionList: hasPermission("revenue_billing.submodules.partner_commision"),

    //Support
    canSupportList: hasPermission("support.submodules.list"),
    canOpenTicket: hasPermission("support.submodules.open_ticket"),
    canAssignCenterAdmin: hasPermission("support.submodules.assign_center_admin"),
  };
};
