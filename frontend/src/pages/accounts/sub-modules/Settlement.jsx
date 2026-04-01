import { DataTable } from '@common/components/DataTable'
import { useAllSettlementsQuery } from '@api-queries/accounts/Query'
import { useState } from 'react'

const Settlement = () => {
   const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllSettlementsQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'total_credit', header: 'Total Credit' },
    { accessorKey: 'total_debit', header: 'Total Debit' },
    { accessorKey: 'description', header: 'Description' }
  ]
  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        loading={isLoading}
        pagination={data?.total}
        paginationVisibile={true}
        search={true}
      />
    </>
  )
}

export default Settlement
