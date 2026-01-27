import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import YesNoQuestion from '../components/YesNouestion'
import SelectionCardTick from '../components/SelectionCardTick'
import { attendanceTrackingType } from '@constants/attendanceTrack'
import { useState } from 'react'

const AttendanceTracking = () => {
  const navigate = useNavigate()
  const { setTool } = useOnboardingStore()
  const [selectedType, setSelectedType] = useState('manual')

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress step={3} total={5} value={60} />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-2xl rounded-lg w-auto'>
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
                selected={selectedType === item.id}
                onSelect={setSelectedType}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
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
