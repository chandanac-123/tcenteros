import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import TimePicker from '@common/components/Timepicker'
import CustomeSelect from '@common/components/CustomeSelect'
import {
  useCreateAttendanceMutation,
  useAllEmployeesQuery
} from '@api-queries/center-admin/attendance/Query'
import { useFormik } from 'formik'
import { attendanceValidationSchema } from '@utils/validations'
import { format } from 'date-fns'

const AddEmployeeAttendance = ({ open, setOpen }) => {
  const { data: employees, isLoading: isEmployeesLoading } =
    useAllEmployeesQuery()

  const { mutate: createAttendance } = useCreateAttendanceMutation()

  const initialValues = {
    employee_id: '',
    date: '',
    check_in_time: '',
    check_out_time: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: attendanceValidationSchema,
    onSubmit: async values => {
      try {
        await createAttendance(values)
        setOpen(false)
        formik.resetForm()
      } catch (error) {
      }
    }
  })

  const handleDateChange = (field, val) => {
    formik.setFieldValue(field, val ? format(val, 'yyyy-MM-dd') : '')
    formik.setFieldTouched(field, true, false)
  }

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Add Attendance' className='w-full max-w-lg'>
      <form className='space-y-4 px-1 sm:px-0' onSubmit={formik.handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <CustomeSelect
            label='Full Name'
            name='full_name'
            options={employees?.employees}
            placeholder='Select Employee'
            value={formik.values.employee_id}
            onChange={value => formik.setFieldValue('employee_id', value)}
            error={formik.touched.employee_id && formik.errors.employee_id}
          />

          <CustomDatePicker
            label='Date'
            name='date'
            disableFuture={true}
            value={formik.values.date}
            onChange={val => handleDateChange('date', val)}
            error={formik?.touched?.date && formik?.errors?.date}
          />

          <TimePicker
            label='Check in time'
            value={formik.values.check_in_time}
            onChange={val => formik.setFieldValue('check_in_time', val)}
            error={
              formik.touched.check_in_time && formik.errors.check_in_time
            }
          />

          <TimePicker
            label='Check out time'
            value={formik.values.check_out_time}
            onChange={val => formik.setFieldValue('check_out_time', val)}
            error={
              formik.touched.check_out_time && formik.errors.check_out_time
            }
          />
        </div>

        <div className='flex justify-center mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Add Attendance
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default AddEmployeeAttendance
