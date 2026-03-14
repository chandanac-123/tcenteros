import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { useCloseMessageMutation } from '@api-queries/notifictaions/Query'

const CloseTicket = ({ open, setOpen, id }) => {


  const { mutateAsync:chat_close, isPending } =
    useCloseMessageMutation()

  const handleApprove = async e => {
    e.preventDefault()
    try {
      await chat_close({id:id})

      
      setOpen(false)
    } catch (error) {
      console.error('Approve failed', error)
    }
  }

  return (
    <>
      <CustomeModal open={open} onOpenChange={setOpen} header={'Close Chat'}>
        <form className='space-y-5' onSubmit={handleApprove}>
          <h2 className='text-md'>
            Are you sure you want to Close this Chat?
          </h2>
        
          <div className='flex justify-end gap-3'>
            <Button
              size='addbutton'
              variant='outline_secondary'
              type='button'
              onClick={() => setOpen(false)}
            >
              No
            </Button>
            <Button size='addbutton' type='submit'>
              Yes
            </Button>
          </div>
        </form>
      </CustomeModal>
    </>
  )
}

export default CloseTicket
