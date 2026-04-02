import React from 'react'
import { DataTable } from '@common/components/DataTable'
import { Badge } from '@pages/components/ui/badge'
import { useNetworkReportQuery } from '@api-queries/billing/Query'
const statusVariantMap = {
  approved: 'active',
  pending: 'inactive',
  pending_settlement: 'follow_up',
  completed: 'future_lead'
}

const NetworkEarningReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useNetworkReportQuery(tableParams)
  const columns = [
    { accessorKey: 'visit_type', header: 'Visited Type' },
    { accessorKey: 'visit_date', header: 'Visited Date' },
    { accessorKey: 'member_name', header: 'Member Name' },
    { accessorKey: 'home_center', header: 'Home Center' },
    { accessorKey: 'visited_center', header: 'Visited Center' },
    { accessorKey: 'platform_fee', header: 'Platform Fee' },
    { accessorKey: 'net_amount', header: 'Net Amount' },
    { accessorKey: 'total_charge', header: 'Total' },
    {
      accessorKey: 'status',
      header: 'Status',
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
      data={data?.visits || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default NetworkEarningReport
