import logo from '@assets/images/logo.svg'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import { Link } from 'react-router-dom'
import dummy from '@assets/images/dummy.png'
import single_arrow from '@assets/navigate-icons/single-left-arrow.svg'

const ResetPassword = () => {
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
          <img src={logo} alt='Logo' />
        </div>

        <span className='flex justify-start items-start font-semibold text-lg'>
          Create Password
        </span>
        <span className='flex justify-start items-start text-sm text-pricing_text'>
          Your new password must be unique from those previously used.
        </span>
        <form action='' className='space-y-4'>
            <PasswordInput
                     label='Create Password'
                     name='center_name'
                     placeholder='Create Password'
                     iconPosition='end'
                   />
                   <PasswordInput
                     label='Confirm New Password'
                     name='center_name'
                     placeholder='Confirm New Password'
                     iconPosition='end'
                   />

          <Button variant='button_filled' size='sm' className='w-full mt-4'>
            Submit
          </Button>
          <div className='flex justify-center'>
            <Link to='/forgot-password' className='text-sm text-pricing_text'>
              <img
                src={single_arrow}
                alt='Go Back'
                className='inline-block mr-2 w-3'
              />
              Go Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
