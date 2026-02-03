import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import RadioGroup from '@common/RadioGroup'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import { useAllPlatformsQuery } from '@api-queries/on-boarding/Query'

const FEATURE_NAME = 'Trainer & Staff Management'
const TrainerAndStaff = () => {
  const navigate = useNavigate()
  const { data: platforms } = useAllPlatformsQuery()
  const platform = platforms?.find(tool => tool.feature_name == FEATURE_NAME)
  const { centerTools, setTool } = useOnboardingStore()
  const toolState = centerTools['staffmanagement']
  const selectedValue =
    toolState?.enabled === true
      ? true
      : toolState?.enabled === false
      ? false
      : null

  const handleAnswer = value => {
    setTool(
      'staffmanagement',
      value === 'yes',
      toolState?.feature_id // keep existing ID
    )
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={80} />
      <div className='flex w-full px-4 sm:px-10 mt-5 justify-center items-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
          <span className='text-start font-semibold text-xl text-secondary justify-start flex'>
            {platform?.feature_name}
          </span>
          <span className='font-normal text-sm justify-start items-start text-start flex'>
            {platform?.description}
          </span>
          <span className='text-start font-medium text-sm text-secondary justify-start flex'>
            Do you want to manage trainers and staff schedules in one system?
          </span>
          <RadioGroup
            name='paymentbilling'
            options={[
              { value: true, label: 'Yes' },
              { value: false, label: 'No, I manage accounts elsewhere' }
            ]}
            value={selectedValue}
            onChange={val => handleAnswer(val ? 'yes' : 'no')}
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
export default TrainerAndStaff
