import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomDatePicker from '@common/CustomeDatepicker'
import TimePicker from '@common/Timepicker'

const AddEmployeeAttendance = ({ open, setOpen }) => {
  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Add Attendance'>
      <form className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Full Name'
              name='full_name'
              placeholder='Enter Your Full Name'
            />
          </div>
          <div className='flex-1'>
            <CustomDatePicker label=' Date' />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <TimePicker label='Check in time' />
          </div>
          <div className='flex-1'>
            <TimePicker label='Check out time' />
          </div>
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
