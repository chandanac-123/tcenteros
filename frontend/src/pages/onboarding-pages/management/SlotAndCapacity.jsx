import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import backarrow from '@assets/images/backarrow.svg'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import RadioGroup from '@common/RadioGroup'
import OnboardHeader from '../components/OnboardHeader'
import OnboardProgress from '../components/OnboardProgress'

const SlotAndCapacity = () => {
  const navigate = useNavigate()
  const { setTool, slotControl, setSlotControl } = useOnboardingStore()

  const handleAnswer = value => {
    setSlotControl(value)
    setTool('slot', value === 'yes')
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={80} />
      <div className='flex w-full px-4 sm:px-10 mt-5 justify-center items-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
          <span className='text-start font-semibold text-xl text-secondary justify-start flex'>
            Slot & Capacity Control
          </span>
          <span className='font-normal text-sm justify-start items-start text-start flex'>
            Avoid overcrowding, manage peak hours, and ensure a smooth
            experience for both trainers and members.
          </span>
          <span className='text-start font-medium text-sm text-secondary justify-start flex'>
            Do you want to control class slots and limit capacity?
          </span>
          <RadioGroup
            name='slot_control'
            options={[
              { value: 'yes', label: 'Yes, control slots & capacity' },
              { value: 'no', label: 'No, members walk in freely' }
            ]}
            value={slotControl}
            onChange={handleAnswer}
          />
        </div>
      </div>
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
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
export default SlotAndCapacity
