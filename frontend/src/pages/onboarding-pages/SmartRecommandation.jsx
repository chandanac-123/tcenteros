import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import best_fit_img from '@assets/images/bestfit-img.svg'
import tick from '@assets/form-icons/secondary-tick.svg'
import SmartLayout from '@common/onboardlayouts/SmartLayout'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'

const SmartRecommandation = () => {
  const navigate = useNavigate()
  const store = useOnboardingStore()

  const details = [
    { label: 'Center type', value: store.typeSelectionName },
    { label: 'Class Mode', value: store.classMode },
    { label: 'Class Size', value: store.memberCount },
    { label: 'Trainers', value: store.trainerCount },
    {
  label: 'Management',
  value: store.centerTools
    ? Object.values(store.centerTools)
        .filter(tool => tool.enabled)
        .map(tool => tool.feature_name)
        .filter(Boolean)
        .join(', ')
    : ''
}

  ]

  return (
    <SmartLayout>
      <OnboardHeader />

      {/* Heading */}
      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6'>
          <span className='text-2xl font-medium text-secondary'>
            We’ve Designed an Exclusive Branded Package for You
          </span>
          <span className='text-pricing_text text-sm'>
            Based on your inputs
          </span>
        </div>
      </div>

      {/* Center Card */}
      <div className='flex justify-center px-4 sm:px-10'>
        <div className='w-full max-w-2xl bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl p-6 sm:p-8 flex flex-col gap-6'>
          {/* Card Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-around gap-3'>
            <span className='bg-secondary text-white font-medium py-2 px-4 rounded-lg w-fit'>
              Best Fit for Your Business
            </span>
            <span className='text-base sm:text-lg font-medium text-textblack'>
              Your Recommended Package
            </span>
          </div>

          {/* Card Body */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 items-start'>
            {/* Image */}
            <div className='flex justify-center'>
              <img
                src={best_fit_img}
                alt='Best fit'
                className='w-40 sm:w-48 md:w-56'
              />
            </div>

            {/* Details */}
            <div className='flex flex-col gap-6 text-sm'>
              {details.map(({ label, value }) => (
                <div key={label} className='flex gap-2'>
                  <span className='text-textgrey min-w-[110px]'>{label} :</span>
                  <span className='text-textblack font-normal font-roboto'>
                    {(() => {
                      if (!value) return ''
                      const str = value.toString()
                      if (label === 'Management') {
                        return str
                          .split(',')
                          .map(item => item.trim())
                          .filter(Boolean)
                          .map(
                            item =>
                              item.charAt(0).toUpperCase() +
                              item.slice(1).toLowerCase()
                          )
                          .join(', ')
                      }
                      return (
                        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
                      )
                    })()}
                  </span>
                </div>
              ))}

              {/* Highlight */}
              <div className='mt-3 flex items-center bg-secondary_light gap-2 border border-secondary rounded-2xl p-3 text-secondary text-sm font-medium'>
                <img src={tick} alt='tick' className='w-5' />
                White-Label Offline + Live Classes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/management')}
        >
          Back
        </Button>

        <Button
          variant='outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/marketing-support')}
        >
          Continue
        </Button>
      </div>
    </SmartLayout>
  )
}

export default SmartRecommandation
