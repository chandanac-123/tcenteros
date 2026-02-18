import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { useLocation, useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'
import { useEffect } from 'react'
import { sellableItems } from '@constants/sellableItem'
import SelectionCardTick from '../components/SelectionCardTick'

const SellableItem = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const tool = state?.tool
  const toolId = tool?.id

  const { setTool, sellableItem, setSellableItem } = useOnboardingStore()

  // 🔥 Update checkbox when selection changes
  useEffect(() => {
    if (!toolId) return

    if (sellableItem === 'nothing-to-sell') {
      setTool(toolId, false, toolId)
    } else {
      setTool(toolId, true, toolId)
    }
  }, [sellableItem, toolId, setTool])

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={3} total={5} value={80} />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
          <h2 className='font-semibold text-xl text-secondary'>
            {tool?.feature_name}
          </h2>

          <p className='text-sm text-grey'>{tool?.description}</p>

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
