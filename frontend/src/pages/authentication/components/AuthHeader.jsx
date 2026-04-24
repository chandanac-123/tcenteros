import logo from '@assets/header-icons/logo_in_auth.svg'
import dummy from '@assets/images/dummy.png'
import { useBrandingStore } from '@store/brandingStore'

const AuthHeader = ({ title, description, children, logoTrue = true }) => {
  const branding = useBrandingStore(state => state.branding)
  return (
    <div
      className='fixed inset-0 min-h-screen flex justify-center items-center px-2 overflow-hidden'
      style={{
        backgroundImage: `url(${dummy})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 9999
      }}
    >
      <div className='w-full max-w-md sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white gap-4 flex flex-col rounded-2xl p-4 sm:p-8'>
        {logoTrue && (
          <div className='flex justify-center'>
            <img
            loading="lazy"
              src={branding.logo_url || logo}
              alt='Logo'
              className='w-28 h-28'
            />
          </div>
        )}
        <div className='gap-2'>
          <span className='flex justify-start items-start font-semibold text-lg'>
            {title}
          </span>
          <span className='flex justify-start items-start text-sm text-pricing_text'>
            {description}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
export default AuthHeader
