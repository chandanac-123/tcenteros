import ForgetPassord from '@pages/authentication/ForgetPassord'
import Login from '@pages/authentication/Login'
import OTPVerification from '@pages/authentication/OtpVerification'
import PrimaryLogin from '@pages/authentication/PrimaryLogin'
import ResetPassword from '@pages/authentication/ResetPassword'
import ResetSuccess from '@pages/authentication/ResetSuccess'
import Dashboard from '@pages/Dashboard'
import CenterSize from '@pages/onboarding-pages/CenterSizeScale'
import ClassSelectionMode from '@pages/onboarding-pages/ClassMode'
import ContactDetails from '@pages/onboarding-pages/ContactDetails'
import DegitalPresence from '@pages/onboarding-pages/DigitalPresence'
import InvoiceSummary from '@pages/onboarding-pages/InvoiceSummary'
import Landing from '@pages/onboarding-pages/LandingPage'
import CenterManagement from '@pages/onboarding-pages/management'
import AttendanceTracking from '@pages/onboarding-pages/management/AttendanceTracking'
import SellableItem from '@pages/onboarding-pages/management/SellableItem'
import MarketingSupport from '@pages/onboarding-pages/MarketingSupport'
import PricingPage from '@pages/onboarding-pages/PricingPage'
import SmartRecommandation from '@pages/onboarding-pages/SmartRecommandation'
import TypeSelection from '@pages/onboarding-pages/TypeSelection'
import Branding from '@pages/branding'
import Billing from '@pages/billing'
import Inventories from '@pages/iventories'
import Wallet from '@pages/wallet'
import Attendance from '@pages/attendance'
import Network from '@pages/network'
import CenterView from '@pages/network/centerDetails/index'
import CRM from '@pages/crm'
import MembershipPlan from '@pages/membership-plan'
import EmployeeManagement from '@pages/employee-management'
import Settings from '@pages/settings'
import Accounts from '@pages/accounts'
import AccountsSubModules from '@pages/accounts/sub-modules'
import AddBranches from "@pages/branch/AddBranches"
import ProfilePage from '@pages/profile'

import {
  CrownIcon,
  FileUserIcon,
  LayoutDashboard,
  ListChecks,
  NetworkIcon,
  NotebookText,
  ProportionsIcon,
  Receipt,
  ShapesIcon,
  Tickets,
  UserCog,
  UserRoundPen,
  WalletIcon
} from 'lucide-react'
import Reports from '@pages/reports'
import Notifications from '@pages/notifications'
import RoleAndPermission from '@pages/role-permissions/index'
import Partners from '@super-admin/partners'
import Centers from '@super-admin/centers'
import PlatformFeatures from '@super-admin/platform-features'
import PlatformSettings from '@super-admin/platform-settings'
import Analytics from '@super-admin/analytics'
import ExpiringSoon from '@super-admin/subscriptions/expiring-soon'
import RenewalCalender from '@super-admin/subscriptions/renewal-calender'
import ActiveSubscriptions from '@super-admin/subscriptions/active-subscriptions'
import SubscriptionsLayout from '@super-admin/subscriptions'
import FailedPayments from '@super-admin/subscriptions/failed-payments'
import RevenueBillingLayout from '@super-admin/revenue-billing'
import PartnerCommision from '@super-admin/revenue-billing/partner-commision'
import SASRevenue from '@super-admin/revenue-billing/sas-revenue'
import DetailView from '@super-admin/subscriptions/active-subscriptions/DetailView'

export const routes = [
  //public routes
  { key: 1, path: '/', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: Landing, menubar: false, permissionKey: true },
  { key: 2, path: '/type-selection', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: TypeSelection, menubar: false, permissionKey: true },
  { key: 3, path: '/class-mode', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: ClassSelectionMode, menubar: false, permissionKey: true },
  { key: 4, path: '/center-size-scale', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: CenterSize, menubar: false, permissionKey: true },
  { key: 5, path: '/digital-presence', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: DegitalPresence, menubar: false, permissionKey: true },
  { key: 6, path: '/smart-recommandation', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: SmartRecommandation, menubar: false, permissionKey: true },
  { key: 7, path: '/marketing-support', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: MarketingSupport, menubar: false, permissionKey: true },
  { key: 8, path: '/contact-details', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: ContactDetails, menubar: false, permissionKey: true },
  { key: 9, path: '/pricing-page', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: PricingPage, menubar: false, permissionKey: true },
  { key: 10, path: '/invoice-summary', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: InvoiceSummary, menubar: false, permissionKey: true },
  { key: 11, path: '/management', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: CenterManagement, menubar: false, permissionKey: true },
  { key: 13, path: '/attendance-tracking', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: AttendanceTracking, menubar: false, permissionKey: true },
  { key: 16, path: '/sellable-item', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: SellableItem, menubar: false, permissionKey: true },
  { key: 19, path: '/primary-login', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: PrimaryLogin, menubar: false, permissionKey: true },
  { key: 20, path: '/add-branches', label: '', privetRoute: true, isSubRoute: false, pageTitle: '', component: AddBranches, menubar: false, permissionKey: true },
  { key: 21, path: '/login', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: Login, menubar: false, permissionKey: true },
  { key: 22, path: '/forgot-password', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: ForgetPassord, menubar: false, permissionKey: true },
  { key: 23, path: '/otp-verification', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: OTPVerification, menubar: false, permissionKey: true },
  { key: 24, path: '/reset-password', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: ResetPassword, menubar: false, permissionKey: true },
  { key: 25, path: '/reset-success', label: '', privetRoute: false, isSubRoute: false, pageTitle: '', component: ResetSuccess, menubar: false, permissionKey: true },

  //private routes
  { key: 26, path: '/dashboard', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Dashboard', component: Dashboard, icon: <LayoutDashboard />, menubar: true, permissionKey: 'dashboard' ,alwaysVisible: true},
  { key: 27, path: '/employee-management', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Employee Management', component: EmployeeManagement, icon: <UserCog />, menubar: true, permissionKey: 'employee_management'},
  { key: 28, path: '/membership-plan', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Membership Plans', component: MembershipPlan, icon: <NotebookText />, menubar: true, permissionKey: 'membership_plan'},
  { key: 29, path: '/crm', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'CRM', component: CRM, icon: <FileUserIcon />, menubar: true, permissionKey: 'crm'},
  { key: 30, path: '/network', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Network', component: Network, icon: <NetworkIcon />, menubar: true, permissionKey: 'network'},
  { key: 31, path: '/network/:id', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'CenterView', component: CenterView, icon: <NetworkIcon />, menubar: false, permissionKey: true },
  { key: 32, path: '/attendance', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Attendance', component: Attendance, icon: <ListChecks />, menubar: true, permissionKey: 'attendance'},
  { key: 33, path: '/wallet', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Wallet', component: Wallet, icon: <WalletIcon />, menubar: true, permissionKey: 'wallet'},
  { key: 34, path: '/inventories', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Inventories', component: Inventories, icon: <ShapesIcon />, menubar: true, permissionKey: 'inventory'},
  { key: 35, path: '/billing', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Billing', component: Billing, icon: <Receipt />, menubar: true, permissionKey: 'billing'},
  { key: 36, path: '/accounts', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Account', component: Accounts, icon: <Tickets />, menubar: true, permissionKey: 'account'},
  { key: 37, path: '/accounts/sub-modules/:module', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Account', component: AccountsSubModules, icon: <Tickets />, menubar: false, permissionKey: true },
  { key: 38, path: '/branding', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Branding', component: Branding, icon: <CrownIcon />, menubar: true, permissionKey: 'branding'},
  { key: 39, path: '/reports', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Reports', component: Reports, icon: <ProportionsIcon />, menubar: true, permissionKey: 'report' },
  { key: 40, path: '/settings', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Settings', component: Settings, menubar: false, permissionKey: true },
  { key: 41, path: '/profile', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Profile', component: ProfilePage, menubar: false, permissionKey: true },
  { key: 42, path: '/notifications', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Notifications', component: Notifications, menubar: false, permissionKey: true },
  { key: 43, path: '/role', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Role and Permission', component: RoleAndPermission,icon:<UserRoundPen />, menubar: true, permissionKey: 'role'},

  //super admin routes
  { key: 44, path: '/subscriptions', label: '', privetRoute: true, isSubRoute: true, pageTitle: 'Subscriptions', component: SubscriptionsLayout,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true,
      submodules: [
      { key: 'active-subscriptions', title: 'Active Subscriptions', path: 'active-subscriptions', component: ActiveSubscriptions, menubar: true, permissionKey: true },
      { key: 'active-subscriptions-detail', title: 'Active Subscriptions Detail', path: 'active-subscriptions/detail/:id', component: DetailView, menubar: false, permissionKey: true },
      { key: 'renewal-calender', title: 'Renewal Calender', path: 'renewal-calender', component: RenewalCalender, menubar: true, permissionKey: true },
      { key: 'expiring-soon', title: 'Expiring Soon', path: 'expiring-soon', component: ExpiringSoon, menubar: true, permissionKey: true },
      { key: 'failed-payments', title: 'Failed Payments', path: 'failed-payments', component: FailedPayments, menubar: true, permissionKey: true },
    ]
  },
  { key: 45, path: '/platform-features', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Platform Features', component: PlatformFeatures,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true},
  { key: 46, path: '/centers', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Centers', component: Centers,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true},
  { key: 47, path: '/partners', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Partners', component: Partners,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true},
  { key: 48, path: '/revenue-billing', label: '', privetRoute: true, isSubRoute: true, pageTitle: 'Revenue Billing', component: RevenueBillingLayout,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true,
      submodules: [
      { key: 'partner-commission', title: 'Partner Commission', path: 'partner-commission', component: PartnerCommision, menubar: true, permissionKey: true },
      { key: 'sas-revenue', title: 'SAS Revenue', path: 'sas-revenue', component: SASRevenue, menubar: true, permissionKey: true }
    ]
  },
  { key: 49, path: '/platform-settings', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Platform Settings', component: PlatformSettings,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true},
  { key: 50, path: '/analytics', label: '', privetRoute: true, isSubRoute: false, pageTitle: 'Analytics', component: Analytics,icon:<UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true},

]
