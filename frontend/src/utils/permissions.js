export const PERMISSIONS = {
  DASHBOARD: {
    OVERVIEW: 'dashboard.submodules.overview',
    ADD_BRANCH: 'dashboard.submodules.add_branch',
    CREATE_BRANCH:'dashboard.submodules.create_branch'
  },
  EMPLOYEE: {
    LIST: 'employee_management.submodules.employee.list',
    VIEW: 'employee_management.submodules.employee.view',
    ADD: 'employee_management.submodules.employee.add',
    EDIT: 'employee_management.submodules.employee.edit',
    DELETE: 'employee_management.submodules.employee.delete',
    ENABLE_DISABLE: 'employee_management.submodules.employee.enable_disable'
  },
  SALARY: {
    LIST: 'employee_management.submodules.salary_structure'
  },
  PAYROLL: {
    LIST: 'employee_management.submodules.payroll'
  },
  WALLET: {
    ADD_TOPUP: 'wallet.submodules.add_topup'
  },
  PROFILE: {
    EDIT_PROFILE: 'profile.submodules.edit_profile'
  },
  MEMBERSHIP: {
    LIST: 'membership_plan.submodules.list',
    ADD: 'membership_plan.submodules.add',
    EDIT: 'membership_plan.submodules.edit',
    DELETE: 'membership_plan.submodules.delete',
    ENABLE_DISABLE: 'membership_plan.submodules.enable_disable'
  },
  CRM: {
    MEMBER_LIST: 'crm.submodules.member.list',
    MEMBER_ADD: 'crm.submodules.member.add',
    MEMBER_EDIT: 'crm.submodules.member.edit',
    MEMBER_DELETE: 'crm.submodules.member.delete',
    MEMBER_ENABLE_DISABLE: 'crm.submodules.member.enable_disable',
    LEADS: 'crm.submodules.leads',
    GUEST_CONVERT: 'crm.submodules.guest.convert_to_member',
    VISITOR_ADD: 'crm.submodules.visitor.add',
    VISITOR_CONVERT: 'crm.submodules.visitor.convert_to_member'
  },
  NETWORK: {
    LIST: 'network.submodules.list',
    APPROVE: 'network.submodules.netwrok_request_approve',
    ADD_AMOUNT: 'network.submodules.add_network_amount',
    ENABLE_DISABLE: 'network.submodules.enable_disable'
  }
}
