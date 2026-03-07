import React, { useState } from 'react'
import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import {
  useAllProductsQuery,
  useDeleteProductMutation,
  useInventoryProfitQuery
} from '@api-queries/inventory/Query'
import { Button } from '@pages/components/ui/button'
import AddProductModal from '../components/AddProductModal'
import DeleteModal from '@common/CustomeDelete'

const Products = () => {
  const [tableParams, setTableParams] = useState({
    page: 1
  })
  const { data, isFetching } = useAllProductsQuery(tableParams)
  const { data: inventoryProfitData, isFetching: isFetchingInventoryProfit } =
    useInventoryProfitQuery()
  console.log('inventoryProfitData: ', inventoryProfitData?.inventory_profit);

  const { mutateAsync: deleteProduct } = useDeleteProductMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [open, setOpen] = useState(false)

  const columns = [
    {
      accessorKey: 'name',
      header: 'Product Name'
    },
    {
      accessorKey: 'sku_code',
      header: 'SKU'
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')?.toLowerCase()
        const styles = {
          active: 'bg-[#DEF4E6] text-[#34C759]',
          in_active: 'bg-[#FFE6E7] text-[#A30F0F]'
        }
        return (
          <span
            className={`inline-flex justify-center items-center min-w-[90px] px-3 py-1 rounded-[15px] text-[12px] font-poppins font-medium capitalize ${styles[status]}`}
          >
            {row.getValue('status')}
          </span>
        )
      }
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
              setDeleteId(row.original.id)
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
    if (!deleteId) return
    try {
      await deleteProduct(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className='flex flex-col'>
      <div className='flex justify-between px-4 py-2 items-center'>
        <h1 className='text-xl font-medium'>Products Lists</h1>
        <Button size='addbutton' type='submit' onClick={() => setOpen(true)}>
          + Add Product
        </Button>
        <AddProductModal open={open} setOpen={setOpen} />
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
