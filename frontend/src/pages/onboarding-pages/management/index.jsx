import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
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
  console.log('centerTools: ', centerTools);

  return (
     <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={1}
        total={5}
        value={33}
      />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 bg-white shadow-lg rounded-lg w-full sm:w-2/3 lg:w-1/3'>
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
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
        <Button variant='outline_primary' rightIcon={rightcolorarrow}>
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default CenterManagement
