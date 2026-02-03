import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import AuthHeader from './components/AuthHeader'

const ForgetPassord = () => {
  return (
    <AuthHeader
      title='Forget Password'
      description='Don’t worry! it occurs. Please enter the email address linked with your account.'
    >
      <form action='' className='space-y-4'>
        <Input
          label='Email ID'
          name='email'
          placeholder='Enter Your Email ID'
        />
        <Button variant='button_filled' size='sm' className='w-full mt-4'>
          Send Code
        </Button>
      </form>
    </AuthHeader>
  )
}
export default ForgetPassord
