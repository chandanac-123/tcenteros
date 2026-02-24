import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'

const EditPublicUrl = ({ open, setOpen }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Edit View Public Link information '
    >
      <Input label='Website URL' placeholder='Enter your Website URL' />
      <div className='flex gap-2 justify-end pt-4'>
        <Button
          onClick={() => setOpen(false)}
          size='addbutton'
          variant='outline_secondary'
          type='submit'
        >
          Cancel
        </Button>
        <Button size='addbutton' variant='default' type='submit'>
          Update
        </Button>
      </div>
    </CustomeModal>
  )
}
export default EditPublicUrl
