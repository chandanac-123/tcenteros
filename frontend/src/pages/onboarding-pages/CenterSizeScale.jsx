import { useState } from 'react'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import HexOptionGroup from './components/HexOptionGroup'
import { memberOptions, trainerOptions } from '@constants/centerSizeOption'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import { useNavigate } from 'react-router-dom'

const CenterSize = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState('50-150')
  const [trainers, setTrainers] = useState('3-5')

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress step={3} total={5} value={60} />

      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6'>
          <span className='text-base font-normal text-black'>
            This helps us size your system correctly so it stays fast and
            reliable as you grow.
          </span>
        </div>
      </div>

      <div className='flex items-center justify-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
          <HexOptionGroup
            title='How many active members do you currently have?'
            options={memberOptions}
            value={members}
            onChange={setMembers}
          />

          <HexOptionGroup
            title='How many trainers or instructors work with you?'
            options={trainerOptions}
            value={trainers}
            onChange={setTrainers}
          />
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}
        onClick={() => navigate('/class-mode')}>
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
