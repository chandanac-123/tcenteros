import React from 'react'
import { DataTable } from '@common/components/DataTable'
import { useStockReportQuery } from '@api-queries/center-admin/inventory/Query'
import { formatDate } from '@utils/helper'
import { Badge } from '@pages/components/ui/badge'
const statusVariantMap = { 'IN': 'active', 'OUT': 'inactive' }
const StockMovementReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useStockReportQuery(tableParams)
  const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className='flex gap-3'>{formatDate(row.original.date)}</span>
      )
    },
    { accessorKey: 'supplier_name', header: 'Supplier Name' },
    { accessorKey: 'product_name', header: 'Product Name' },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'balance', header: 'Balance Quantity' },
    {
      accessorKey: 'transaction_type',
      header: 'Transaction Type',
      cell: ({ row }) => (
        <Badge
          label={row.original.transaction_type}
          variant={statusVariantMap[row.original.transaction_type] || 'inactive'}
        />
      )
    },
    { accessorKey: 'unit_cost', header: 'Unit Cost' },
    { accessorKey: 'total', header: 'Total' }
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.movements || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default StockMovementReport
