import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'

const CreatePlanFeature = ({ open, setOpen }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Create Plan Feature'
    >
      <form className='space-y-4 w-96 max-w-md sm:max-w-lg md:max-w-xl px-2 sm:px-4'>
        <Input className='w-full' />
        <div className='flex justify-end'>
          <Button size='addbutton' variant='default' type='submit'>
            Add Feature
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default CreatePlanFeature
