import React, { useState } from 'react'
import filters from '@assets/form-icons/filter.svg'
import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import FilterModal from '../components/FilterModal'
import { useAllProductsQuery } from '@api-queries/inventory/Query'
import { Button } from '@pages/components/ui/button'
import AddProductModal from '../components/AddProductModal'

const Products = () => {
  const [tableParams, setTableParams] = useState({
    page: 1
  })
  const { data, isFetching } = useAllProductsQuery(tableParams)
  console.log('data: ', data)
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
          <button>
            <img src={edit} alt='edit' className='w-6 h-6' />
          </button>
          <button>
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]

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
          paginationVisibile={true}
          search={false}
        />
      </div>
    </div>
  )
}

export default Products
