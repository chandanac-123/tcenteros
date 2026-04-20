import { DataTable } from '@common/components/DataTable'
import { useAllIncomeQuery } from '@api-queries/center-admin/accounts/Query'
import { useState } from 'react'

const Income = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllIncomeQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'income_type', header: 'Income Type' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'tax_amount', header: 'Tax Amount' },
    { accessorKey: 'total_amount', header: 'Total Amount' },
    { accessorKey: 'description', header: 'Description' }
  ]
  return (
    <>
      <DataTable
        columns={columns}
        data={data?.entries || []}
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

export default Income
