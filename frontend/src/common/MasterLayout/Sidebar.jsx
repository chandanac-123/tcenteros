import { routes } from '../../routes/Routes'
import MenuCard from './MenuCard'
import logo from '@assets/header-icons/logo.svg'

const Sidebar = () => (
  <div className='flex flex-col gap-5 w-72 shrink-0 bg-layout_bg min-h-screen items-center '>
    <div className='flex flex-col justify-center items-center'>
      <img src={logo} alt='' className='w-16 h-16' />
      <span className='text-textwhite font-stick text-2xl font-bold'>
        TCENTEROS
      </span>
    </div>
    <div className='flex flex-col gap-2 w-full mt-3 px-2'>
      {routes.map((item, index) => {
        if (item.menubar) {
          return (
            <MenuCard
              key={index}
              icon={item.icon}
              iconActive={item.iconActive}
              title={item.pageTitle}
              path={item.path}
            />
          )
        }
      })}
    </div>
  </div>
)

export default Sidebar
