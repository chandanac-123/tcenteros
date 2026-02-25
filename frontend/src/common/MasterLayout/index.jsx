import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MasterLayout = () => (
  <div className='fixed inset-0 flex bg-color-light-gray overflow-hidden'>
    <Sidebar />
    <div className='flex flex-col flex-1 min-w-0'>
      <Header />
      <main className='flex-1 min-w-0 overflow-hidden bg-layout_bg'>
        <Outlet />
      </main>
    </div>
  </div>
)

export default MasterLayout
