import reset_success from '@assets/images/reset-success.png'
import { Link } from 'react-router-dom'
import dummy from '@assets/images/dummy.png'
import single_arrow from '@assets/images/single-left-color-arrow.svg'

const ResetSuccess = () => {
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
        <div className='flex justify-center'>
          <img src={reset_success} alt='Reset Success' />
        </div>
        <div className='flex flex-col justify-center gap-2 items-center text-center'>
          <span className='flex  font-semibold text-lg'>Password Changed</span>
          <span className='flex text-sm text-pricing_text'>
            Password changed successfully, You can login again with new password
          </span>
        </div>
        <div className='flex justify-center mt-2'>
          <Link to='/login' className='text-sm text-primary'>
            <img
              src={single_arrow}
              alt='Go Back'
              className='inline-block mr-2 w-3 '
            />
           Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetSuccess
