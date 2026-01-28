import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import ManagementToolRow from '../components/ManagementToolRow'
import { managementTools } from '@constants/managementTool'

const CenterManagement = () => {
  const navigate = useNavigate()
  const { centerTools, setTool } = useOnboardingStore()
  console.log('centerTools: ', centerTools)

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

          {managementTools.map(tool => (
            <ManagementToolRow
              key={tool.id}
              tool={tool}
              checked={centerTools[tool.id] === true}
              onToggle={setTool}
              onNavigate={navigate}
            />
          ))}
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}
        onClick={() => navigate('/digital-presence')}>
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
