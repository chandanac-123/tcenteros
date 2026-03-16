import { DataTable } from '@common/components/DataTable'
import { useSettlementReportQuery } from '@api-queries/billing/Query'
import { Badge } from '@pages/components/ui/badge'
const statusVariantMap = { completed: 'active', pending: 'inactive' }

const SettlementReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useSettlementReportQuery(tableParams)

  const columns = [
    { accessorKey: 'period_label', header: 'Period' },
    { accessorKey: 'period_start', header: 'Start Date' },
    { accessorKey: 'period_end', header: 'End Date' },
    { accessorKey: 'membership_income', header: 'Membership Income' },
    { accessorKey: 'inventory_income', header: 'Inventory Income' },
    { accessorKey: 'networking_income', header: 'Networking Income' },
    { accessorKey: 'networking_expenses', header: 'Networking Expenses' },
    { accessorKey: 'platform_fees', header: 'Platform Fees' },
    { accessorKey: 'net_amount', header: 'Total' },
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
      data={data?.settlements || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default SettlementReport
