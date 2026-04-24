import reset_success from '@assets/images/reset-success.png'
import { Link } from 'react-router-dom'
import single_arrow from '@assets/navigate-icons/single-left-color-arrow.svg'
import AuthHeader from './components/AuthHeader'

const ResetSuccess = () => {
  return (
    <AuthHeader title='' description='' logoTrue={false}>
      <div className='flex justify-center'>
        <img src={reset_success} alt='Reset Success' loading="lazy" />
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
          loading="lazy"
            src={single_arrow}
            alt='Go Back'
            className='inline-block mr-2 w-3 '
          />
          Back to Login
        </Link>
      </div>
    </AuthHeader>
  )
}

export default ResetSuccess
