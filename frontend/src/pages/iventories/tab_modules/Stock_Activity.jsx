import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { DataTable } from '@common/DataTable'
import { useAllStockTransactionsQuery } from '@api-queries/inventory/Query'
import { useState } from 'react'

const Stock_Activity = () => {
  const [tableParams, setTableParams] = useState({ page: 1 })
  const { data , isFetching} = useAllStockTransactionsQuery(tableParams)

  const columns = [
    {
      accessorKey: 'supplier_name',
      header: 'Supplier Name'
    },
    {
      accessorKey: 'product_name',
      header: 'Product'
    },
     {
      accessorKey: 'sku_code',
      header: 'SKU Code'
    },
    {
      accessorKey: 'invoice_number',
      header: 'Invoice Number'
    },
    {
      accessorKey: 'invoice_date',
      header: 'Date'
    },

   
    {
      accessorKey: 'transaction_type',
      header: 'Transaction Type',
      cell: ({ row }) => {
        const value = row.getValue('transaction_type')
        const status = value?.toUpperCase()

        const styles = {
          IN: 'bg-[#DEF4E6] text-[#34C759]',
          OUT: 'bg-[#FFE6E7] text-[#A30F0F]',
          RETURN: 'bg-[#E6F0FF] text-[#1D4ED8]',
          ADJUSTMENT: 'bg-[#FFF4E6] text-[#A37F0F]'
        }

        return (
          <span
            className={`inline-flex justify-center items-center min-w-[90px] px-3 py-1 rounded-[15px] text-[12px] font-medium capitalize ${
              styles[status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {value}
          </span>
        )
      }
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity'
    },
    {
      accessorKey: 'unit_cost',
      header: 'Unit Cost'
    },
    {
      accessorKey: 'subtotal',
      header: 'Subtotal'
    },
    {
      accessorKey: 'balance_after',
      header: 'Balance After'
    }

    // {
    //   header: 'Actions',
    //   cell: ({ row }) => (
    //     <div className='flex items-center gap-2'>
    //       <button>
    //         <img src={view} alt='view' className='w-6 h-6' />
    //       </button>
    //       <button>
    //         <img src={edit} alt='edit' className='w-6 h-6' />
    //       </button>
    //       <button>
    //         <img src={deleteicon} alt='delete' className='w-6 h-6' />
    //       </button>
    //     </div>
    //   )
    // }
  ]
  return (
    <div>
      <div className='flex justify-between px-4 py-2 items-center'>
        <h1 className='text-xl font-medium'>Stock Activity List</h1>
      </div>
      <div className=''>
        <DataTable
          columns={columns}
          data={data?.transactions}
          pagination={data?.total}
          loading={isFetching}
          paginationVisibile={true}
          search={false}
        />
      </div>
    </div>
  )
}

export default Stock_Activity
