import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'

const TimeslotChange = ({ open, setOpen, handleApprove }) => {
  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header='Are you sure you want to Approve this request?'
      >
        <form className='space-y-5' onSubmit={handleApprove}>
          <p>Accepting this request will Change the time slot.</p>
          <div className='flex justify-end gap-3'>
            <Button
              size='addbutton'
              variant='outline_secondary'
              type='button'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button size='addbutton' type='submit'>
              Approve
            </Button>
          </div>
        </form>
      </CustomeModal>
    </>
  )
}

export default TimeslotChange
