import { DataTable } from '@common/components/DataTable'
import { useAllInventoryQuery } from '@api-queries/center-admin/accounts/Query'
import { useState } from 'react'
import { formatDate } from '@utils/helper'

const Inventory = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllInventoryQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'source', header: 'Source' },
    {
      accessorKey: 'date', header: 'Date',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          {formatDate(row?.original?.date)}
        </span>
      )
    },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'tax_amount', header: 'Tax Amount' },
    { accessorKey: 'total_amount', header: 'Total Amount' },
    { accessorKey: 'description', header: 'Description' }
  ]
  return (
    <>
      <DataTable
        columns={columns}
        data={data?.entries || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        loading={isLoading}
        pagination={data?.total}
        paginationVisibile={true}
        search={true}
      />
    </>
  )
}

export default Inventory
