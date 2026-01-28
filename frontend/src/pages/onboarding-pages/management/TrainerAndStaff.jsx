import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import { Slider } from '@pages/components/ui/slider'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import logo from '@assets/images/logo.svg'
import moveicon from '@assets/images/moveicon.svg'
import backarrow from '@assets/images/backarrow.svg'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import RadioGroup from '@common/RadioGroup'

const TrainerAndStaff = () => {
  const navigate = useNavigate()
  const { setTool, trainerAndStaff, setTrainerAndStaff } = useOnboardingStore()

  const handleAnswer = value => {
    setTrainerAndStaff(value)
    setTool('staffmanagement', value === 'yes')
  }
  return (
    <SecondaryLayout>
      {/* Header */}
      <header className='flex items-center justify-between px-4 sm:px-10 py-5 '>
        {/* Left Logo */}
        <div className='flex items-center gap-2'>
          <img src={logo} alt='Logo' className=' w-auto' />
        </div>
      </header>

      {/* progress bar */}
      <div className='w-full gap-2 px-10'>
        <div className='flex justify-start items-center gap-4 mb-2'>
          <span className=' text-textgrey font-roboto font-semibold text-base'>
            Step 1 of 5
          </span>
          <img src={moveicon} alt='moveicon' className='w-5' />
        </div>
        <div className='w-full sm:w-2/3 lg:w-1/3 gap-5 flex flex-col '>
          <div>
            {/* <Progress value={33} /> */}
            <Slider defaultValue={[33]} max={100} step={1} disabled />
          </div>
        </div>
      </div>
      <div className='flex w-full px-4 sm:px-10 mt-5 justify-center items-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-2xl rounded-lg w-full sm:w-2/3 lg:w-1/3'>
          <span className='text-start font-semibold text-xl text-secondary justify-start flex'>
            5.Trainer & Staff Management
          </span>
          <span className='font-normal text-sm justify-start items-start text-start flex'>
            Assign trainers to slots, manage schedules, and understand trainer
            workload without constant coordination.
          </span>
          <span className='text-start font-medium text-sm text-secondary justify-start flex'>
            Do you want to manage trainers and staff schedules in one system?
          </span>
          <RadioGroup
            name='paymentbilling'
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No, I manage accounts elsewhere' }
            ]}
            value={trainerAndStaff}
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
export default TrainerAndStaff
