import { DataTable } from '@common/components/DataTable'
import { useAllExpensesQuery } from '@api-queries/accounts/Query'
import { useState } from 'react'

const Expense = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllExpensesQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'expense_type', header: 'Expense Type' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'source', header: 'Source' },
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

export default Expense
