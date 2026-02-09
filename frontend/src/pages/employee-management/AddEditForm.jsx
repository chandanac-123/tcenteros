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

const AddEditForm = ({ id, closeModal, open, setOpen }) => {
  const { data, isFetching } = useCategoriesQuery()
  const { mutateAsync: createCategory, isPending } = useCreateEmployeeMutation()
  const { mutateAsync: updateCategory, isPending: updatePending } =
    useUpdateEmployeeMutation()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [category, setCategory] = useState()
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    email: '',
    mobile: '',
    qualification: '',
    experience: '',
    country: '',
    state: '',
    city: '',
    pin: '',
    address: '',
    password: ''
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
                name='name'
                placeholder='Enter Your Full Name'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Email ID'
                name='email'
                placeholder='Enter Your Email ID'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label=' Mobile Number'
                name='name'
                placeholder='Enter Your Mobile Number'
              />
            </div>
            <div className='flex-1'>
              <Input
                label=' Qualification'
                name='name'
                placeholder='Enter Your Qualification'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label=' Total Experience '
                name='name'
                placeholder='Enter Your Experience '
              />
            </div>
            <div className='flex-1'>
              <CustomeSelect
                label=' Country'
                name='name'
                placeholder='Select'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <CustomeSelect label=' State' name='name' placeholder='Select' />
            </div>
            <div className='flex-1'>
              <CustomeSelect label=' City' name='name' placeholder='Select' />
            </div>
          </div>
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <Input label=' Pin' name='name' placeholder='Enter PIN' />
            </div>
            <div className='flex-1'>
              <Input
                label=' Address'
                name='name'
                placeholder='Enter your Address'
              />
            </div>
          </div>
          <Input
            label=' Password'
            name='name'
            placeholder='Enter Your Password'
          />

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
