import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import logo from '@assets/images/logo.svg'
import moveicon from '@assets/images/moveicon.svg'
import { Slider } from '@pages/components/ui/slider'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@store/onboardingStore'

const CenterManagement = () => {
  const navigate = useNavigate()
  const { centerTools, setTool } = useOnboardingStore()

  const tools = [
    { id: 'member-management', label: 'Member Management', route: '/member-management' },
    { id: 'slot', label: 'Slot & Capacity Control', route: '/slot-and-capacity' },
    { id: 'attendance', label: 'Attendance Tracking', route: '/attendance-tracking' },
    { id: 'billing', label: 'Payment & Billing', route: '/payment-billing' },
    { id: 'staffmanagement', label: 'Staff Management', route: '/trainer-and-staff' },
    { id: 'sellableitems', label: 'Sellable Items', route: '/sellable-item' },
    { id: 'reports', label: 'Report & Insight', route: '/report-and-insight' }
  ]

  return (
    <SecondaryLayout>
      {/* Header */}
      <header className='flex items-center px-4 sm:px-10 py-5'>
        <img src={logo} alt='Logo' />
      </header>

      {/* Progress */}
      <div className='px-10'>
        <div className='flex items-center gap-4 mb-2'>
          <span className='text-textgrey font-semibold'>Step 1 of 5</span>
          <img src={moveicon} alt='moveicon' className='w-5' />
        </div>

        <div className='w-full sm:w-2/3 lg:w-1/3'>
          <Slider defaultValue={[33]} max={100} disabled />
        </div>
      </div>

      {/* Card */}
      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 bg-white shadow-lg rounded-lg w-full sm:w-2/3 lg:w-1/3'>
          <h2 className='font-semibold text-xl text-secondary'>
            Center Management
          </h2>

          <p className='text-sm text-grey'>
            Center Management helps you organize your trainers, manage members,
            and use the network efficiently.
          </p>

          {tools.map(tool => {
            const checked = centerTools[tool.id] === true

            return (
              <div
                key={tool.id}
                className={`flex items-center rounded-lg px-4 py-2 border-2 transition
                  ${checked
                    ? 'border-secondary bg-secondary/10'
                    : 'border-bordergreylight'}
                `}
              >
                {/* Text → Navigation */}
                <span
                  className='flex-1 cursor-pointer hover:underline'
                  onClick={() => navigate(tool.route)}
                >
                  {tool.label}
                </span>

                {/* Checkbox → State */}
                <input
                  type='checkbox'
                  checked={checked}
                  onChange={e => setTool(tool.id, e.target.checked)}
                  className='w-4 h-4 cursor-pointer accent-secondary'
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
        <Button variant='outline_primary' size='default' rightIcon={rightcolorarrow}>
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default CenterManagement
