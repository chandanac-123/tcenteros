import { useState } from 'react'
import TimePicker from '@common/Timepicker'
import { days } from '@constants/days'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import SlotCard from './components/SlotCard'
import DaySelector from './components/DaySelector'
import { useAllSlotQuery, useCreateSlotMutation } from '@api-queries/slot/Query'
import { useFormik } from 'formik'

const CenterOperations = () => {
  const [selectedDays, setSelectedDays] = useState([])
  const { data: slots, isFetching } = useAllSlotQuery()
  const { mutateAsync: createSlot, isPending } = useCreateSlotMutation()

  const initialValues = {
    start_time: '',
    end_time: '',
    slot_capacity: 0
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async values => {
      console.log('values: ', values)
      try {
        await createSlot(values)
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

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
            variant='button_outlined'
            type='submit'
          >
            Save Changes
          </Button>
        </div>
      </form>

      <span className='text-lg font-medium'>Center Slots</span>
      <form
        className='space-y-4'
        id='create-center-slot'
        onSubmit={formik.handleSubmit}
      >
        <div className='flex gap-4'>
          <div className='flex-1'>
            <TimePicker
              label='Start Time'
              value={formik.values.start_time}
              onChange={val => formik.setFieldValue('start_time', val)}
            />
          </div>
          <div className='flex-1'>
            <TimePicker
              label='Ending Time'
              value={formik.values.end_time}
              onChange={val => formik.setFieldValue('end_time', val)}
            />
          </div>
          <div className='flex-1'>
            <Input
              type='number'
              label='Slot Capacity'
              name='slot_capacity'
              value={formik.values.slot_capacity}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex justify-end items-center'>
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
          {slots?.map(slot => (
            <SlotCard
              key={slot.id}
              startTime={slot.start_time}
              endTime={slot.end_time}
              capacity={slot.slot_capacity}
              onDelete={() => console.log('Delete', slot.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CenterOperations
