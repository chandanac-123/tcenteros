import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import ManagementToolRow from '../components/ManagementToolRow'
import { useAllPlatformsQuery } from '@api-queries/on-boarding/Query'
import { useEffect } from 'react'
import { featureNameToStoreKey } from '@constants/managementTool'

const CenterManagement = () => {
  const navigate = useNavigate()
  const { centerTools, setTool } = useOnboardingStore()
  const store = useOnboardingStore()
  console.log('store: ', store)
  const { data: platforms, isFetching: platformsFetch } = useAllPlatformsQuery()

  const { setFeatureIdMap } = useOnboardingStore()

useEffect(() => {
  if (!platforms) return

  const map = {}
  platforms.forEach(tool => {
    const key = featureNameToStoreKey[tool.feature_name]
    if (key) {
      map[key] = tool.id
    }
  })

  setFeatureIdMap(map)
}, [platforms])

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress step={5} total={5} value={80} />

      <div className='flex justify-center px-4 sm:px-10'>
        <div className='flex flex-col gap-4 px-6 py-6 bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
          <h2 className='font-semibold text-xl text-secondary'>
            Center Management
          </h2>

          <p className='text-sm text-grey'>
            Center Management helps you organize your trainers, manage members,
            and use the network efficiently.
          </p>

          {/* Map API id to store key for checked state */}
          {platforms?.map(tool => {
            // Map API feature_name to store key
         
            const storeKey = featureNameToStoreKey[tool.feature_name]
            const toolState = centerTools?.[storeKey]
            return (
              <ManagementToolRow
                key={tool.id}
                tool={tool}
                // checked={centerTools?.[storeKey]?.enabled === true}
                checked={toolState?.enabled === true}
                onToggle={(id, value) => setTool(storeKey, value, tool.id)}
                onNavigate={navigate}
              />
            )
          })}
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
          onClick={() => navigate('/smart-recommandation')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default CenterManagement
