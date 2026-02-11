import { useState } from 'react'
import TimePicker from '@common/Timepicker'
import { days } from '@constants/days'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import SlotCard from './components/SlotCard'
import DaySelector from './components/DaySelector'

const CenterOperations = () => {
  const [selectedDays, setSelectedDays] = useState([])


  const slots = [
    { id: 1, start: '9:00 AM', end: '11:00 AM', capacity: 20 },
    { id: 2, start: '11:00 AM', end: '1:00 PM', capacity: 25 },
    { id: 3, start: '2:00 PM', end: '4:00 PM', capacity: 15 },
    { id: 4, start: '4:00 PM', end: '6:00 PM', capacity: 18 }
  ]

  return (
    <div className='flex flex-col gap-6 py-2'>
      <span className='text-lg font-semibold'>Center Timings</span>

      <form className='space-y-4' id='center-timing'>
        {/* Time Pickers */}
        <div className='flex gap-4'>
          <div className='flex-1'>
            <TimePicker label='Opening Time' />
          </div>
          <div className='flex-1'>
            <TimePicker label='Closing Time' />
          </div>
        </div>

        {/* Week-off Days */}
        <div className='flex flex-col gap-2 w-full'>
          <DaySelector
            label='Week-off Days'
            days={days}
            selectedDays={selectedDays}
            onChange={setSelectedDays}
          />
        </div>

        <div className='flex justify-between items-center'>
          <Input label='Attendance allowed radius' />
          <Button
            id='center-timing'
            size='addbutton'
            variant='default'
            type='submit'
          >
            Save Changes
          </Button>
        </div>
      </form>

      <span className='text-lg font-medium'>Center Slots</span>
      <form className='space-y-4' id='create-center-slot'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <TimePicker label='Start Time' />
          </div>
          <div className='flex-1'>
            <TimePicker label='Ending Time' />
          </div>
          <div className='flex-1'>
            <Input label='Slot Capacity' />
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <Input label='Attendance allowed radius' />
          <Button
            id='create-center-slot'
            size='addbutton'
            variant='default'
            type='submit'
          >
            Create Slot
          </Button>
        </div>
      </form>

      <div className='flex flex-col gap-4'>
        <span className='font-semibold'>Existing Slots</span>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {slots.map(slot => (
            <SlotCard
              key={slot.id}
              startTime={slot.start}
              endTime={slot.end}
              capacity={slot.capacity}
              onDelete={() => console.log('Delete', slot.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CenterOperations
