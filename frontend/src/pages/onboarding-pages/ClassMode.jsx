import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import SelectionCard from './components/SelectionCard'
import { classModes } from '@constants/classMode'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'

const ClassSelectionMode = () => {
  const navigate = useNavigate()
  const { classMode, setClassMode } = useOnboardingStore()

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={2}
        value={32}
        title='How do you conduct your classes?'
        description='Choose the class mode you prefer so we can recommend the best package for your needs.'
      />

      <div className='flex gap-6 px-4 sm:px-10 mt-10 justify-center'>
        {classModes.map(item => (
          <SelectionCard
            key={item.id}
            item={item}
            selected={classMode === item.id}
            onSelect={setClassMode}
          />
        ))}
      </div>

      <div className='mt-auto flex flex-col-reverse sm:flex-row gap-3 sm:gap-0 justify-between px-4 sm:px-10 py-4 sm:py-0'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/type-selection')}
          
        >
          Back
        </Button>
        <Button
          variant='onboard_outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/center-size-scale')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default ClassSelectionMode
