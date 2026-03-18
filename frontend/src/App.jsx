import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import { routes } from './routes/Routes'
import PublicRoute from './routes/PublicRoute'
import { v4 as uuidv4 } from 'uuid'
import MasterLayout from './common/MasterLayout'
import { useBrandingStore } from '@store/brandingStore'
import { useEffect } from 'react'
import { useAllBrandQuery } from './api-queries/branding/Query'
import PageNotFound from './common/components/PageNotFound'

const App = () => {
  const { data } = useAllBrandQuery()

  const loadBrandingFromStorage = useBrandingStore(
    state => state.loadBrandingFromStorage
  )
  const loadBrandingFromAPI = useBrandingStore(
    state => state.loadBrandingFromAPI
  )

  useEffect(() => {
    loadBrandingFromStorage()
  }, [])

  useEffect(() => {
    if (data?.centers?.[0]?.branding) {
      loadBrandingFromAPI(data.centers[0].branding)
    }
  }, [data])

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
