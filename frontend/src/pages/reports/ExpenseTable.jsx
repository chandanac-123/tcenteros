import { DataTable } from '@common/components/DataTable'
import { useConsolidatedExpensesReportQuery } from '@api-queries/report/Query'

const ExpenseTable = ({ tableParams, setTableParams }) => {
  const { data, isFetching } = useConsolidatedExpensesReportQuery()
  console.log('data: ', data)
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member  Name'
    },
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'check_in_time',
      header: 'Check In Time'
    },
    {
      accessorKey: 'check_out_time',
      header: 'Check Out Time '
    },
    {
      accessorKey: 'duration',
      header: 'Duration'
    },
   
  ]
  return (
    <div>
      <DataTable
        columns={columns}
        data={[]}
        paginationVisibile={true}
        search={false}
        tableParams={tableParams}
        setTableParams={setTableParams}
      />
    </div>
  )
}

export default ExpenseTable
