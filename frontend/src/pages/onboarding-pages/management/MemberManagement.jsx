import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import OnboardHeader from '../components/OnboardHeader'
import OnboardProgress from '../components/OnboardProgress'
import RadioGroup from '@common/RadioGroup'
import { useAllPlatformsQuery } from '@api-queries/on-boarding/Query'

const FEATURE_NAME = 'Member Management'
const MemberManagement = () => {
  const navigate = useNavigate()

  // 🔑 READ + WRITE from Zustand
  const { centerTools, setTool } = useOnboardingStore()
  const { data: platforms } = useAllPlatformsQuery()
  const platform = platforms?.find(tool => tool.feature_name == FEATURE_NAME)
  const toolState = centerTools['member-management']

  const selectedValue =
    toolState?.enabled === true
      ? true
      : toolState?.enabled === false
      ? false
      : null

  const handleAnswer = value => {
    setTool(
      'member-management',
      value === 'yes',
      toolState?.feature_id // keep existing ID
    )
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={80} />
      {/* Card */}
      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
          <h2 className='font-semibold text-xl text-secondary'>
            {platform?.feature_name}
          </h2>
          <p className='text-sm text-grey'>{platform?.description}</p>
          <RadioGroup
            name='member_management'
            options={[
              { label: 'Yes', value: true },
              { label: 'No', value: false }
            ]}
            value={selectedValue}
            onChange={val => handleAnswer(val ? 'yes' : 'no')}
          />
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
