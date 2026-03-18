import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import check from '@assets/form-icons/check.svg'
import OnboardHeader from './components/OnboardHeader'
import { useNavigate } from 'react-router-dom'
import { usePricingPageQuery } from '@api-queries/on-boarding/Query'
import { useOnboardingStore } from '@store/onboardingStore'

const PricingPage = () => {
  const navigate = useNavigate()
  const store = useOnboardingStore()
  const { data, isFetching } = usePricingPageQuery(store?.onboardId)

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <div className='px-4 sm:px-10 '>
        <div className='flex flex-col gap-1'>
          <h2 className='text-xl font-semibold text-onboard_secondary'>
            Your Exclusive 1-Year White-Label Package
          </h2>
        </div>

        <div className='flex flex-col items-center justify-center '>
          {/* Pricing Card */}
          <div className='bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto '>
            {/* CONTENT WITH PADDING */}

            <div className='py-6 px-20 '>
              {/* Subtitle */}
              <p className='text-center text-sm text-gray-500 mb-3'>
                Recommended package White-Label Offline + Live Classes
              </p>

              {/* Price */}
              <div className='text-center mb-4'>
                <span className='text-3xl font-bold text-onboard_secondary'>
                  {data?.calculated_amount
                    ? `₹${data.calculated_amount.toFixed(2)}`
                    : '₹0'}
                </span>
                <span className='text-base font-medium text-onboard_secondary'>
                  {' '}
                  / {data?.subscription_duration}
                </span>
                <span className='ml-2 text-sm text-gray-400 line-through'>
                  ₹42,999.00
                </span>
              </div>

              {/* Divider */}
              <div className='border-b border-gray-200 my-2' />

              {/* Includes */}
              <h3 className='text-sm font-semibold text-center mb-4'>
                What’s included
              </h3>

              <ul className='space-y-2 mb-2'>
                {data?.platform_features?.map(item => (
                  <li
                    key={item}
                    className='flex items-center gap-3 text-sm text-gray-600'
                  >
                    <img src={check} alt='check' className='w-4 h-4' />
                    {item.feature_name}
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className='text-center text-lg font-semibold text-onboard_secondary'>
                Total 1-year Cost :{' '}
                {data?.calculated_amount
                  ? `₹${data.calculated_amount.toFixed(2)}`
                  : '₹0'}
              </div>
            </div>

            {/* BUTTONS (NO px-20 / py-6) */}
            <div className='px-6 py-4 border-t border-gray-200 flex justify-center gap-3'>
              <Button
                variant='onboard_button_filled'
                size='sm'
                className='w-1/2'
                onClick={() => navigate('/invoice-summary')}
              >
                Buy now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className='mt-auto flex px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/contact-details')}
        >
          Back
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default PricingPage
