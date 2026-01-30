// import { useState } from 'react'
import { useOnboardingStore } from '@store/onboardingStore'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import { fitnessTypes } from '../../constants/fitnessType'
import SelectionCard from './components/SelectionCard'
import { useNavigate } from 'react-router-dom'
import { useAllClassTypesQuery } from '@api-queries/on-boarding/Query'

const TypeSelection = () => {
  const navigate = useNavigate()
  const { typeSelection, setTypeSelection } = useOnboardingStore()
  const { data: classTypes, isFetching: classTypesFetch } = useAllClassTypesQuery();  

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={1}
        value={16}
        title='What kind of fitness center do you own?'
        description='Choose the class type you prefer so we can recommend the best package for your needs.'
      />

      <div className='flex gap-4 px-4 sm:px-10 mt-10 flex-wrap lg:flex-nowrap justify-center lg:justify-between'>
        {classTypes?.map(item => (
          <SelectionCard
            key={item.id}
            item={item}
            selected={typeSelection === item.id}
            onSelect={setTypeSelection}
          />
        ))}
      </div>

      <div className='mt-auto flex justify-end px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/class-mode')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default TypeSelection
