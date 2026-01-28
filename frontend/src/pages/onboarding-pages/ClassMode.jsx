import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import SelectionCard from './components/SelectionCard'
import { classModes } from '@constants/classMode'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ClassSelectionMode = () => {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState('in-person')

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={2}
        total={5}
        value={40}
        title='How do you conduct your classes?'
        description='Choose the mode that best describes how your classes are delivered.'
      />

      <div className='flex gap-6 px-4 sm:px-10 mt-10 justify-center'>
        {classModes.map(item => (
          <SelectionCard
            key={item.id}
            item={item}
            selected={selectedMode === item.id}
            onSelect={setSelectedMode}
          />
        ))}
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}
        onClick={() => navigate('/type-selection')}>
          Back
        </Button>
        <Button
          variant='outline_primary'
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
