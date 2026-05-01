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
  BanknoteArrowUp,
  Boxes,
  Building2,
  CalendarSync,
  ChartPie,
  CircleDollarSign,
  CrownIcon,
  FileUserIcon,
  Handshake,
  Headset,
  LayoutDashboard,
  ListChecks,
  LucideNetwork,
  NetworkIcon,
  NotebookText,
  ProportionsIcon,
  Receipt,
  SettingsIcon,
  ShapesIcon,
  Split,
  Tickets,
  UserCog,
  UserRoundCog,
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
import PartnerCommision from '@super-admin/revenue-billing/components/PartnerCommision'
import SASRevenue from '@super-admin/revenue-billing/components/SASRevenue'
import DetailView from '@super-admin/subscriptions/active-subscriptions/detail-view'
import PartnerById from '@super-admin/partners/partnerById'
import RenewalDetailView from '@super-admin/subscriptions/renewal-calender/RenewalDetailView'
import Branching from '@super-admin/branching'
import Networking from '@super-admin/networking'
import Support from '@super-admin/support'
import RoleAndPermissions from '@super-admin/roleAndpermissions'
import SupportById from '@super-admin/support/supportById'
import InvoiceTemplate from '@pages/onboarding-pages/InvoiceTemplate'
import PartnerOnboarding from '@partner/onboarding'
import Agreement from '@partner/onboarding/Agreement'
import Payment from '@partner/onboarding/Payment'
import PaymentSuccessfull from '@partner/onboarding/PaymentSuccessfull'
import LeadsManagement from '@partner/leads-management'
import AddnewLeads from '@partner/leads-management/components/AddnewLeads'
import EarningsAndPayouts from '@partner/earnings-payouts'
import Renewals from '@partner/renewals'
import BlogPage from '@pages/onboarding-pages/header-components/blogs'
import PartnerLanding from '@partner/onboarding/PartnerLanding'
import SuspendedCenters from '@super-admin/subscriptions/suspended'

export const routes = [
  //public routes
  { key: 1, path: '/', privetRoute: false, isSubRoute: false, pageTitle: '', component: Landing, menubar: false, permissionKey: true },
  { key: 2, path: '/type-selection', privetRoute: false, isSubRoute: false, pageTitle: '', component: TypeSelection, menubar: false, permissionKey: true },
  { key: 3, path: '/class-mode', privetRoute: false, isSubRoute: false, pageTitle: '', component: ClassSelectionMode, menubar: false, permissionKey: true },
  { key: 4, path: '/center-size-scale', privetRoute: false, isSubRoute: false, pageTitle: '', component: CenterSize, menubar: false, permissionKey: true },
  { key: 5, path: '/digital-presence', privetRoute: false, isSubRoute: false, pageTitle: '', component: DegitalPresence, menubar: false, permissionKey: true },
  { key: 6, path: '/smart-recommandation', privetRoute: false, isSubRoute: false, pageTitle: '', component: SmartRecommandation, menubar: false, permissionKey: true },
  { key: 7, path: '/marketing-support', privetRoute: false, isSubRoute: false, pageTitle: '', component: MarketingSupport, menubar: false, permissionKey: true },
  { key: 8, path: '/contact-details', privetRoute: false, isSubRoute: false, pageTitle: '', component: ContactDetails, menubar: false, permissionKey: true },
  { key: 9, path: '/pricing-page', privetRoute: false, isSubRoute: false, pageTitle: '', component: PricingPage, menubar: false, permissionKey: true },
  { key: 10, path: '/invoice-summary', privetRoute: false, isSubRoute: false, pageTitle: '', component: InvoiceSummary, menubar: false, permissionKey: true },
  { key: 10, path: '/invoice-download', privetRoute: false, isSubRoute: false, pageTitle: '', component: InvoiceTemplate, menubar: false, permissionKey: true },
  { key: 11, path: '/management', privetRoute: false, isSubRoute: false, pageTitle: '', component: CenterManagement, menubar: false, permissionKey: true },
  { key: 13, path: '/attendance-tracking', privetRoute: false, isSubRoute: false, pageTitle: '', component: AttendanceTracking, menubar: false, permissionKey: true },
  { key: 16, path: '/sellable-item', privetRoute: false, isSubRoute: false, pageTitle: '', component: SellableItem, menubar: false, permissionKey: true },
  { key: 19, path: '/primary-login', privetRoute: false, isSubRoute: false, pageTitle: '', component: PrimaryLogin, menubar: false, permissionKey: true },
  { key: 20, path: '/add-branches', privetRoute: true, isSubRoute: false, pageTitle: '', component: AddBranches, menubar: false, permissionKey: true },
  { key: 21, path: '/login', privetRoute: false, isSubRoute: false, pageTitle: '', component: Login, menubar: false, permissionKey: true },
  { key: 22, path: '/forgot-password', privetRoute: false, isSubRoute: false, pageTitle: '', component: ForgetPassord, menubar: false, permissionKey: true },
  { key: 23, path: '/otp-verification', privetRoute: false, isSubRoute: false, pageTitle: '', component: OTPVerification, menubar: false, permissionKey: true },
  { key: 24, path: '/reset-password', privetRoute: false, isSubRoute: false, pageTitle: '', component: ResetPassword, menubar: false, permissionKey: true },
  { key: 25, path: '/reset-success', privetRoute: false, isSubRoute: false, pageTitle: '', component: ResetSuccess, menubar: false, permissionKey: true },
  { key: 61, path: '/blog', privetRoute: false, isSubRoute: false, pageTitle: '', component: BlogPage, menubar: false, permissionKey: true },

  //private routes
  { key: 26, path: '/dashboard', privetRoute: true, isSubRoute: false, pageTitle: 'Dashboard', component: Dashboard, icon: <LayoutDashboard />, menubar: true, permissionKey: 'dashboard', alwaysVisible: true },
  { key: 27, path: '/employee-management', privetRoute: true, isSubRoute: false, pageTitle: 'Employee Management', component: EmployeeManagement, icon: <UserCog />, menubar: true, permissionKey: 'employee_management' },
  { key: 28, path: '/membership-plan', privetRoute: true, isSubRoute: false, pageTitle: 'Membership Plans', component: MembershipPlan, icon: <NotebookText />, menubar: true, permissionKey: 'membership_plan' },
  { key: 29, path: '/crm', privetRoute: true, isSubRoute: false, pageTitle: 'CRM', component: CRM, icon: <FileUserIcon />, menubar: true, permissionKey: 'crm' },
  { key: 30, path: '/network', privetRoute: true, isSubRoute: false, pageTitle: 'Network', component: Network, icon: <NetworkIcon />, menubar: true, permissionKey: 'network' },
  { key: 31, path: '/network/:id', privetRoute: true, isSubRoute: false, pageTitle: 'CenterView', component: CenterView, icon: <NetworkIcon />, menubar: false, permissionKey: true },
  { key: 32, path: '/attendance', privetRoute: true, isSubRoute: false, pageTitle: 'Attendance', component: Attendance, icon: <ListChecks />, menubar: true, permissionKey: 'attendance' },
  { key: 33, path: '/wallet', privetRoute: true, isSubRoute: false, pageTitle: 'Wallet', component: Wallet, icon: <WalletIcon />, menubar: true, permissionKey: 'wallet' },
  { key: 34, path: '/inventories', privetRoute: true, isSubRoute: false, pageTitle: 'Inventories', component: Inventories, icon: <ShapesIcon />, menubar: true, permissionKey: 'inventory' },
  { key: 35, path: '/billing', privetRoute: true, isSubRoute: false, pageTitle: 'Billing', component: Billing, icon: <Receipt />, menubar: true, permissionKey: 'billing' },
  { key: 36, path: '/accounts', privetRoute: true, isSubRoute: false, pageTitle: 'Account', component: Accounts, icon: <Tickets />, menubar: true, permissionKey: 'account' },
  { key: 37, path: '/accounts/sub-modules/:module', privetRoute: true, isSubRoute: false, pageTitle: 'Account', component: AccountsSubModules, icon: <Tickets />, menubar: false, permissionKey: true },
  { key: 38, path: '/branding', privetRoute: true, isSubRoute: false, pageTitle: 'Branding', component: Branding, icon: <CrownIcon />, menubar: true, permissionKey: 'branding' },
  { key: 39, path: '/reports', privetRoute: true, isSubRoute: false, pageTitle: 'Reports', component: Reports, icon: <ProportionsIcon />, menubar: true, permissionKey: 'report' },
  { key: 40, path: '/settings', privetRoute: true, isSubRoute: false, pageTitle: 'Settings', component: Settings, menubar: false, permissionKey: true },
  { key: 41, path: '/profile', privetRoute: true, isSubRoute: false, pageTitle: 'Profile', component: ProfilePage, menubar: false, permissionKey: true },
  { key: 42, path: '/notifications', privetRoute: true, isSubRoute: false, pageTitle: 'Notifications', component: Notifications, menubar: false, permissionKey: true },
  { key: 43, path: '/role', privetRoute: true, isSubRoute: false, pageTitle: 'Role and Permission', component: RoleAndPermission, icon: <UserRoundPen />, menubar: true, permissionKey: 'role' },

  //super admin routes
  {
    key: 44, path: '/subscriptions', privetRoute: true, isSubRoute: true, pageTitle: 'Subscriptions', component: SubscriptionsLayout, icon: <UserRoundPen />, menubar: true, permissionKey: true, isSuperAdmin: true,
    submodules: [
      { key: 'active-subscriptions', title: 'Active Subscriptions', path: 'active-subscriptions', component: ActiveSubscriptions, menubar: true, permissionKey: true },
      { key: 'active-subscriptions-detail', title: 'Active Subscriptions Detail', path: 'active-subscriptions/detail/:id', component: DetailView, menubar: false, permissionKey: true },
      { key: 'renewal-calender', title: 'Renewal Calender', path: 'renewal-calender', component: RenewalCalender, menubar: true, permissionKey: true },
      { key: 'renewal-calender-detail', title: 'Renewal Calender Detail', path: 'renewal-calender/detail/:id', component: RenewalDetailView, menubar: false, permissionKey: true },
      { key: 'expiring-soon', title: 'Expired', path: 'expired', component: ExpiringSoon, menubar: true, permissionKey: true },
      { key: 'failed-payments', title: 'Failed Payments', path: 'failed-payments', component: FailedPayments, menubar: true, permissionKey: true },
      { key: 'suspended', title: 'Suspended Center', path: 'suspended', component: SuspendedCenters, menubar: true, permissionKey: true },

    ]
  },
  { key: 45, path: '/platform-features', privetRoute: true, isSubRoute: false, pageTitle: 'Platform Features', component: PlatformFeatures, icon: <Boxes />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 46, path: '/centers', privetRoute: true, isSubRoute: false, pageTitle: 'Centers', component: Centers, icon: <Building2 />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 47, path: '/partners', privetRoute: true, isSubRoute: false, pageTitle: 'Partners', component: Partners, icon: <Handshake />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 48, path: '/branching', privetRoute: true, isSubRoute: false, pageTitle: 'Branching', component: Branching, icon: <Split />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 49, path: '/networking', privetRoute: true, isSubRoute: false, pageTitle: 'Networking', component: Networking, icon: <LucideNetwork />, menubar: true, permissionKey: true, isSuperAdmin: true },

  {
    key: 50, path: '/revenue-billing', privetRoute: true, isSubRoute: true, pageTitle: 'Revenue Billing', component: RevenueBillingLayout, icon: <CircleDollarSign />, menubar: true, permissionKey: true, isSuperAdmin: true,
    submodules: [
      { key: 'partner-commission', title: 'Partner Commission', path: 'partner-commission', component: PartnerCommision, menubar: false, permissionKey: true },
      { key: 'sas-revenue', title: 'SAS Revenue', path: 'sas-revenue', component: SASRevenue, menubar: true, permissionKey: true }
    ]
  },
  // { key: 51, path: '/analytics', privetRoute: true, isSubRoute: false, pageTitle: 'Analytics', component: Analytics, icon: <ChartPie />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 52, path: '/support', privetRoute: true, isSubRoute: false, pageTitle: 'Support', component: Support, icon: <Headset />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 53, path: '/supportById/:id', privetRoute: true, isSubRoute: false, pageTitle: 'Support', component: SupportById, icon: <Headset />, menubar: false, permissionKey: true, isSuperAdmin: true },
  { key: 54, path: '/partnersbyId/:id', privetRoute: true, isSubRoute: false, pageTitle: 'Partners', component: PartnerById, icon: <UserRoundPen />, menubar: false, permissionKey: true, isSuperAdmin: true },
  { key: 55, path: '/roleandpermission', privetRoute: true, isSubRoute: false, pageTitle: 'Role & Permissions', component: RoleAndPermissions, icon: <UserRoundCog />, menubar: true, permissionKey: true, isSuperAdmin: true },
  { key: 56, path: '/platform-settings', privetRoute: true, isSubRoute: false, pageTitle: 'Platform Settings', component: PlatformSettings, icon: <SettingsIcon />, menubar: true, permissionKey: true, isSuperAdmin: true },

  //partner public routes
  { key: 57, path: '/partner-landing', privetRoute: false, isSubRoute: false, pageTitle: '', component: PartnerLanding, menubar: false, permissionKey: true },
  { key: 57, path: '/partner-onboard', privetRoute: false, isSubRoute: false, pageTitle: '', component: PartnerOnboarding, menubar: false, permissionKey: true },
  { key: 58, path: '/agreement', privetRoute: false, isSubRoute: false, pageTitle: '', component: Agreement, menubar: false, permissionKey: true },
  { key: 59, path: '/payment', privetRoute: false, isSubRoute: false, pageTitle: '', component: Payment, menubar: false, permissionKey: true },
  { key: 60, path: '/payment-successful', privetRoute: false, isSubRoute: false, pageTitle: '', component: PaymentSuccessfull, menubar: false, permissionKey: true },

  //Partner Routes
  { key: 100, path: '/lead-management', privetRoute: true, isSubRoute: false, pageTitle: 'Leads Management', component: LeadsManagement, icon: <UserRoundPen />, menubar: true, permissionKey: true, isPartner: true },
  { key: 101, path: '/lead-management/add-newLeads', privetRoute: true, isSubRoute: false, pageTitle: 'Partners-Leads', component: AddnewLeads, icon: <UserRoundPen />, menubar: false, permissionKey: true, isPartner: true },

  { key: 60, path: '/earning-payout', privetRoute: true, isSubRoute: false, pageTitle: 'Earnings & Payouts', component: EarningsAndPayouts, icon: <BanknoteArrowUp />, menubar: true, permissionKey: true, isPartner: true },
  { key: 61, path: '/renewal', privetRoute: true, isSubRoute: false, pageTitle: 'Renewals', component: Renewals, icon: <CalendarSync />, menubar: true, permissionKey: true, isPartner: true },
]
