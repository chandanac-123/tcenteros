import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import RadioGroup from '@common/RadioGroup'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import backarrow from '@assets/images/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'
import { sellableItems } from '@constants/sellableItem'

const SellableItem = () => {
  const navigate = useNavigate()
  const { centerTools, setTool } = useOnboardingStore()
  // Use the same id as in your API/platforms for sellable items
  console.log('centerTools: ', centerTools)

  const toolState = centerTools['sellable_items']
  const selectedValue =
    toolState?.enabled === true
      ? true
      : toolState?.enabled === false
      ? false
      : null

  const handleAnswer = value => {
    setTool(
      'sellable_items',
      value === 'yes',
      toolState?.feature_id // keep existing ID
    )
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={80} />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
          <h2 className='font-semibold text-xl text-secondary'>
            6. Sellable Items
          </h2>

          <p className='text-sm text-grey'>
            Do you sell or plan to sell anything at your center?
          </p>

          <p className='font-medium text-sm text-secondary'>
            Manage stock, avoid shortages, and connect item sales directly to
            billing — no spreadsheets needed
          </p>

          <RadioGroup
            name='sellable_items'
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
export default SellableItem
