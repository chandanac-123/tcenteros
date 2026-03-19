import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import SelectionWithoutCheckbox from './components/SelectionWithoutCheckbox'
import { marketingSupport } from '@constants/marketingSupport'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'

const MarketingSupport = () => {
  const navigate = useNavigate()

  const { marketingSupportType, setMarketingSupportType } = useOnboardingStore()

 const handleSelect = id => {
  if (id === 'none') {
    setMarketingSupportType(['none'])
    return
  }

  let updated = [...marketingSupportType]

  // remove 'none' if selecting other options
  updated = updated.filter(item => item !== 'none')

  if (updated.includes(id)) {
    updated = updated.filter(item => item !== id)
  } else {
    updated.push(id)
  }

  setMarketingSupportType(updated)
}

  return (
    <SecondaryLayout>
      <OnboardHeader />

      {/* Heading */}
      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6'>
          <span className='text-xl font-medium text-onboard_secondary'>
            Do you need a marketing support?
          </span>
          <span className='text-grey text-sm'>
            Let’s plan a marketing strategy online
          </span>
          <span className='text-textblack text-sm font-medium'>
            Get all the leads and manage it in one place
          </span>
        </div>
      </div>

      {/* Options */}
      <div className='flex justify-center px-4 sm:px-10 mt-10'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full  lg:w-1/3'>
          {/* Card Options */}
          {marketingSupport.map(item => (
            <SelectionWithoutCheckbox
              key={item.id}
              item={item}
              selected={marketingSupportType.includes(item.id)}
              onSelect={() => handleSelect(item.id)}
            />
          ))}

          {/* NONE OPTION WITH RADIO */}
          <label
            className={`
              flex items-center gap-4 border-2 rounded-lg px-4 py-3 cursor-pointer transition
              ${
                marketingSupportType === 'none'
                  ? 'border-onboard_primary bg-onboard_primary/5'
                  : 'border-bordergreylight'
              }
            `}
          >
            <input
              type='radio'
              name='marketing-support'
              checked={marketingSupportType.includes('none')}
             onChange={() => setMarketingSupportType(['none'])}
              className='w-5 h-5 accent-onboard_primary'
            />
            <span className='flex-1'>None of the above</span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/smart-recommandation')}
        >
          Back
        </Button>

        <Button
          variant='onboard_outline_primary'
          // size='sm'
          rightIcon={rightcolorarrow}
          disabled={!marketingSupportType}
          onClick={() => navigate('/contact-details')}
        >
          Boost Membership
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default MarketingSupport
