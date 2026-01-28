import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import { useEffect, useState } from 'react'
import SelectionCardTick from '../components/SelectionCardTick'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import backarrow from '@assets/images/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'
import { sellableItems } from '@constants/sellableItem'

const SellableItem = () => {
  const navigate = useNavigate()
  const { setTool, sellableItem, setSellableItem } = useOnboardingStore()

  useEffect(() => {
    // Update CenterManagement attendance checkbox whenever selection changes
    if (sellableItem === 'nothing-to-sell') {
      setTool('sellable_items', false)
    } else {
      setTool('sellable_items', true)
    }
  }, [sellableItem, setTool])

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress step={3} total={5} value={60} />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-2xl rounded-lg w-auto'>
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

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center'>
            {sellableItems.map(item => (
              <SelectionCardTick
                key={item.id}
                item={item}
                selected={sellableItem === item.id}
                onSelect={setSellableItem}
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
export default SellableItem
