import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import Landing from '@pages/onboarding-pages/LandingPage'
import TypeSelection from '@pages/onboarding-pages/TypeSelection'

const App = () => {
  return (
    <Routes>

      {/* Public pages */}
      <Route path='/' element={<Landing/>} />
      <Route path='/type-selection' element={<TypeSelection/>} />


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
