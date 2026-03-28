import { useState } from 'react'
import TimePicker from '@common/components/Timepicker'
import { days } from '@constants/days'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import SlotCard from './components/SlotCard'
import DaySelector from './components/DaySelector'
import {
  useAllSlotQuery,
  useCreateSlotMutation,
  useDeleteSlotMutation
} from '@api-queries/slot/Query'
import { useFormik } from 'formik'
import DeleteModal from '@common/components/CustomeDelete'
import {
  useAllCenterTimeQuery,
  useCreateCenterTimeMutation,
  useUpdateCenterTimeMutation
} from '@api-queries/center-time/Query'
import { convert12To24WithSeconds, convertTo12Hour } from '@utils/helper'
import { centerSlotValidationSchema, centerTimingValidationSchema } from '@utils/validations'

const CenterOperations = () => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState(null)

  const { data: slots, isFetching } = useAllSlotQuery()
  const { mutateAsync: createSlot, isPending: isCreating } =
    useCreateSlotMutation()
  const { mutateAsync: deleteSlot, isPending } = useDeleteSlotMutation()

  const { data: centerTime, isFetching: isFetchingCenterTime } =
    useAllCenterTimeQuery()
  const { mutateAsync: createCenterTime, isPending: isCreatingCenterTime } =
    useCreateCenterTimeMutation()
  const { mutateAsync: updateCenterTime, isPending: isUpdatingCenterTime } =
    useUpdateCenterTimeMutation()

  const centerTimeInitialValues = {
    opening_time: convertTo12Hour(centerTime?.opening_time) || '',
    closing_time: convertTo12Hour(centerTime?.closing_time) || '',
    week_off_days:
      centerTime?.week_off_days?.map(day => day.toLowerCase()) || [],
    payroll_cycle_day: centerTime?.payroll_cycle_day || null,
    inventory_profit: centerTime?.inventory_profit || null
  }

  const initialValues = {
    start_time: '',
    end_time: '',
    slot_capacity: null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: centerSlotValidationSchema,
    onSubmit: async values => {
      try {
        await createSlot(values)
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const centerTimeFormik = useFormik({
    initialValues: centerTimeInitialValues,
    enableReinitialize: true,
    validationSchema: centerTimingValidationSchema,
    onSubmit: async values => {
      const formattedValues = {
        ...values,
        opening_time: convert12To24WithSeconds(values.opening_time),
        closing_time: convert12To24WithSeconds(values.closing_time),
        payroll_cycle_day: parseInt(values.payroll_cycle_day),
        inventory_profit: parseInt(values.inventory_profit)
      }
      try {
        if (centerTime) {
          await updateCenterTime({
            data: formattedValues
          })
        } else {
          await createCenterTime(formattedValues)
        }
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleConfirmDelete = async () => {
    try {
      if (!selectedSlotId) return
      await deleteSlot(selectedSlotId)
      setDeleteOpen(false)
      setSelectedSlotId(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='flex flex-col gap-6 py-2'>
      <span className='text-lg font-semibold'>Create Center Timing</span>

      <form
        className='space-y-4'
        id='center-timing'
        onSubmit={centerTimeFormik.handleSubmit}
      >
        {/* Time Pickers */}
        <div className='flex gap-4'>
          <div className='flex-1'>
            <TimePicker
              label='Opening Time'
              value={centerTimeFormik.values.opening_time}
              onChange={val =>
                centerTimeFormik.setFieldValue('opening_time', val)
              }
              error={centerTimeFormik.touched.opening_time && centerTimeFormik.errors.opening_time}
            />
          </div>
          <div className='flex-1'>
            <TimePicker
              label='Closing Time'
              value={centerTimeFormik.values.closing_time}
              onChange={val =>
                centerTimeFormik.setFieldValue('closing_time', val)
              }
              error={centerTimeFormik.touched.closing_time && centerTimeFormik.errors.closing_time}
            />
          </div>
        </div>

        {/* Week-off Days */}
        <div className='flex flex-col gap-2 w-full'>
          <DaySelector
            label='Week-off Days'
            days={days}
            selectedDays={centerTimeFormik.values.week_off_days}
            onChange={val =>
              centerTimeFormik.setFieldValue('week_off_days', val)
            }
          />
        </div>

        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Inventory Profit'
              name='inventory_profit'
              value={centerTimeFormik.values.inventory_profit}
              onChange={e =>
                centerTimeFormik.setFieldValue(
                  'inventory_profit',
                  e.target.value
                )
              }
              error={centerTimeFormik.touched.inventory_profit && centerTimeFormik.errors.inventory_profit}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Pay Cycle'
              name='payroll_cycle_day'
              value={centerTimeFormik.values.payroll_cycle_day}
              onChange={e =>
                centerTimeFormik.setFieldValue(
                  'payroll_cycle_day',
                  e.target.value
                )
              }
              error={centerTimeFormik.touched.payroll_cycle_day && centerTimeFormik.errors.payroll_cycle_day}
            />
          </div>
          <div className='flex-1 justify-end items-center flex'>
            <Button
              id='center-timing'
              size='addbutton'
              variant='button_outlined'
              type='submit'
            >
              Save Changes
            </Button>
          </div>
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
              error={formik.touched.start_time && formik.errors.start_time}
            />
          </div>
          <div className='flex-1'>
            <TimePicker
              label='Ending Time'
              value={formik.values.end_time}
              onChange={val => formik.setFieldValue('end_time', val)}
              error={formik.touched.end_time && formik.errors.end_time}
            />
          </div>
          <div className='flex-1'>
            <Input
              type='number'
              label='Slot Capacity'
              name='slot_capacity'
              value={formik.values.slot_capacity}
              onChange={formik.handleChange}
              error={formik.touched.slot_capacity && formik.errors.slot_capacity}
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
        {slots?.length > 0 && (
          <span className='font-semibold'>Existing Slots</span>
        )}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {slots?.map(slot => (
            <SlotCard
              key={slot.id}
              sku_name={null}
              startTime={slot.start_time}
              endTime={slot.end_time}
              capacity={slot.slot_capacity}
              onDelete={() => {
                setSelectedSlotId(slot.id)
                setDeleteOpen(true)
              }}
            />
          ))}
        </div>
      </div>
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Slot'
        description='Are you sure you want to delete this Slot?'
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default CenterOperations
