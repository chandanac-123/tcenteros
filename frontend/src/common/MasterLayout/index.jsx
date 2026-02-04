import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MasterLayout = () => (
  <div className='bg-color-light-gray min-h-screen'>
      <div className='flex h-full' >
    <Sidebar />
    <div className='flex-1 flex flex-col'>
      <Header />
      <main className='flex-1 p-6 bg-gray-50'>
        <Outlet />
      </main>
    </div>
    </div>  
  </div>

)

export default MasterLayout
