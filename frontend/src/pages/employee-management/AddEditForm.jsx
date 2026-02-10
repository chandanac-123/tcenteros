import { Input } from '@pages/components/ui/input'
import SelectCategory from '@common/SelectCategory'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Plus } from 'lucide-react'
import AddCategory from './AddCategory'
import {
  useCategoriesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation
} from '@api-queries/employee-management/Query'
import InputFile from '@common/CustomeFileUpload'

const AddEditForm = ({ id, closeModal, open, setOpen }) => {
  const { data, isFetching } = useCategoriesQuery()
  const { mutateAsync: createCategory, isPending } = useCreateEmployeeMutation()
  const { mutateAsync: updateCategory, isPending: updatePending } =
    useUpdateEmployeeMutation()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [category, setCategory] = useState()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    qualification: '',
    experience: '',
    country: '',
    state: '',
    city: '',
    pin: '',
    address: '',
    password: '',
    designation_id: '',
    center_id: '',
    joining_date: ''
  })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (id) {
        await updateCategory({ id, ...formData })
      } else {
        await createCategory(formData)
      }
      closeModal()
    } catch (err) {}
  }

  const handleSelect = id => {
    setCategory(id)
  }

  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header={id ? 'Edit Employee' : 'Create Employee'}
      >
        <form className='space-y-2' onSubmit={handleSubmit}>
          <span>Select Category</span>
          <div className='w-full'>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
              {data?.map(item => (
                <SelectCategory
                  key={item.id}
                  item={item}
                  selected={category === item.id}
                  onSelect={() => handleSelect(item.id)}
                />
              ))}
              <label
                onClick={() => setCategoryOpen(true)}
                className='flex flex-col items-center border rounded-lg p-2 w-full cursor-pointer justify-center border-secondary'
              >
                <Plus className='w-6 h-6 text-secondary' />
                <span className='flex-1 text-sm text-secondary'>
                  Add Designation
                </span>
              </label>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Full Name'
                name='full_name'
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder='Enter Your Full Name'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Email ID'
                name='email'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder='Enter Your Email ID'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Mobile Number'
                name='mobile'
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder='Enter Your Mobile Number'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Qualification'
                name='qualification'
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                placeholder='Enter Your Qualification'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Total Experience'
                name='experience'
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder='Enter Your Experience'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Country'
                name='country'
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder='Select Country'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='State'
                name='state'
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                placeholder='Select State'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='City'
                name='city'
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder='Select City'
              />
            </div>
          </div>
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <Input
                label='Pin'
                name='pin'
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value })}
                placeholder='Enter PIN'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Address'
                name='address'
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder='Enter your Address'
              />
            </div>
          </div>
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <Input
                label='Password'
                name='password'
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder='Enter Your Password'
              />
            </div>
            <div className='flex-1'>
              <InputFile
                label='Upload Document'
                name='document'
                // Add file handler if needed
              />
            </div>
          </div>
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <CustomeSelect
                label='Choose Center'
                name='center_id'
                value={formData.center_id}
                onChange={e => setFormData({ ...formData, center_id: e.target.value })}
                placeholder='Choose Center'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Joining Date'
                name='joining_date'
                value={formData.joining_date}
                onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                placeholder='Enter your Joining Date'
              />
            </div>
          </div>

          <div className='flex justify-center mt-4 '>
            <Button size='addbutton' variant='default' type='submit'>
              {id ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </CustomeModal>
      <AddCategory
        categoryOpen={categoryOpen}
        setCategoryOpen={setCategoryOpen}
      />
    </>
  )
}
export default AddEditForm
