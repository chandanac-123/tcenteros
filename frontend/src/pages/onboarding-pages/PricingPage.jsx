import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import backarrow from '@assets/images/backarrow.svg'
import check from '@assets/formicons/check.svg'
import OnboardHeader from './components/OnboardHeader'

const PricingPage = () => {
  return (
    <SecondaryLayout>
      <OnboardHeader />

      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-xl font-semibold text-secondary'>
            Your Exclusive 1-Year White-Label Package
          </h2>
        </div>
    

      <div className='flex flex-col items-center justify-center'>
        {/* Title */}

        {/* Pricing Card */}
        <div className='bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl p-8 w-full max-w-md'>
          {/* Subtitle */}
          <p className='text-center text-sm text-gray-500 mb-3'>
            Recommended package White-Label Offline + Live Classes
          </p>

          {/* Price */}
          <div className='text-center mb-4'>
            <span className='text-3xl font-bold text-purple-600'>
              ₹24,900.00
            </span>
            <span className='text-base font-medium text-purple-600'>
              {' '}
              / year
            </span>
            <span className='ml-2 text-sm text-gray-400 line-through'>
              ₹42,999.00
            </span>
          </div>

          {/* Divider */}
          <div className='border-b border-gray-200 my-4' />

          {/* Includes */}
          <h3 className='text-sm font-semibold text-center mb-4'>
            What’s included
          </h3>

          <ul className='space-y-3 mb-6'>
            {[
              'Branded Mobile App (iOS & Android)',
              'Admin Dashboard CRM',
              'Attendance Tracking (QR & Manual)',
              'Center report insight',
              'Payment Gateway integration',
              '1-Year Support'
            ].map(item => (
              <li
                key={item}
                className='flex items-center gap-3 text-sm text-gray-600'
              >
                <img src={check} alt='check' className='w-5 h-5' />
                {item}
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className='text-center text-lg font-semibold text-purple-600 mb-6'>
            Total 1-year Cost : ₹34,998.00
          </div>

          {/* Buttons */}
          <div className='flex gap-3'>
            <Button variant='button_outlined' className='w-1/2'>
              Request a Demo
            </Button>

            <Button variant='button_filled' className='w-1/2'>
              Buy now
            </Button>
          </div>
        </div>
      </div>
      {/* Back Button */}
      <div className='mt-6'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
      </div>
        </div>
    </SecondaryLayout>
  )
}

export default PricingPage
