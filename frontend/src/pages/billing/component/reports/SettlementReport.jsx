import { DataTable } from '@common/components/DataTable'
import { useSettlementReportQuery } from '@api-queries/center-admin/billing/Query'
import { Badge } from '@pages/components/ui/badge'
import { formatDate } from '@utils/helper'
const statusVariantMap = { completed: 'active', pending: 'inactive' }
const flowVariantMap = {
  in: 'active', // green
  out: 'inactive' // red
}
const SettlementReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useSettlementReportQuery(tableParams)

  const columns = [
    {
      accessorKey: 'settlement_type',
      header: 'Settlement Type',
      cell: ({ row }) => {
        const type = row.original.settlement_type
        const formatted = type
          ?.replace(/_/g, ' ') // remove underscore
          ?.replace(/\b\w/g, l => l.toUpperCase()) // capitalize words
        return <span>{formatted}</span>
      }
    },
    {
      accessorKey: 'money_flow',
      header: 'Settlement Flow',
      cell: ({ row }) => {
        const flow = row.original.money_flow
        return (
          <Badge
            label={flow === 'in' ? 'Incoming' : 'Outgoing'}
            variant={flowVariantMap[flow]}
          />
        )
      }
    },
    {
      accessorKey: 'settlement_date',
      header: 'Settlement Date',
      cell: ({ row }) => {
        return <span>{formatDate(row.original.settlement_date)}</span>
      }
    },
    // { accessorKey: 'membership_income', header: 'Membership Income' },
    // { accessorKey: 'inventory_income', header: 'Inventory Income' },
    // { accessorKey: 'networking_income', header: 'Networking Income' },
    // { accessorKey: 'networking_expenses', header: 'Networking Expenses' },
    // { accessorKey: 'platform_fees', header: 'Platform Fees' },
    { accessorKey: 'amount', header: 'Total Amount' },
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
      data={data?.data || []}
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
