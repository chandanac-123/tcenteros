import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import { useAllPlatformsQuery } from '@api-queries/center-admin/on-boarding/Query'
import { useEffect } from 'react'
import ManagementToolRow from '../components/ManagementToolRow'

const CenterManagement = () => {
  const routes = ['/attendance-tracking', '/sellable-item']
  const navigate = useNavigate()
  const { centerTools, setTool } = useOnboardingStore()
  const { data: platforms } = useAllPlatformsQuery()

  useEffect(() => {
    if (!platforms) return
    platforms.forEach(tool => {
      const isMandatory = tool.mandatory === true
      const existing = centerTools?.[tool.id]
      if (isMandatory) {
        if (
          !existing ||
          !existing.enabled ||
          existing.feature_name !== tool.feature_name
        ) {
          setTool(tool.id, true, tool.id, tool.feature_name)
        }
      }
    })
  }, [platforms, centerTools])

  const handleNavigate = (route, tool) => {
    navigate(route, { state: { tool } })
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={5} total={5} value={80} />

      <div className='flex justify-center px-4 sm:px-10'>
        <div className='flex flex-col w-full gap-4 sm:w-2/3 px-6 py-6 lg:w-1/3 bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl'>
          <div className='flex-1 overflow-y-auto flex flex-col gap-2'>
            <h2 className='font-semibold text-xl text-onboard_secondary'>
              Center Management
            </h2>

            <p className='text-sm text-grey'>
              Center Management helps you organize your trainers, manage
              members, and use the network efficiently.
            </p>

            {platforms &&
              (() => {
                const mandatoryTools = []
                const optionalTools = []

                platforms.forEach((tool, index) => {
                  const isMandatory = tool.mandatory === true

                  if (isMandatory) {
                    mandatoryTools.push({ tool, index })
                  } else {
                    optionalTools.push({ tool, index })
                  }
                })

                const renderTool = (tool, routeIndex = null) => {
                  const storeKey = tool.id
                  const toolState = centerTools?.[storeKey]
                  const isMandatory = tool.mandatory === true

                  return (
                    <ManagementToolRow
                      key={tool.id}
                      tool={tool}
                      route={routeIndex !== null ? routes[routeIndex] : null}
                      isMandatory={isMandatory}
                      checked={isMandatory ? true : toolState?.enabled === true}
                      onToggle={(id, value) =>
                        !isMandatory &&
                        setTool(tool.id, value, tool.id, tool.feature_name)
                      }
                      onNavigate={routeIndex !== null ? handleNavigate : null}
                    />
                  )
                }

                const orderedOptionalTools = [...optionalTools].sort((a, b) =>
                  a.tool.feature_name.localeCompare(b.tool.feature_name)
                )

                return (
                  <>
                    {mandatoryTools.map(({ tool }) => renderTool(tool))}
                    {orderedOptionalTools.map(({ tool }, index) =>
                      renderTool(tool, index)
                    )}
                  </>
                )
              })()}
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
          variant='onboard_outline_primary'
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
