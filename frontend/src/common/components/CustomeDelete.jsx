import { Button } from '@pages/components/ui/button'
import CustomeModal from './CustomeModal'

const DeleteModal = ({ header, open, setOpen, description, onConfirm }) => {
  return (
    <CustomeModal open={open} onOpenChange={setOpen} header={header}>
      <form className='space-y-4 w-96 max-w-md sm:max-w-lg md:max-w-xl px-2 sm:px-4'>
        <span className='text-grey text-sm '>{description}</span>
        <div className='flex justify-end gap-2'>
          <Button
            size='addbutton'
            variant='outline_secondary'
            type='button'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size='addbutton'
            variant='default'
            type='button'
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default DeleteModal
