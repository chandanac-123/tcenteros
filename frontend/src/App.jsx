import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import Landing from '@pages/onboarding-pages/LandingPage'
import TypeSelection from '@pages/onboarding-pages/TypeSelection'
import ClassSelectionMode from '@pages/onboarding-pages/ClassMode'
import CenterSize from '@pages/onboarding-pages/CenterSizeScale'
import DegitalPresence from '@pages/onboarding-pages/DigitalPresence'

const App = () => {
  return (
    <Routes>

      {/* Public pages */}
      <Route path='/' element={<Landing/>} />
      <Route path='/type-selection' element={<TypeSelection/>} />
      <Route path='/class-mode' element={<ClassSelectionMode/>} />
      <Route path='/center-size-scale' element={<CenterSize/>} />
      <Route path='/digital-presence' element={<DegitalPresence/>} />


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
