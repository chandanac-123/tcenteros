import React, { useState } from 'react'
import { DataTable } from '@common/components/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import { Button } from '@pages/components/ui/button'
import AddStockEntry from '../components/AddStockEntry'
import { useAllStockQuery } from '@api-queries/inventory/Query'

const Receive_Stock = () => {
  const [tableParams, setTableParams] = useState({ page: 1 })
  const [openStockEntry, setOpenStockEntry] = useState(false)
  const { data, isFetching } = useAllStockQuery(tableParams)

  const columns = [
    {
      accessorKey: 'product_name',
      header: 'Product Name'
    },
    {
      accessorKey: 'invoice_name',
      header: 'Invoice Name'
    },
    {
      accessorKey: 'invoice_date',
      header: 'Invoice Date'
    },
    { accessorKey: 'quantity_added', header: 'Quantity Added' },
    {
      accessorKey: 'available_quantity',
      header: 'Available Quantity'
    },
    {
      accessorKey: 'cost_price',
      header: 'Unit Price'
    },
   
    {
      accessorKey: 'total',
      header: 'Total Cost'
    }
    // {
    //   header: 'Actions',
    //   cell: ({ row }) => (
    //     <div className='flex items-center gap-2'>

    //       <button>
    //         <img src={deleteicon} alt='delete' className='w-6 h-6' />
    //       </button>
    //     </div>
    //   )
    // }
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>Receive Stock</h1>
        <Button
          size='addbutton'
          type='submit'
          onClick={() => setOpenStockEntry(true)}
        >
          + Add Stock
        </Button>
        <AddStockEntry
          openStockEntry={openStockEntry}
          setOpenStockEntry={setOpenStockEntry}
        />
      </div>
      <div className=''>
        <DataTable
          columns={columns}
          data={data?.rows}
          loading={isFetching}
          pagination={data?.total}
          paginationVisibile={true}
          search={false}
        />
      </div>
    </div>
  )
}

export default Receive_Stock
