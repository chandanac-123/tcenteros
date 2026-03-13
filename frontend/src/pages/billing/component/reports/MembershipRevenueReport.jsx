import React from 'react'
import { DataTable } from '@common/components/DataTable'
import { useSalesReportQuery } from '@api-queries/inventory/Query'
import { formatDate } from '@utils/helper'
import { Badge } from '@pages/components/ui/badge'

  const statusVariantMap = {
    completed: 'active',
    pending: 'pending'
  }

const MembershipRevenueReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useSalesReportQuery(tableParams)

  const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className='flex gap-3'>{formatDate(row.original.date)}</span>
      )
    },
    { accessorKey: 'sale_number', header: 'Sales Number' },
    { accessorKey: 'items_count', header: 'Items' },
    { accessorKey: 'subtotal', header: 'Sub Total' },
    { accessorKey: 'tax', header: 'Tax' },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'status', header: 'Status',
       cell: ({ row }) => (
        <Badge
          label={row.original.status.replace('_', ' ').toUpperCase()}
          variant={statusVariantMap[row.original.status] || 'inactive'}
        />
      )
     }
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.sales || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default MembershipRevenueReport
