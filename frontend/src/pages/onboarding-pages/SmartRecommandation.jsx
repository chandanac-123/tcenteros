import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import best_fit_img from '@assets/images/bestfit-img.svg'
import tick from '@assets/formicons/secondary-tick.svg'
import SmartLayout from '@components/onboardlayouts/SmartLayout'

const SmartRecommandation = () => {
  return (
    <SmartLayout>
      <OnboardHeader />

      {/* Heading */}
      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6'>
          <span className='text-lg font-medium text-secondary'>
            We’ve Designed an Exclusive Branded Package for You
          </span>
          <span className='text-grey text-sm'>Based on your inputs</span>
        </div>
      </div>

      {/* Center Card */}
      <div className='flex justify-center px-4 sm:px-10'>
        <div className='w-full max-w-2xl bg-white shadow-2xl rounded-xl p-6 sm:p-8 flex flex-col gap-6'>
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
              {[
                'Center type',
                'Class Mode',
                'Class Size',
                'Trainers',
                'Attendance',
                'Management'
              ].map(label => (
                <div key={label} className='flex gap-2'>
                  <span className='text-textgrey min-w-[110px]'>{label} :</span>
                  <span className='text-textblack font-normal font-roboto'>Dance studio</span>
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
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>

        <Button variant='outline_primary' rightIcon={rightcolorarrow}>
          Continue
        </Button>
      </div>
    </SmartLayout>
  )
}

export default SmartRecommandation
