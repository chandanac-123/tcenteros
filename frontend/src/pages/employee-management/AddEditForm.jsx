import { Input } from '@pages/components/ui/input'
import SelectCategory from '@common/SelectCategory'
import { employeeCategory } from '@constants/employeeCategory'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import CustomeModal from '@common/CustomeModal'

const AddEditForm = ({ id, closeModal, open, setOpen }) => {
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

  const handleSubmit = e => {
    e.preventDefault()

    closeModal()
  }

  const handleSelect = id => {
    setCategory(id)
  }

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header={id ? 'Edit Employee' : 'Add Employee'}>
      <form className='space-y-2 w-full' onSubmit={handleSubmit}>
        <span>Select Category</span>
        <div className='flex gap-4'>
          {employeeCategory.map(item => (
            <SelectCategory
              key={item.id}
              item={item}
              selected={category === item.id}
              onSelect={() => handleSelect(item.id)}
            />
          ))}
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
            <CustomeSelect label=' Country' name='name' placeholder='Select' />
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
  )
}
export default AddEditForm
