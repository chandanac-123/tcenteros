import logo from '@assets/images/logo.svg'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { Link } from 'react-router-dom'

const ForgetPassord = () => {
  return (
    <div className='bg-slate-900 min-h-screen flex justify-center items-center px-2'>
      <div className='w-full max-w-md sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white gap-4 flex flex-col rounded-lg p-4 sm:p-6'>
        <div className='flex justify-center'>
          <img src={logo} alt='Logo' />
        </div>

        <div className='gap-2'>
          <span className='flex justify-start items-start font-semibold text-lg'>
            Forget Password
          </span>
          <span className='flex justify-start items-start text-sm text-pricing_text'>
            Don’t worry! it occurs. Please enter the email address linked with
            your account.
          </span>
        </div>

        <form action='' className='space-y-4'>
          <Input
            label='Email ID'
            name='email'
            placeholder='Enter Your Email ID'
          />

          <Button variant='button_filled' size='sm' className='w-full mt-4'>
            Send Code
          </Button>
          <div className='flex justify-center'>
            <Link to='/forgot-password' className='text-sm text-pricing_text'>
              Remember the Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
export default ForgetPassord
