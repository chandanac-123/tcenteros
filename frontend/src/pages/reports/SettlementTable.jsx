import { DataTable } from '@common/components/DataTable'
import { useConsolidatedSettlementsReportQuery } from '@api-queries/report/Query'
import { formatDate } from '@utils/helper'

const SettlementTable = ({ tableParams, setTableParams }) => {
  const { data, isFetching } =
    useConsolidatedSettlementsReportQuery(tableParams)

  const columns = [
    {
      accessorKey: 'scenario',
      header: 'Type',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          {row.original.scenario
            ?.replace(/_/g, ' ')
            ?.replace(/\b\w/g, c => c?.toUpperCase())}
        </span>
      )
    },
    {
      accessorKey: 'type',
      header: 'Scenario'
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className='flex gap-3'>{formatDate(row.original.date)}</span>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount'
    }
  ]

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        paginationVisibile={true}
        loading={isFetching}
        pagination={data?.total_count}
        search={false}
        tableParams={tableParams}
        setTableParams={setTableParams}
      />
    </div>
  )
}

export default SettlementTable
