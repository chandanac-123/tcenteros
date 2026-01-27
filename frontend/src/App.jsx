import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import Landing from '@pages/onboarding-pages/LandingPage'
import TypeSelection from '@pages/onboarding-pages/TypeSelection'
import ClassSelectionMode from '@pages/onboarding-pages/ClassMode'
import CenterSize from '@pages/onboarding-pages/CenterSizeScale'
import DegitalPresence from '@pages/onboarding-pages/DigitalPresence'
import CenterManagement from '@pages/onboarding-pages/management'
import MemberManagement from '@pages/onboarding-pages/management/MemberManagement'
import AttendanceTracking from '@pages/onboarding-pages/management/AttendanceTracking'
import PaymentBilling from '@pages/onboarding-pages/management/PaymentBilling'
import ReportAndInsight from '@pages/onboarding-pages/management/ReportAndInsight'
import SellableItem from '@pages/onboarding-pages/management/SellableItem'
import SlotAndCapacity from '@pages/onboarding-pages/management/SlotAndCapacity'
import TrainerAndStaff from '@pages/onboarding-pages/management/TrainerAndStaff'
import SmartRecommandation from '@pages/onboarding-pages/SmartRecommandation'
import MarketingSupport from '@pages/onboarding-pages/MarketingSupport'

const App = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route path='/' element={<Landing />} />
      <Route path='/type-selection' element={<TypeSelection />} />
      <Route path='/class-mode' element={<ClassSelectionMode />} />
      <Route path='/center-size-scale' element={<CenterSize />} />
      <Route path='/digital-presence' element={<DegitalPresence />} />
      <Route path='/smart-recommandation' element={<SmartRecommandation/>}/>
      <Route path='/marketing-support' element={<MarketingSupport/>}/>

      {/* Management Onboarding */}
      <Route path='/management' element={<CenterManagement />} />
      <Route path='/member-management' element={<MemberManagement />} />
      <Route path='/attendance-tracking' element={<AttendanceTracking />} />
      <Route path='/payment-billing' element={<PaymentBilling />} />
      <Route path='/report-and-insight' element={<ReportAndInsight />} />
      <Route path='/sellable-item' element={<SellableItem />} />
      <Route path='/slot-and-capacity' element={<SlotAndCapacity />} />
      <Route path='/trainer-and-staff' element={<TrainerAndStaff />} />

      {/* Public-only (Auth) */}
      {/* <Route element={<PublicRoute />}>
        <Route path='/login' element={<Login />} />
      </Route> */}

      {/* Private / Protected */}
      {/* <Route element={<PrivateRoute />}>
        <Route path='/dashboard' element={<Dashboard />} />
      </Route> */}
    </Routes>
  )
}

export default App
