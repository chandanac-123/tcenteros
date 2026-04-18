import { usePermission } from "@hooks/PermissionHook";
import { PERMISSIONS } from "@utils/permissions";
import { SUPERADMINPERMISSIONS } from "@utils/superadmin-permission";
import { ca } from "date-fns/locale";

export const useAppPermissions = () => {
  const { hasPermission, hydrated } = usePermission();

  return {
    hydrated,

    // Dashboard
    canOverview: hasPermission(PERMISSIONS.DASHBOARD.OVERVIEW),
    canAddBranch: hasPermission(PERMISSIONS.DASHBOARD.ADD_BRANCH),
    canCreateBranch: hasPermission(PERMISSIONS.DASHBOARD.CREATE_BRANCH),

    // Profile
    canEditProfile: hasPermission(PERMISSIONS.PROFILE.EDIT_PROFILE),

    // CRM
    canViewMember: hasPermission(PERMISSIONS.CRM.MEMBER_LIST),
    canAddMember: hasPermission(PERMISSIONS.CRM.MEMBER_ADD),
    canEditMember: hasPermission(PERMISSIONS.CRM.MEMBER_EDIT),
    canDeleteMember: hasPermission(PERMISSIONS.CRM.MEMBER_DELETE),
    canEnableMember: hasPermission(PERMISSIONS.CRM.MEMBER_ENABLE_DISABLE),
    canViewLeads: hasPermission(PERMISSIONS.CRM.LEADS),
    canConvertGuest: hasPermission(PERMISSIONS.CRM.GUEST_CONVERT),
    canAddVisitor: hasPermission(PERMISSIONS.CRM.VISITOR_ADD),
    canConvertVisitor: hasPermission(PERMISSIONS.CRM.VISITOR_CONVERT),

    // Employee Management
    canEmployee: hasPermission(PERMISSIONS.EMPLOYEE.LIST),
    canSalary: hasPermission(PERMISSIONS.SALARY.LIST),
    canPayroll: hasPermission(PERMISSIONS.PAYROLL.LIST),
    canAddEmployee: hasPermission(PERMISSIONS.EMPLOYEE.ADD),
    canViewEmployee: hasPermission(PERMISSIONS.EMPLOYEE.VIEW),
    canEditEmployee: hasPermission(PERMISSIONS.EMPLOYEE.EDIT),
    canDeleteEmployee: hasPermission(PERMISSIONS.EMPLOYEE.DELETE),
    canEnableEmployee: hasPermission(PERMISSIONS.EMPLOYEE.ENABLE_DISABLE),

    //Membership
    canListMembership: hasPermission(PERMISSIONS.MEMBERSHIP.LIST),
    canAddMembership: hasPermission(PERMISSIONS.MEMBERSHIP.ADD),
    canEditMembership: hasPermission(PERMISSIONS.MEMBERSHIP.EDIT),
    canDeleteMembership: hasPermission(PERMISSIONS.MEMBERSHIP.DELETE),
    canEnableMembership: hasPermission(PERMISSIONS.MEMBERSHIP.ENABLE_DISABLE),

    // Network
    canViewNetwork: hasPermission(PERMISSIONS.NETWORK.LIST),
    canApproveNetwork: hasPermission(PERMISSIONS.NETWORK.APPROVE),
    canAddAmount: hasPermission(PERMISSIONS.NETWORK.ADD_AMOUNT),
    canEnableNetwork: hasPermission(PERMISSIONS.NETWORK.ENABLE_DISABLE),

    // Wallet
    canAddTopup: hasPermission(PERMISSIONS.WALLET.ADD_TOPUP),

    //superadmin
    //Subscription
    canActiveSubscriptionList: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.ACTIVE_SUBCRIPTION_LIST),
    canActiveSubscriptionView: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.ACTIVE_SUBCRIPTION_VIEW),
    canRenewalCalender: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.RENEWAL_CALENDER),
    canRenwalView: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.RENEWAL_CALENDER_VIEW),
    canExpiringList: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.EXPIRING_SOON_LIST),
    canSendReminderExpiring: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.EXPIRING_SOON_SEND_REMINDER),
    canAddGraceExpiring: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.EXPIRING_SOON_ADD_GRACE),
    canListFailedPayment: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.FAILED_PAYMENT_LIST),
    canSuspendFailedPayment: hasPermission(SUPERADMINPERMISSIONS.SUBSCRIPTION.FAILED_PAYMENT_SUSPEND),

    //Plateform Feature
    canFeatureList: hasPermission(SUPERADMINPERMISSIONS.PLATEFORM_FEATURE.LIST),
    canFeatureAdd: hasPermission(SUPERADMINPERMISSIONS.PLATEFORM_FEATURE.ADD),
    canFeatureUpdate: hasPermission(SUPERADMINPERMISSIONS.PLATEFORM_FEATURE.UPADTE),
    canFeatureDelete: hasPermission(SUPERADMINPERMISSIONS.PLATEFORM_FEATURE.DELETE),

    //Partner
    canPartnerList: hasPermission(SUPERADMINPERMISSIONS.PARTNER.LIST),
    canPartnerView: hasPermission(SUPERADMINPERMISSIONS.PARTNER.VIEW),

    //Branching
    canBranchingList: hasPermission(SUPERADMINPERMISSIONS.BRANCHING.LIST),
    canBranchingAdd: hasPermission(SUPERADMINPERMISSIONS.BRANCHING.ADD),

    //Revenue Billing
    canSasRevenueOverview: hasPermission(SUPERADMINPERMISSIONS.REVENUE_BILLING.SAS_REVENUE_OVERVIEW),
    canPartnerCommisionList: hasPermission(SUPERADMINPERMISSIONS.REVENUE_BILLING.PARTNER_COMMISTION_LIST),

    //Support
    canSupportList: hasPermission(SUPERADMINPERMISSIONS.SUPPORT.LIST),
    canOpenTicket: hasPermission(SUPERADMINPERMISSIONS.SUPPORT.OPEN_TICKET),
    canAssignCenterAdmin: hasPermission(SUPERADMINPERMISSIONS.SUPPORT.ASSIGN_CENTER_ADMIN),
  };
};
