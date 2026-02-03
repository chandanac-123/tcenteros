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
    privetRoute: false,
    isSubRoute: false,
    pageTitle: '',
    component: Dashboard,
    icon: '',
    iconActive: '',
    menubar: true,
    permission: true
  }
]
