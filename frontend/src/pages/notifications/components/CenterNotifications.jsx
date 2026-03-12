import { Badge } from '@pages/components/ui/badge'
import { Button } from '@pages/components/ui/button'
import React, { useState } from 'react'
import {
  useApproveTimeSlotMutation,
  useTimeSlotQuery
} from '@api-queries/notifictaions/Query'
import TimeslotChange from './TimeslotChange'

const statusVariantMap = {
  approved: 'active',
  rejected: 'inactive',
  pending: 'pending',
  completed: 'future_lead'
}

const CenterNotifications = () => {
  const [isTimeslotModalOpen, setIsTimeslotModalOpen] = useState(false)
  const { data: timeSlotData, isLoading: isTimeSlotLoading } =
    useTimeSlotQuery()
  const { mutate: approveTimeSlot } = useApproveTimeSlotMutation()
  const status = 'approved' // this will come from API

  const handleApprove = async e => {
    e.preventDefault()
    try {
      await approveTimeSlot(timeSlotData.network_membership_id)
      setIsTimeslotModalOpen(false)
    } catch (error) {
      console.error('Approve failed', error)
    }
  }

  return (
    <div className='flex border border-tab_bg rounded-lg p-2'>
      <div className='flex flex-col w-full items-center gap-2'>
        <div className='flex justify-between w-full items-center'>
          <span className='text-md text-textblack font-semibold'>
            This is a network notification description.
          </span>
          <span className='text-xs text-textgrey'>2 hours ago</span>
        </div>

        <div className='flex justify-between w-full items-center'>
          <span className='text-xs text-textgrey'>
            This is a network notification description.
          </span>

          <div className='flex gap-2'>
            <Button
              size='notificationbutton'
              variant='outline_primary'
              className='text-xs'
              onClick={() => setIsTimeslotModalOpen(true)}
            >
              Change time slot
            </Button>

            <Badge variant={statusVariantMap[status]} label={status} />
          </div>
        </div>
      </div>
      <TimeslotChange
        open={isTimeslotModalOpen}
        setOpen={setIsTimeslotModalOpen}
        handleApprove={handleApprove}
      />
    </div>
  )
}

export default CenterNotifications
