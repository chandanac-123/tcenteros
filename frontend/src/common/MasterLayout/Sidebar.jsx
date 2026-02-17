import { routes } from '../../routes/Routes'
import MenuCard from './MenuCard'
import logo from '@assets/header-icons/logo.svg'

const Sidebar = () => (
  <div className='flex flex-col gap-5 w-72 shrink-0 bg-textblack min-h-screen items-center pt-4'>

    <img src={logo} alt='' className='w-28 h-auto' />
    <div className='flex flex-col gap-2 w-full mt-6 px-2'>
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
