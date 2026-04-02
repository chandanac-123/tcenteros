export const modulesData = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    submodules: ['Add branch', 'Create Branch']
  },
  {
    id: 'employee_management',
    name: 'Employee Management',
    submodules: ['Employee', 'Salary Structure', 'Payroll'],
    sub_submodules: {
      Employee: ['List', 'Add', 'Edit', 'Delete']
    }
  },
  {
    id: 'membership_plan',
    name: 'Membership Plan',
    submodules: ['List', 'Add', 'Edit', 'Delete', 'Enable/Disable']
  },
  {
    id: 'crm',
    name: 'CRM',
    submodules: ['Member', 'Leads', 'Guest', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete', 'Enable/Disable'],
      Visitor: ['Add', 'Convert to Member'],
      Guest: ['Add', 'Convert to Member']
    }
  },
  {
    id: 'network',
    name: 'Network',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },
  {
    id: 'attendance',
    name: 'Attendance',
  },
  {
    id: 'wallet',
    name: 'Wallet',
    submodules: ['Add TopUP']
  },
  {
    id: 'inventory',
    name: 'Inventory'
  },
  {
    id: 'billing',
    name: 'Billing'
  },
  {
    id: 'account',
    name: 'Account'
  },
  {
    id: 'branding',
    name: 'Branding'
  },
  {
    id: 'report',
    name: 'Report'
  },
  {
    id: 'role',
    name: 'Role and Permission'
  },
  {
    id: 'notification',
    name: 'Notification'
  },
  {
    id: 'profile',
    name: 'Profile',
    submodules: ['Edit'],
  }
]
