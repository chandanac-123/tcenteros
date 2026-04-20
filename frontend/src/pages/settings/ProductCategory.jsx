import React, { useState } from 'react'
import { useAllSKUsQuery } from '@api-queries/center-admin/inventory/Query'
import SlotCard from './components/SlotCard'
import { Button } from '@pages/components/ui/button'
import AddProductCategory from './components/AddProductCategory'
import { useDeleteSKUMutation } from '@api-queries/center-admin/inventory/Query'
import DeleteModal from '@common/components/CustomeDelete'

const ProductCategory = () => {
  const { data } = useAllSKUsQuery()
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const { mutate: deleteProductCategory } = useDeleteSKUMutation()

  const handleConfirmDelete = async () => {
    try {
      if (!selectedItemId) return
      await deleteProductCategory(selectedItemId)
      setDeleteOpen(false)
      setSelectedItemId(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className='flex justify-end mb-4'>
        <Button
          onClick={() => setOpen(true)}
          size='addbutton'
          variant='default'
        >
          + Add New Product Category
        </Button>
      </div>
      <div className='grid md:grid-cols-4 gap-4'>
        {data?.map(item => (
          <SlotCard
            key={item.id}
            sku_name={item.name}
            onDelete={() => {
              setSelectedItemId(item.id)
              setDeleteOpen(true)
            }}
          />
        ))}
      </div>
      <AddProductCategory open={open} onOpenChange={setOpen} />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Product Category'
        description='Are you sure you want to delete this Product Category?'
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default ProductCategory
