import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import { Link } from 'react-router-dom'
import AuthHeader from './components/AuthHeader'

const Login = () => {
  return (
    <AuthHeader title='Welcome Back' description=''>
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

        <div className='flex justify-end'>
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
        </div>
      </form>
    </AuthHeader>
  )
}

export default Login
