export const permissionData = [
  {
    id: "dashboard",
    name: "Dashboard",
    submodules: [{ id: "overview", label: "Overview" }],
  },
  {
    id: "subscription",
    name: "Subscription",
    submodules: [
      { id: "active_subcription", label: "Active Subcription" },
      { id: "renewal_calender", label: "Renewal Calender" },
      { id: "expiring_soon", label: "Expiring Soon" },
      { id: "failed_payments", label: "Failed Payments" },
    ],
    sub_submodules: {
      active_subcription: [
        { id: "list", label: "List" },
        { id: "view", label: "View" },
      ],
      renewal_calender: [
        { id: "list", label: "List" },
        { id: "view", label: "View" },
      ],
      expiring_soon: [
        { id: "list", label: "List" },
        { id: "send_reminder", label: "Send Reminder" },
        { id: "add_grace", label: "Add Grace" },
      ],
      failed_payments: [
        { id: "list", label: "List" },
        { id: "suspend", label: "Center Suspend" },
      ],
    },
  },
  {
    id: "plateform_feature",
    name: "Plateform Feature",
    submodules: [
      { id: "list", label: "List" },
      { id: "add", label: "Add" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ],
  },
  {
    id: "center",
    name: "Center",
  },
  {
    id: "partner",
    name: "Partner",
    submodules: [
      { id: "list", label: "List" },
      { id: "view", label: " View" },
    ],
  },
  {
    id: "branching",
    name: "Branching",
    submodules: [
      { id: "list", label: "List" },
      { id: "add", label: " Add" },
    ],
  },
  {
    id: "networking",
    name: "Networking",
  },
  {
    id: "revenue_billing",
    name: "Revenue and Billing",
    submodules: [
      { id: "sas_revenue", label: "SAS Revenue" },
      { id: "partner_commision", label: " Partner Commission" },
    ]
  },
  {
    id: "support",
    name: "Support",
    submodules: [
      { id: "list", label: "List" },
      { id: "opne_ticket", label: "Open Tickket" },
      { id: "assign_center_admin", label: "Assign to Center-Admin" },
    ],
  },
  {
    id: "role_and_permissions",
    name: "Role and Permissions",
  },
  {
    id: "platform_settings",
    name: "Platform Settings",
  },
];
