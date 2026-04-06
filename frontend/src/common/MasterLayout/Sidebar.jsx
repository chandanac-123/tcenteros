import { useBrandingStore } from '@store/brandingStore'
import { routes } from '../../routes/Routes'
import MenuCard from './MenuCard'
import logo from '@assets/header-icons/logo.svg'

const Sidebar = () => {
  const branding = useBrandingStore(state => state.branding)

  return (
    <div className='flex flex-col gap-5 w-72 shrink-0 bg-secondary min-h-screen items-center '>
      <div className='flex flex-col justify-center items-center'>
        <img src={branding.logo_url || logo} alt='' className='w-28 h-28 mt-3' />
      </div>
      <div className='flex flex-col gap-1 w-full my-3 px-2 overflow-auto'>
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
}

export default Sidebar
