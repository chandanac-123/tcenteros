import React from 'react'
import { DataTable } from '@common/DataTable'
import { useInventoryReportQuery } from '@api-queries/inventory/Query'

const InventoryReport = () => {
  const {data} = useInventoryReportQuery()
  const columns = [
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'sales',
      header: 'Sales'
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity'
    },
    {
      accessorKey: 'transaction_Type',
      header: 'Transaction Type'
    },
    {
      accessorKey: 'Available',
      header: 'Available'
    },
    {
      accessorKey: 'status',
      header: 'status'
    },

  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={[]}
        pagination={32}
        search={false}
         paginationVisibile={true}
      />
    </>
  )
}

export default InventoryReport
