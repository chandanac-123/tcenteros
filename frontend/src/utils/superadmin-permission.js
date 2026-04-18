export const PERMISSIONS = {
  DASHBOARD: {
    OVERVIEW: "dashboard.submodules.overview",
  },
  SUBSCRIPTION: {
    ACTIVE_SUBCRIPTION_LIST: "employee_management.submodules.employee.list",
    ACTIVE_SUBCRIPTION_VIEW: "employee_management.submodules.employee.view",
    RENEWAL_CALENDER: "employee_management.submodules.employee.add",
    RENEWAL_CALENDER_VIEW: "employee_management.submodules.employee.edit",
    EXPIRING_SOON_LIST: "employee_management.submodules.employee.delete",
    EXPIRING_SOON_SEND_REMINDER:
      "employee_management.submodules.employee.enable_disable",
    EXPIRING_SOON_ADD_GRACE:
      "employee_management.submodules.employee.enable_disable",
    FAILED_PAYMENT_LIST:
      "employee_management.submodules.employee.enable_disable",
    FAILED_PAYMENT_SUSAPEND:
      "employee_management.submodules.employee.enable_disable",
  },
  PLATEFORM_FEATURE: {
    LIST: "employee_management.submodules.salary_structure",
    ADD: "employee_management.submodules.salary_structure",
    UPADTE: "employee_management.submodules.salary_structure",
    DELETE: "employee_management.submodules.salary_structure",
  },
  CENTER: {
    LIST: "employee_management.submodules.payroll",
  },
  PARTNER: {
    LIST: "wallet.submodules.add_topup",
    VIEW: "wallet.submodules.add_topup",
  },
  BRANCHING: {
    LIST: "profile.submodules.edit_profile",
    ADD: "profile.submodules.edit_profile",
  },
  NETWORKING: {
    LIST: "membership_plan.submodules.list",
  },
  REVENUE_BILLING: {
    SAS_REVENUE_OVERVIEW: "crm.submodules.member.list",
    PARTNER_COMMISTION_LIST: "crm.submodules.member.add",
  },
  ANALITICS: {
    OVERVIEW: "network.submodules.list",
  },
  SUPPORT: {
    LIST: "network.submodules.list",
    OPEN_TICKET: "network.submodules.list",
    ASSIGN_CENTER_ADMIN: "network.submodules.list",
  },
  PLATEFORM_SETTINGS: {
    LIST: "network.submodules.list",
  },
};
