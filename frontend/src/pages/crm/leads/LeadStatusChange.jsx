import { useState } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Badge } from '@pages/components/ui/badge'
import clsx from 'clsx'
import CustomDatePicker from '@common/CustomeDatepicker'
import { Button } from '@pages/components/ui/button'

const LeadStatusChange = ({ open, setOpen }) => {
  const [selectedStatus, setSelectedStatus] = useState(null)

  const statusList = [
    { label: 'Converted', value: 'active', variant: 'active' },
    { label: 'Not Interested', value: 'inactive', variant: 'inactive' },
    { label: 'Pending', value: 'pending', variant: 'pending' },
    { label: 'Future Lead', value: 'futurelead', variant: 'future_lead' },
    { label: 'Follow Up', value: 'followup', variant: 'follow_up' }
  ]

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Change Status'>
      <div className='grid grid-cols-2 gap-4'>
        {statusList.map(status => {
          const isSelected = selectedStatus === status.value

          return (
            <div
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={clsx(
                'cursor-pointer transition-all duration-200 ease-in-out',
                isSelected
                  ? 'scale-105 shadow-lg'
                  : 'hover:scale-105 hover:shadow-md'
              )}
            >
              <Badge label={status.label} variant={status.variant} />
            </div>
          )
        })}
      </div>

      {/* ✅ Show only when Future Lead is selected */}
      {selectedStatus === 'futurelead' && (
        <div className='mt-4 animate-in fade-in slide-in-from-bottom-2 duration-200'>
          <CustomDatePicker
            label='Add Date'
            placeholder='Add Note (optional)'
          />
        </div>
      )}
      <Button
        size='addbutton'
        variant='default'
        className='flex justify-center'
      >
        Submit
      </Button>
    </CustomeModal>
  )
}

export default LeadStatusChange
