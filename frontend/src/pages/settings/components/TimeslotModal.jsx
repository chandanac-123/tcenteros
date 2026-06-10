import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { centerSlotValidationSchema } from '@utils/validations'
import { useFormik } from 'formik'
import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import TimePicker from '@common/components/Timepicker'
import { useCreateSlotMutation } from '@api-queries/center-admin/slot/Query'

const TimeslotModal = ({ open, onOpenChange }) => {
  const { mutateAsync: createSlot, isPending: isCreating } =
    useCreateSlotMutation()
  const initialValues = {
    start_time: '',
    end_time: '',
    slot_capacity: 0
  }

  const formik = useFormik({
    initialValues,
    validationSchema: centerSlotValidationSchema,
    onSubmit: async values => {
      try {
        await createSlot(values)
        formik.resetForm()
        onOpenChange(false)
      } catch (error) {
      }
    }
  })

  return (
    <CustomeModal
      open={open}
      onOpenChange={onOpenChange}
      header='Create Center Slot'
    >
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
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              type='number'
              label='Slot Capacity'
              name='slot_capacity'
              value={formik.values.slot_capacity}
              onChange={formik.handleChange}
              error={
                formik.touched.slot_capacity && formik.errors.slot_capacity
              }
            />
          </div>
          <div className='flex-1'></div>
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
    </CustomeModal>
  )
}

export default TimeslotModal
