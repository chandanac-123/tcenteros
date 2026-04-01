import { DataTable } from '@common/components/DataTable'
import { useConsolidatedIncomeReportQuery } from '@api-queries/report/Query'
import { formatDate } from '@utils/helper'

const IncomeTable = ({ tableParams, setTableParams }) => {
  const { data, isFetching } = useConsolidatedIncomeReportQuery(tableParams)

  const columns = [
    {
      accessorKey: 'type',
      header: 'Type'
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
        pagination={data?.total_count}
        paginationVisibile={true}
        search={false}
        loading={isFetching}
        tableParams={tableParams}
        setTableParams={setTableParams}
      />
    </div>
  )
}

export default IncomeTable
