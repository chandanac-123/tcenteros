import { useState } from 'react'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import { fitnessTypes } from '../../constants/fitnessType'
import SelectionCard from './components/SelectionCard'
import { useNavigate } from 'react-router-dom'

const TypeSelection = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('dance')

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={1}
        total={5}
        value={20}
        title='What kind of fitness center do you own?'
        description='Choose the type of fitness business you own so we can recommend the best package.'
      />

      <div className='flex gap-4 px-4 sm:px-10 mt-10 flex-wrap lg:flex-nowrap justify-center lg:justify-between'>
        {fitnessTypes.map(item => (
          <SelectionCard
            key={item.id}
            item={item}
            selected={selectedType === item.id}
            onSelect={setSelectedType}
          />
        ))}
      </div>

      <div className='mt-auto flex justify-end px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_primary'
          rightIcon={rightcolorarrow}
          onClick={()=>navigate('/class-mode')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default TypeSelection
