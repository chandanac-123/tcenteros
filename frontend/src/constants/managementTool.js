export const managementTools = [
  {
    id: 'member-management',
    label: 'Member Management',
    route: '/member-management'
  },
  { id: 'slot', label: 'Slot & Capacity Control', route: '/slot-and-capacity' },
  {
    id: 'attendance',
    label: 'Attendance Tracking',
    route: '/attendance-tracking'
  },
  { id: 'billing', label: 'Payment & Billing', route: '/payment-billing' },
  {
    id: 'staffmanagement',
    label: 'Staff Management',
    route: '/trainer-and-staff'
  },
  { id: 'sellable_items', label: 'Sellable Items', route: '/sellable-item' },
  { id: 'reports', label: 'Report & Insight', route: '/report-and-insight' }
]

export const featureNameToStoreKey = {
  'Member Management': 'member-management',
  'Slot & Capacity Control': 'slot',
  'Attendance Tracking': 'attendance',
  'Payment & Billing': 'billing',
  'Trainer & Staff Management': 'staffmanagement',
  'Reports & Insights': 'reports',
  'Sellable Itemss': 'sellable_items'
}
