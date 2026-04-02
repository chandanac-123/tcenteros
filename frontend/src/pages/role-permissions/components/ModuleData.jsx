export const modulesData = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    submodules: ['Add branch','Create Branch']
  },
  {
    id: 'employee_management',
    name: 'Employee Management',
    submodules: ['Employee', 'Salary Structure', 'Payroll'],
    sub_submodules: {
      Employee: ['List', 'Add', 'Edit', 'Delete'],
    }
  },
  {
    id: 'membership_plan',
    name: 'Membership Plan',
    submodules: ['List', 'Add', 'Edit', 'Delete','Enable/Disable'],
  },
  {
    id: 'crm',
    name: 'CRM',
    submodules: ['Member','Leads' ,'Guest','Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete','Enable/Disable'],
      Visitor: ['Add', 'Convert to Member'],
      Guest: ['Add', 'Convert to Member'],
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
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },
  {
    id: 'wallet',
    name: 'Wallet',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },
  {
    id: 'inventory',
    name: 'Inventory',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },
  {
    id: 'billing',
    name: 'Billing',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },
  {
    id: 'account',
    name: 'Account',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },{
    id: 'branding',
    name: 'Branding',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },{
    id: 'report',
    name: 'Report',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  },{
    id: 'role',
    name: 'Role and Permission',
    submodules: ['Member', 'Visitor'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit']
    }
  }
]
