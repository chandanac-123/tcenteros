import { useOnboardingStore } from '@store/onboardingStore'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import SelectionCard from './components/SelectionCard'
import { useNavigate } from 'react-router-dom'
import { useAllClassTypesQuery } from '@api-queries/center-admin/on-boarding/Query'
import { useEffect } from 'react'
import { Spinner } from '@pages/components/ui/spinner'

const TypeSelection = () => {
  const navigate = useNavigate()
  const { typeSelectionId, setTypeSelection } = useOnboardingStore()
  const { data: classTypes, isFetching } = useAllClassTypesQuery()

  // Set default selection to first item from API if not already selected
  useEffect(() => {
    if (!classTypes || classTypes.length === 0) return
    const alreadyExists = classTypes.some(item => item.id === typeSelectionId)
    if (!alreadyExists) {
      const first = classTypes[0]
      setTypeSelection(first.id, first.name)
    }
  }, [classTypes, typeSelectionId, setTypeSelection])

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={1}
        value={16}
        title='What kind of fitness center do you own?'
        description='Choose the class type you prefer so we can recommend the best package for your needs.'
      />

      <div className='flex gap-8 px-4 sm:px-10 mt-10 flex-wrap lg:flex-nowrap justify-center'>
        {isFetching ? (
          <Spinner />
        ) : (
          classTypes?.map(item => (
            <SelectionCard
              key={item.id}
              item={item}
              selected={typeSelectionId === item.id}
              onSelect={() => setTypeSelection(item.id, item.name)}
            />
          ))
        )}
      </div>

      <div className='mt-auto flex justify-end px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='onboard_outline_primary'
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
