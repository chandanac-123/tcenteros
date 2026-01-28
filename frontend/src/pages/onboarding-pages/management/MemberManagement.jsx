import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import logo from '@assets/images/logo.svg'
import { Slider } from '@pages/components/ui/slider'
import moveicon from '@assets/images/moveicon.svg'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'

const MemberManagement = () => {
  const navigate = useNavigate()

  // 🔑 READ + WRITE from Zustand
  const { centerTools, setTool } = useOnboardingStore()

const selectedValue =
  centerTools['member-management'] === undefined
    ? null
    : centerTools['member-management']


  const handleAnswer = value => {
    setTool('member-management', value === 'yes')
  }

  return (
    <SecondaryLayout>
      {/* Header */}
      <header className='flex items-center px-4 sm:px-10 py-5'>
        <img src={logo} alt='Logo' />
      </header>

      {/* Progress */}
      <div className='px-10'>
        <div className='flex items-center gap-4 mb-2'>
          <span className='text-textgrey font-semibold'>Step 1 of 5</span>
          <img src={moveicon} alt='moveicon' className='w-5' />
        </div>

        <div className='w-full sm:w-2/3 lg:w-1/3'>
          <Slider defaultValue={[33]} max={100} disabled />
        </div>
      </div>

      {/* Card */}
      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
          <h2 className='font-semibold text-xl text-secondary'>
            1. Member Management
          </h2>

          <p className='text-sm text-grey'>
            Create unlimited membership plans, manage renewals, freezes,
            expiry dates, and see each member’s complete history in one place.
          </p>

          {/* Radios */}
          <div className='flex flex-col gap-3 mt-2'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input
                type='radio'
                name='member_management'
                checked={selectedValue === true}
                onChange={() => handleAnswer('yes')}
                className='w-4 h-4 accent-secondary'
              />
              <span className='text-sm'>Yes</span>
            </label>

            <label className='flex items-center gap-3 cursor-pointer'>
              <input
                type='radio'
                name='member_management'
                checked={selectedValue === false}
                onChange={() => handleAnswer('no')}
                className='w-4 h-4 accent-secondary'
              />
              <span className='text-sm'>No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/digital-presence')}
        >
          Back
        </Button>

        <Button
          variant='outline_primary'
          size='default'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/management')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default MemberManagement
