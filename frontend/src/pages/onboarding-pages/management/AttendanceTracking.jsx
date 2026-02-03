import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import SelectionCardTick from '../components/SelectionCardTick'
import { attendanceTrackingType } from '@constants/attendanceTrack'
import { useEffect } from 'react'

const AttendanceTracking = () => {
  const navigate = useNavigate()
  const { setTool, attendanceType, setAttendanceType } = useOnboardingStore()

  useEffect(() => {
    // Update CenterManagement attendance checkbox whenever selection changes
    if (attendanceType === 'no-tracking') {
      setTool('attendance', false)
    } else {
      setTool('attendance', true)
    }
  }, [attendanceType, setTool])

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={60} />
      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
          <h2 className='font-semibold text-xl text-secondary'>
            Attendance Tracking
          </h2>
          <p className='text-sm text-grey'>
            Avoid overcrowding, manage peak hours, and ensure a smooth
            experience for both trainers and members.
          </p>
          <p className='font-medium text-sm text-secondary'>
            Do you need attendance tracking for your members?
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center'>
            {attendanceTrackingType.map(item => (
              <SelectionCardTick
                key={item.id}
                item={item}
                selected={attendanceType === item.id}
                onSelect={setAttendanceType}
              />
            ))}
          </div>
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
          variant='outline_primary'
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
