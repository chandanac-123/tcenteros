import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MasterLayout = () => (
  <div className='fixed inset-0 min-h-screen flex  bg-color-light-gray overflow-hidden'>
    <Sidebar />
    <div className='flex flex-col h-full w-full'>
      <Header />
      <main className='flex-1 w-full h-full flex justify-center items-center bg-textblack'>
        <Outlet />
      </main>
    </div>
  </div>
)

export default MasterLayout
