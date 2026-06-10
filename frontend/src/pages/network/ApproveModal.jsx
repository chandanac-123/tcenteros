import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { useEditApproveNetworkMutation } from '@api-queries/center-admin/network/Query'

const ApproveModal = ({ open, setOpen, data }) => {


  const { mutateAsync: approveRequest, isPending } =
    useEditApproveNetworkMutation()

  const handleApprove = async e => {
    e.preventDefault()
    try {
      await approveRequest(data.network_membership_id)
      setOpen(false)
    } catch (error) {
    }
  }

  return (
    <>
      <CustomeModal open={open} onOpenChange={setOpen} header='Approve Request'>
        <form className='space-y-5' onSubmit={handleApprove}>
          <h2 className='text-[20px] leading-[30px]'>
            Do you sure you want to Approve this request?
          </h2>
          <p>
            Accepting this request will grant{' '}
            <span className='font-semibold'> {data?.member_full_name}</span>{' '}
            temporary access to work out at this center.{' '}
          </p>
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

export default ApproveModal
