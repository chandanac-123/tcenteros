import CustomeModal from '@common/components/CustomeModal'
import { useCompleteSettlementMutation } from '@api-queries/center-admin/billing/Query'
import { Button } from '@pages/components/ui/button'

const CompleteSettlement = ({ open, setOpen, id }) => {
  const { mutate: completeSettlement, isPending } =
    useCompleteSettlementMutation()

  const handleSubmit = () => {
    if (!id) return
    completeSettlement(
      { id, data: {} },
      {
        onSuccess: () => {
          setOpen(false)
        }
      }
    )
  }

  return (
    <CustomeModal
      header='Complete Settlement'
      open={open}
      onOpenChange={setOpen}
    >
      <div className='space-y-4 w-96 max-w-md sm:max-w-lg md:max-w-xl px-2 sm:px-4'>
        <div className='text-sm'>
          Are you sure you want to{' '}
          <span className='font-semibold'>settle this period</span>?
        </div>

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
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </CustomeModal>
  )
}

export default CompleteSettlement
