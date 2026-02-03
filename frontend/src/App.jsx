import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import { routes } from './routes/Routes'
import PageNotFound from '@common/PageNotFound'
import MasterLayout from '@common/sidebarLayout'
import PublicRoute from './routes/PublicRoute'
import { v4 as uuidv4 } from 'uuid'

const App = () => {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route element={<MasterLayout />}>
          <Route path='*' element={<PageNotFound />} />
          {routes.map(item => {
            if (item?.permission && item.privetRoute) {
              return (
                <Route
                  key={uuidv4()}
                  path={'/' + item.path}
                  element={<item.component />}
                />
              )
            }
          })}
        </Route>
      </Route>
      <Route element={<PublicRoute />}>
        {routes.map(item => {
          if (!item.privetRoute) {
            return (
              <Route
                key={uuidv4()}
                path={'/' + item.path}
                element={<item.component />}
              />
            )
          }
        })}
      </Route>
    </Routes>
  )
}

export default App
