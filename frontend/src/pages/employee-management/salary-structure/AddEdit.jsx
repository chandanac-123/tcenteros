import React from 'react'
import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'

const StructureAddEdit = ({ open, setOpen, id }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header={id ? 'Edit Salary Structure' : 'Create Salary Structure'}
    >
      <form className='space-y-4 w-96 max-w-md sm:max-w-lg md:max-w-xl'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Designation'
              name='designation'
              placeholder='Select Designation'
            />
          </div>
          <div className='flex-1'>
            <Input label='Salary Type' name='salary_type' />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Pay Cycle'
              name='pay_cycle'
              placeholder='Select Pay Cycle'
            />
          </div>
          <div className='flex-1'>
            <Input label='Basic Salary' name='basic_salary' />
          </div>
        </div>
        <div className='flex justify-end'>
          <Button
            size='addbutton'
            type='submit'
          >
            {id ? 'Update Salary Structure' : 'Add Salary Structure'}
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default StructureAddEdit
