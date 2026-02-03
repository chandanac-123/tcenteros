import logo from '@assets/images/logo.svg'
import dummy from '@assets/images/dummy.png'

const AuthHeader = ({ title, description, children, logoTrue = true }) => {
  return (
    <div
      className='min-h-screen flex justify-center items-center px-2'
      style={{
        backgroundImage: `url(${dummy})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className='w-full max-w-md sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white gap-4 flex flex-col rounded-lg p-4 sm:p-6'>
        {logoTrue && (
          <div className='flex justify-center'>
            <img src={logo} alt='Logo' className='w-28 h-16' />
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
