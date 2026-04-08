import React, { useState } from 'react'
import { DataTable } from '@common/components/DataTable'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import {
  useAllProductsQuery,
  useDeleteProductMutation,
} from '@api-queries/inventory/Query'
import { Button } from '@pages/components/ui/button'
import AddProductModal from '../components/AddProductModal'
import DeleteModal from '@common/components/CustomeDelete'
import AddInventoryProfit from '../components/AddInventoryProfit'

const Products = () => {
  const [tableParams, setTableParams] = useState({
    page: 1
  })
  const { data, isFetching } = useAllProductsQuery(tableParams)

  const { mutateAsync: deleteProduct } = useDeleteProductMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [open, setOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)

  const columns = [
    {
      accessorKey: 'name',
      header: 'Product Name'
    },
    {
      accessorKey: 'sku_code',
      header: 'SKU Code'
    },
    {
      accessorKey: 'stock',
      header: 'Current Stock'
    },
    {
      accessorKey: 'selling_price',
      header: 'Selling Price'
    },
    {
      accessorKey: 'reorder_level',
      header: 'Reorder Level'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {/* <button>
            <img src={edit} alt='edit' className='w-6 h-6' />
          </button> */}
          <button
            onClick={() => {
              setDeleteId(row.original.product_id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>Products List</h1>
        <div className='flex gap-2'>
          <Button size='addbutton' type='submit' onClick={() => setInventoryOpen(true)}>
            + Inventory Profit
          </Button>
          <Button size='addbutton' type='submit' onClick={() => setOpen(true)}>
            + Add Product
          </Button>
          <AddInventoryProfit open={inventoryOpen} setOpen={setInventoryOpen}/>
          <AddProductModal open={open} setOpen={setOpen} />
        </div>
      </div>
      <div className=''>
        <DataTable
          columns={columns}
          data={data?.products || []}
          setTableParams={setTableParams}
          tableParams={tableParams}
          pagination={data?.total}
          loading={isFetching}
          paginationVisibile={true}
          search={false}
        />
      </div>
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Product'
        description='Are you sure you want to delete this Product?'
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default Products
