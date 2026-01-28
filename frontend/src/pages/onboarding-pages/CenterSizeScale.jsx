import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import HexOptionGroup from './components/HexOptionGroup'
import { memberOptions, trainerOptions } from '@constants/centerSizeOption'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'

const CenterSize = () => {
  const navigate = useNavigate()
  const { memberCount, setMemberCount, trainerCount, setTrainerCount } =
    useOnboardingStore()

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={3}
        value={48}
        description='This helps us size your system correctly so it stays fast and
            reliable as you grow.'
      />

      <div className='flex items-center justify-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
          <HexOptionGroup
            title='How many active members do you currently have?'
            options={memberOptions}
            value={memberCount}
            onChange={setMemberCount}
          />

          <HexOptionGroup
            title='How many trainers or instructors work with you?'
            options={trainerOptions}
            value={trainerCount}
            onChange={setTrainerCount}
          />
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/class-mode')}
        >
          Back
        </Button>

        <Button
          variant='outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/digital-presence')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default CenterSize
