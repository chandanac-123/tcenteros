import React from 'react'
import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'

const AddStockEntry = ({ openStockEntry, setOpenStockEntry }) => {
  const handleSubmit = e => {
    e.preventDefault()
    setOpenStockEntry(false)
  }

  return (
    <CustomeModal
      open={openStockEntry}
      onOpenChange={setOpenStockEntry}
      header='Add Stock Entry'
    >
      <form onSubmit={handleSubmit} className='w-full max-w-2xl space-y-5 '>
        {/* Product Name */}
        <Input label='Supplier Name' placeholder='Enter Supplier Name' />

        {/* Grid Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input label='Invoice Name' placeholder='Add' />

          <Input label='Invoice Date' placeholder='Add' />

          <Input label='product Name' placeholder='Add' />

          <Input label='Quantity' placeholder='Add' />

          <Input label='Purchase Cost' placeholder='Add' />

          <Input label='Total Cost' placeholder='Add' />
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3 pt-4'>
          <Button size='addbutton' type='submit'>
            Add Stock
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AddStockEntry
