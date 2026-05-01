import { Badge } from '@pages/components/ui/badge'
import { Button } from '@pages/components/ui/button'
import React, { useState } from 'react'
import {
  useApproveTimeSlotMutation,
  useTimeSlotQuery
} from '@api-queries/center-admin/notifictaions/Query'
import TimeslotChange from './TimeslotChange'
import { Spinner } from '@pages/components/ui/spinner'

const statusVariantMap = {
  approved: 'active',
  rejected: 'inactive',
  pending: 'pending',
  completed: 'future_lead'
}

const CenterNotifications = () => {
  const [isTimeslotModalOpen, setIsTimeslotModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const { data: timeSlotData, isLoading } = useTimeSlotQuery()
  const { mutateAsync: approveTimeSlot } = useApproveTimeSlotMutation()

  const requests = timeSlotData?.requests || []

  const handleApprove = async () => {
    try {
      await approveTimeSlot({ id: selectedId })
      setIsTimeslotModalOpen(false)
    } catch (error) {
      console.error('Approve failed', error)
    }
  }

  return (
    <div className='flex flex-col gap-3'>

      {isLoading && (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      )}

      {!isLoading && requests.length === 0 && (
        <div className='flex justify-center text-textgrey text-sm'>
          No notifications found
        </div>
      )}

      {!isLoading && requests.length > 0 && (
        <>
          {requests.map(item => {
            const status = item?.status || 'pending'

            const description = `${item?.member?.full_name} requested to change the time slot from 
            ${item?.old_time_slot?.start_time} - ${item?.old_time_slot?.end_time} 
            to ${item?.new_time_slot?.start_time} - ${item?.new_time_slot?.end_time}`

            const subDescription = `${item?.change_type} change from ${item?.start_date} to ${item?.end_date}. Reason: ${item?.reason}`

            return (
              <div
                key={item?.id}
                className='flex border border-tab_bg rounded-lg p-3'
              >
                <div className='flex flex-col w-full gap-2'>
                  
                  {/* Main Description */}
                  <div className='flex justify-between items-center'>
                    <span className='text-md text-textblack font-semibold'>
                      {description}
                    </span>

                    <span className='text-xs text-textgrey'>
                      {new Date(item?.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Sub Description */}
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-textgrey'>
                      {subDescription}
                    </span>

                    <div className='flex gap-2'>
                      {item?.status === 'pending' && (
                        <Button
                          size='notificationbutton'
                          variant='outline_primary'
                          className='text-xs'
                          onClick={() => {
                            setSelectedId(item.id)
                            setIsTimeslotModalOpen(true)
                          }}
                        >
                          Change time slot
                        </Button>
                      )}

                      <Badge
                        variant={statusVariantMap[status]}
                        label={status}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* ✅ Single Modal */}
          <TimeslotChange
            open={isTimeslotModalOpen}
            setOpen={setIsTimeslotModalOpen}
            handleApprove={handleApprove}
          />
        </>
      )}
    </div>
  )
}

export default CenterNotifications