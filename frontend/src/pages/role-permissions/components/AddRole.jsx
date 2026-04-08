import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'

const AddRole = ({ open, setOpen }) => {
  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Create New Role'>
      <div>
        <Input
          label='Role Name'
          name='role'
          // value={formik.values.role}
          // onChange={formik.handleChange}
          // error={formik.touched.role && formik.errors.role}
          placeholder='Enter the role'
        />
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Add Role
          </Button>
        </div>
      </div>
    </CustomeModal>
  )
}

export default AddRole
