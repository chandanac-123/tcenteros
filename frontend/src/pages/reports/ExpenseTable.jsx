import { DataTable } from '@common/components/DataTable'
import { useConsolidatedExpensesReportQuery } from '@api-queries/center-admin/report/Query'
import { formatDate } from '@utils/helper'

const ExpenseTable = ({ tableParams, setTableParams }) => {
  const { data, isFetching } = useConsolidatedExpensesReportQuery(tableParams)

  const columns = [
    {
      accessorKey: 'type',
      header: 'Type',
       cell: ({ row }) => (
        <span className='flex gap-3'>
          {row?.original?.type
            ?.replace(/_/g, ' ')
            ?.replace(/\b\w/g, c => c?.toUpperCase())}
        </span>
      )
    },
    {
      accessorKey: 'center_name',
      header: 'Center Name'
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
        pagination={data?.total_count}
        search={false}
        loading={isFetching}
        tableParams={tableParams}
        setTableParams={setTableParams}
      />
    </div>
  )
}

export default ExpenseTable
