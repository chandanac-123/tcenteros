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
import MemberManagement from '@pages/onboarding-pages/management/MemberManagement'
import PaymentBilling from '@pages/onboarding-pages/management/PaymentBilling'
import ReportAndInsight from '@pages/onboarding-pages/management/ReportAndInsight'
import SellableItem from '@pages/onboarding-pages/management/SellableItem'
import SlotAndCapacity from '@pages/onboarding-pages/management/SlotAndCapacity'
import TrainerAndStaff from '@pages/onboarding-pages/management/TrainerAndStaff'
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
  WalletIcon
} from 'lucide-react'
import Reports from '@pages/reports'

export const routes = [
  {
    key: 0,
    path: '/',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: Landing,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/type-selection',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: TypeSelection,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/class-mode',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: ClassSelectionMode,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/center-size-scale',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: CenterSize,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/digital-presence',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: DegitalPresence,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/smart-recommandation',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: SmartRecommandation,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/marketing-support',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: MarketingSupport,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/contact-details',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: ContactDetails,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/pricing-page',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: PricingPage,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/invoice-summary',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: InvoiceSummary,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/management',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: CenterManagement,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/member-management',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: MemberManagement,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/attendance-tracking',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: AttendanceTracking,
    menubar: false,
    permission: true
  },

  {
    key: 0,
    path: '/payment-billing',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: PaymentBilling,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/report-and-insight',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: ReportAndInsight,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/sellable-item',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: SellableItem,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/slot-and-capacity',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: SlotAndCapacity,
    menubar: false,
    permission: true
  },

  {
    key: 0,
    path: '/trainer-and-staff',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: TrainerAndStaff,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/primary-login',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: PrimaryLogin,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/add-branches',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: '',
    component: AddBranches,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/login',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: Login,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/forgot-password',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: ForgetPassord,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/otp-verification',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: OTPVerification,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/reset-password',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: ResetPassword,
    menubar: false,
    permission: true
  },
  {
    key: 0,
    path: '/reset-success',
    label: '',
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: ResetSuccess,
    menubar: false,
    permission: true
  },
  {
    key: 1,
    path: '/dashboard',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Dashboard',
    component: Dashboard,
    icon: <LayoutDashboard />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/employee-management',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Employee Management',
    component: EmployeeManagement,
    icon: <UserCog />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/membership-plan',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Membership Plans',
    component: MembershipPlan,
    icon: <NotebookText />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/crm',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'CRM',
    component: CRM,
    icon: <FileUserIcon />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/network',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Network',
    component: Network,
    icon: <NetworkIcon />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/centerview/:id',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'CenterView',
    component: CenterView,
    icon: <NetworkIcon />,
    menubar: false,
    permission: true
  },
  {
    key: 1,
    path: '/attendance',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Attendance',
    component: Attendance,
    icon:  <ListChecks />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/wallet',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Wallet',
    component: Wallet,
    icon:  <WalletIcon />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/inventories',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Inventories',
    component: Inventories,
    icon:  <ShapesIcon />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/billing',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Billing',
    component: Billing,
    icon: <Receipt />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/accounts',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Account',
    component: Accounts,
    icon:  <Tickets />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/accounts/sub-modules/:module',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Account',
    component: AccountsSubModules,
    icon: <Tickets />,
    menubar: false,
    permission: true
  },
  {
    key: 1,
    path: '/branding',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Branding',
    component: Branding,
    icon:   <CrownIcon />,
    menubar: true,
    permission: true
  },
    {
    key: 1,
    path: '/reports',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Reports',
    component: Reports,
    icon:   <ProportionsIcon  />,
    menubar: true,
    permission: true
  },
  {
    key: 1,
    path: '/settings',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Settings',
    component: Settings,
    menubar: false,
    permission: true
  },
  {
    key: 1,
    path: '/profile',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Profile',
    component: ProfilePage,
    menubar: false,
    permission: true
  }
]
