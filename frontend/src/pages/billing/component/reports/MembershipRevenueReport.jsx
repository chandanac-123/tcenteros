import React from 'react'
import { DataTable } from '@common/components/DataTable'
import { Badge } from '@pages/components/ui/badge'
import { useMembershipReportQuery } from '@api-queries/billing/Query'

const paymentStatusVariantMap = {
  paid: 'active',
  unpaid: 'inactive',
}

const membershipStatusVariantMap = {
  active: 'active',
  expired: 'inactive',
}

const MembershipRevenueReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useMembershipReportQuery(tableParams)

  const columns = [
    { accessorKey: 'member_name', header: 'Member Name' },
    { accessorKey: 'member_mobile', header: 'Member Mobile' },
    { accessorKey: 'plan_name', header: 'Plan Name' },
    { accessorKey: 'start_date', header: 'Start Date' },
    { accessorKey: 'end_date', header: 'End Date' },
    { accessorKey: 'total_amount', header: 'Total Amount' },
    { accessorKey: 'paid_amount', header: 'Paid Amount' },
    {
      accessorKey: 'payment_status',
      header: 'Payment Status',
      cell: ({ row }) => (
        <Badge
          label={row.original.payment_status?.replace('_', ' ').toUpperCase()}
          variant={paymentStatusVariantMap[row.original.payment_status] || 'inactive'}
        />
      )
    },
    {
      accessorKey: 'membership_status',
      header: 'Membership Status',
      cell: ({ row }) => (
        <Badge
          label={row.original.membership_status?.replace('_', ' ').toUpperCase()}
          variant={membershipStatusVariantMap[row.original.membership_status] || 'inactive'}
        />
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.memberships || []}
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
