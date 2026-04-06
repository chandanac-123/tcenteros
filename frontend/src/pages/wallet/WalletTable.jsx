import React, { useState } from 'react'
import { DataTable } from '@common/components/DataTable'
import ViewWallet from './ViewWallet'
import DeleteWallet from './DeleteWallet'

const WalletTable = ({ data, tableParams, setTableParams, pagination }) => {
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const columns = [
    {
      accessorKey: 'txn_id',
      header: 'Txn ID'
    },
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'type',
      header: 'Type'
    },
    {
      accessorKey: 'category',
      header: 'Category'
    },
    {
      accessorKey: 'transaction_center_name',
      header: 'Transaction Center'
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount'
    },
    {
      accessorKey: 'credit',
      header: 'Credit'
    },
    {
      accessorKey: 'debit',
      header: 'Debit'
    },
    {
      accessorKey: 'balance_after',
      header: 'Balance After'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')?.toLowerCase()

        const styles = {
          completed: 'bg-[#DEF4E6] text-[#34C759]',
          reserved: 'bg-[#F4F2DE] text-[#FF6200]',
          pending: 'bg-[#FFF6D6] text-[#FFCD0F]'
        }

        return (
          <span
            className={`inline-flex justify-center items-center min-w-[90px] px-3 py-1 rounded-[15px] text-[12px] font-poppins font-medium capitalize ${styles[status]}`}
          >
            {row.getValue('status')}
          </span>
        )
      }
    }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={pagination}
        paginationVisibile={true}
        search={false}
      />
      <ViewWallet open={viewOpen} setOpen={setViewOpen} />

      <DeleteWallet open={deleteOpen} setOpen={setDeleteOpen} />
    </>
  )
}

export default WalletTable
