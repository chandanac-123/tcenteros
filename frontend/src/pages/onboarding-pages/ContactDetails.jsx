import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import { Input } from '@pages/components/ui/input'
import { Checkbox } from '@pages/components/ui/checkbox'
import { Mail, User, Phone, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ContactDetails = () => {
  const navigate = useNavigate()
  return (
    <SecondaryLayout>
      <OnboardHeader />
      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6 text-xl font-medium'>
          Let’s Set This Up for You
        </div>
        <div className='flex flex-row gap-16'>
          {/* Left Part */}
          <div className='w-full md:w-1/2'>
            <form className='space-y-4'>
              <Input
                label='Center Name'
                placeholder='Center Name'
                className='border-0 focus:ring-0'
                icon={<Users className='w-5 h-5 text-primary mr-2' />}
              />
              <Input
                label='Contact Person'
                placeholder='Contact Person'
                className='border-0 focus:ring-0'
                icon={<User className='w-5 h-5 text-primary mr-2' />}
              />
              <Input
                label='Email*'
                placeholder='Email'
                type='email'
                className='border-0 focus:ring-0'
                icon={<Mail className='w-5 h-5 text-primary mr-2' />}
              />
              <Input
                label='Phone*'
                placeholder='Phone'
                type='tel'
                className='border-0 focus:ring-0'
                icon={<Phone className='w-5 h-5 text-primary mr-2' />}
              />
              <Input
                label='City'
                placeholder='City'
                className='border-0 focus:ring-0'
                icon={<MapPin className='w-5 h-5 text-primary mr-2' />}
              />
              <div className='flex items-center space-x-2'>
                <Checkbox id='agree' />
                <label htmlFor='agree' className='text-sm'>
                  I agree to be contacted for onboarding and support.
                </label>
              </div>
            </form>
          </div>
          {/* Right Part */}
          <div className='w-full md:w-1/2 gap-4 flex flex-col justify-center items-center text-center'>
            <span className='text-3xl font-semibold  text-secondary'>
              Almost there!
            </span>
            <span className='text-base'>
              To unlock your custom pricing and send a copy of this
              recommendation to your inbox, just let us know where to reach you.
            </span>
          </div>
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}
        onClick={() => navigate('/marketing-support')}>
          Back
        </Button>
        <Button
          variant='outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/pricing-page')}
        >
          View My Pricing
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default ContactDetails
