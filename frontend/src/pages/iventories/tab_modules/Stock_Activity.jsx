import React, { useState } from 'react'
import filters from '@assets/form-icons/filter.svg'
import FilterStockModal from '../components/FilterStockModal'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { DataTable } from '@common/DataTable'
import { Button } from '@pages/components/ui/button'
import AddStockEntry from '../components/AddStockEntry'

const Stock_Activity = () => {
  const [openStockEntry, setOpenStockEntry] = useState(false)

  const columns = [
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'product',
      header: 'Product'
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
      accessorKey: 'reference',
      header: 'Reference'
    },
    {
      accessorKey: 'balance_after',
      header: 'Balance After'
    },
    {
      accessorKey: 'user',
      header: 'User'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button>
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
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

  const dummyTransactions = [
    {
      date: '2026-02-20',
      product: 'Wireless Mouse',
      transaction_type: 'In',
      quantity: 20,
      reference: 'PO-1021',
      balance_after: 120,
      user: 'Akhil'
    },
    {
      date: '2026-02-21',
      product: 'Mechanical Keyboard',
      transaction_type: 'Out',
      quantity: 5,
      reference: 'SO-558',
      balance_after: 45,
      user: 'Rahul'
    },
    {
      date: '2026-02-22',
      product: 'USB-C Hub',
      transaction_type: 'Return',
      quantity: 30,
      reference: 'PO-1025',
      balance_after: 75,
      user: 'Nisha'
    },
    {
      date: '2026-02-23',
      product: '27" Monitor',
      transaction_type: 'Out',
      quantity: 2,
      reference: 'SO-561',
      balance_after: 16,
      user: 'Arjun'
    },
    {
      date: '2026-02-24',
      product: 'Laptop Stand',
      transaction_type: 'Adjustment',
      quantity: 3,
      reference: 'ADJ-009',
      balance_after: 58,
      user: 'Meera'
    }
  ]

  return (
    <div>
      <div className='flex justify-between px-4 py-2 items-center'>
        <h1 className='text-xl font-medium'>Stock Activity List</h1>

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
          data={dummyTransactions}
          pagination={31}
          paginationVisibile={true}
          search={false}
        />
      </div>
    </div>
  )
}

export default Stock_Activity
