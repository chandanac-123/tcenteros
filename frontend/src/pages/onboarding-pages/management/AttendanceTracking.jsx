import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { useOnboardingStore } from '@store/onboardingStore'
import { useLocation, useNavigate } from 'react-router-dom'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import RadioGroup from '@common/components/RadioGroup'

const AttendanceTracking = () => {
  const navigate = useNavigate()
  const { centerTools, setTool} = useOnboardingStore()
  const { state } = useLocation()
  const tool = state?.tool

  const toolId = state?.tool?.id
const toolState = centerTools?.[toolId]

  // useEffect(() => {
  //   // Update CenterManagement attendance checkbox whenever selection changes
  //   if (attendanceType === 'no-tracking') {
  //     setTool('attendance', false)
  //   } else {
  //     setTool('attendance', true)
  //   }
  // }, [attendanceType, setTool])

   const selectedValue =
    toolState?.enabled === true
      ? true
      : toolState?.enabled === false
      ? false
      : null

   const handleAnswer = value => {
   setTool(toolId, value === 'yes', toolId)

  }


  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={60} />
      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
          <h2 className='font-semibold text-xl text-onboard_secondary'>
            {tool?.feature_name}
          </h2>
          <p className='text-sm text-grey'>{tool?.description}</p>
           <p className='font-medium text-sm text-onboard_secondary'>
            Do you need attendance tracking for your members?
          </p>
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
          variant='onboard_outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/management')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default AttendanceTracking
