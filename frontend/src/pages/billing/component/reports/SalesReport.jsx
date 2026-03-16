import React from 'react'
import { DataTable } from '@common/components/DataTable'
import { formatDate } from '@utils/helper'
import { Badge } from '@pages/components/ui/badge'
import { useSaleReportQuery } from '@api-queries/billing/Query'

  const statusVariantMap = {
    paid: 'active',
    unpaid: 'inactive'
  }

const SalesReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useSaleReportQuery(tableParams)
  console.log('data: ', data);

  const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className='flex gap-3'>{formatDate(row.original.created_at)}</span>
      )
    },
    { accessorKey: 'order_type', header: 'Order Type' },
    { accessorKey: 'customer_name', header: 'Customer Name' },
    { accessorKey: 'subtotal_amount', header: 'Sub Total' },
    { accessorKey: 'tax_amount', header: 'Tax' },
    { accessorKey: 'total_amount', header: 'Total' },
    { accessorKey: 'status', header: 'Status',
       cell: ({ row }) => (
        <Badge
          label={row.original.status?.replace('_', ' ').toUpperCase()}
          variant={statusVariantMap[row.original.status] || 'inactive'}
        />
      )
     }
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.pagination?.total_records || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default SalesReport
