import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { useSettingsTabStore } from '@store/tabStore'
import { useNavigate } from 'react-router-dom'

const InstructionPage = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const { setSelectedTab } = useSettingsTabStore()

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Basic Instruction'>
      <div className='flex items-center p-3'>
        <p className='font-medium text-textblack'>
          To get started, you need to complete a few initial setup. Please add
          the<span className='font-semibold'> Center Time</span> before using
          the application.
          <Button
            variant='link'
            className='whitespace-nowrap'
            onClick={() => {
              setSelectedTab(2)
              navigate('/settings')
            }}
          >
            Go to Settings
          </Button>
        </p>
      </div>
    </CustomeModal>
  )
}

export default InstructionPage
