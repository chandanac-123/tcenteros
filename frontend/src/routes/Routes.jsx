import ForgetPassord from '@pages/authentication/ForgetPassord'
import Login from '@pages/authentication/Login.'
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

import dashboard from '../assets/sidebar-icons/dashboard.svg'
import branding from '../assets/sidebar-icons/branding.svg'
import attendace from '../assets/sidebar-icons/attendance.svg'
import employee from '../assets/sidebar-icons/employee.svg'
import inventory from '../assets/sidebar-icons/inventory.svg'
import membership from '../assets/sidebar-icons/membership.svg'
import network from '../assets/sidebar-icons/network.svg'
import billing from '../assets/sidebar-icons/billing.svg'
import wallet from '../assets/sidebar-icons/wallet.svg' 
import performance from '../assets/sidebar-icons/performance.svg' 
import crm from '../assets/sidebar-icons/crm.svg' 
import PerformanceAnalytics from '@pages/performance-analytics'
import Branding from '@pages/branding'
import Billing from '@pages/billing'
import Inventories from '@pages/iventories'
import Wallet from '@pages/wallet'
import Attendance from '@pages/attendance'
import Network from '@pages/network/index.'
import CRM from '@pages/crm'
import MembershipPlan from '@pages/membership-plan'
import EmployeeManagement from '@pages/employee-management'

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
    icon:dashboard,
    iconActive: '',
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
    icon: employee,
    iconActive: '',
    menubar: true,
    permission: true
  }
  , {
    key: 1,
    path: '/membership-plan',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Membership Plans',
    component: MembershipPlan,
    icon: membership,
    iconActive: '',
    menubar: true,
    permission: true
  }, {
    key: 1,
    path: '/crm',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'CRM',
    component: CRM,
    icon: crm,
    iconActive: '',
    menubar: true,
    permission: true
  }, {
    key: 1,
    path: '/network',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Network',
    component: Network,
    icon: network,
    iconActive: '',
    menubar: true,
    permission: true
  }, {
    key: 1,
    path: '/attendance',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Attendance',
    component: Attendance,
    icon: attendace,
    iconActive: '',
    menubar: true,
    permission: true
  }, {
    key: 1,
    path: '/wallet',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Wallet',
    component: Wallet,
    icon: wallet,
    iconActive: '',
    menubar: true,
    permission: true
  }, {
    key: 1,
    path: '/inventories',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Inventories',
    component: Inventories,
    icon: inventory,
    iconActive: '',
    menubar: true,
    permission: true
  }
  , {
    key: 1,
    path: '/billing',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Billing',
    component: Billing,
    icon: billing,
    iconActive: '',
    menubar: true,
    permission: true
  }
  , {
    key: 1,
    path: '/branding',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Branding',
    component: Branding,
    icon: branding,
    iconActive: '',
    menubar: true,
    permission: true
  }
  , {
    key: 1,
    path: '/performance-analytics',
    label: '',
    privetRoute: true,
    isSubRoute: false,
    pageTitle: 'Performance Analytics',
    component: PerformanceAnalytics,
    icon: performance,
    iconActive: '',
    menubar: true,
    permission: true
  }
]
