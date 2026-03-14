import { DataTable } from '@common/components/DataTable'
import { useConsolidatedSettlementsReportQuery } from '@api-queries/report/Query'

const SettlementTable = ({ tableParams, setTableParams }) => {
  const { data, isFetching } = useConsolidatedSettlementsReportQuery()

  const columns = [
    {
      accessorKey: 'center_name',
      header: 'Center Name'
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
      accessorKey: 'total_income',
      header: 'Total Income'
    }
  ]
  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.by_center || []}
        paginationVisibile={true}
        search={false}
        tableParams={tableParams}
        setTableParams={setTableParams}
      />
    </div>
  )
}

export default SettlementTable
