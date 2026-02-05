import CustomeModal from '@common/CustomeModal'
import { Badge } from '@pages/components/ui/badge'

const ViewForm = ({ open, setOpen }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='View Employee Details'
    >
      <div className='flex gap-10'>
        <div className='flex flex-col gap-2'>
          <span className='text-sm'>Full Name</span>
          <span className='flex text-textgrey '>Richard Nainggolan</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Designation</span>
          <span className='flex text-textgrey '>Aradhya</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Email</span>
          <span className='flex text-textgrey '>
            Richardnainggolan@gmail.com
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Phone</span>
          <span className='flex text-textgrey '>858584447858</span>
        </div>
      </div>

      <div className='flex gap-10'>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Center</span>
          <span className='flex text-textgrey '>Aradhya</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span>Join Date</span>
          <span className='flex text-textgrey '>
            Richardnainggolan@gmail.com
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Status</span>
          <Badge label='Active Member' variant='active' />
        </div>
      </div>
    </CustomeModal>
  )
}
export default ViewForm
