import logo from '@assets/images/logo.svg'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import googleicon from '@assets/form-icons/google.svg'
import { Switch } from '@pages/components/ui/switch'
import { Link } from 'react-router-dom'
import dummy from '@assets/images/dummy.png'


const Login = () => {
  return (
      <div
         className="min-h-screen flex justify-center items-center px-2"
         style={{
           backgroundImage:  `url(${dummy})`,
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
          Welcome Back
        </span>

        <form action='' className='space-y-3'>
          <Input
            label='Email ID'
            name='email'
            placeholder='Enter Your Email ID'
          />
          <PasswordInput
            label='Password'
            name='password'
            placeholder='Enter Password'
            iconPosition='end'
          />

          <div className='flex justify-between'>
            <div className='flex items-center gap-2'>
              <Switch />
              Remember me
            </div>
            <Link
              to='/forgot-password'
              className='text-sm text-secondary hover:underline'
            >
              Forgot Password?
            </Link>
          </div>

          <div className='mt4'>
            <Button variant='button_filled' size='sm' className='w-full mt-4'>
              Log in
            </Button>
            <div className='flex items-center w-full mt-4'>
              <div className='flex-1 h-px bg-gray-300'></div>
              <span className='px-4 text-textblack text-sm font-poppins'>
                or Log in with
              </span>
              <div className='flex-1 h-px bg-gray-300'></div>
            </div>

            <Button
              variant='button_filled'
              size='googlebutton'
              className='w-full mt-4'
              leftIcon={googleicon}
            >
              Log in with Google
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
