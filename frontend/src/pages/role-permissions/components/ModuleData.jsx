export const modulesData = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    submodules: [
      { id: 'overview', label: 'Overview' },
      { id: 'add_branch', label: 'Add branch' },
      { id: 'create_branch', label: 'Create Branch' }
    ]
  },
  {
    id: 'employee_management',
    name: 'Employee Management',
    submodules: [
      { id: 'employee', label: 'Employee' },
      { id: 'salary_structure', label: 'Salary Structure' },
      { id: 'payroll', label: 'Payroll' }
    ],
    sub_submodules: {
      employee: [
        { id: 'list', label: 'List' },
        { id: 'add', label: 'Add' },
        { id: 'edit', label: 'Edit' },
        { id: 'view', label: 'View' },
        { id: 'delete', label: 'Delete' },
        { id: 'enable_disable', label: 'Enable/Disable' }
      ]
    }
  },
  {
    id: 'membership_plan',
    name: 'Membership Plan',
    submodules: [
      { id: 'list', label: 'List' },
      { id: 'add', label: 'Add' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' },
      { id: 'enable_disable', label: 'Enable/Disable' }
    ]
  },
  {
    id: 'crm',
    name: 'CRM',
    submodules: [
      { id: 'member', label: 'Member' },
      { id: 'leads', label: 'Leads' },
      { id: 'guest', label: 'Guest' },
      { id: 'visitor', label: 'Visitor' }
    ],
    sub_submodules: {
      member: [
        { id: 'list', label: 'List' },
        { id: 'add', label: 'Add' },
        { id: 'edit', label: 'Edit' },
        { id: 'delete', label: 'Delete' },
        { id: 'enable_disable', label: 'Enable/Disable' }
      ],
      visitor: [
        { id: 'add', label: 'Add' },
        { id: 'convert_to_member', label: 'Convert to Member' }
      ],
      guest: [{ id: 'convert_to_member', label: 'Convert to Member' }]
    }
  },
  {
    id: 'network',
    name: 'Network',
    submodules: [
      { id: 'list', label: 'List' },
      { id: 'view', label: ' View' },
      { id: 'netwrok_request_approve', label: 'Network Request Approve' },
      { id: 'add_network_amount', label: 'Add network amount' },
      { id: 'enable_disable', label: 'Enable/Disable network' }
    ]
  },
  {
    id: 'attendance',
    name: 'Attendance'
  },
  {
    id: 'wallet',
    name: 'Wallet',
    submodules: [{ id: 'add_topup', label: 'Add TopUP' }]
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
    submodules: [{ id: 'edit_profile', label: 'Edit Profile' }]
  }
]
