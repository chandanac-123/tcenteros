import { DataTable } from '@common/components/DataTable'
import { useAllLedgerQuery } from '@api-queries/accounts/Query'
import { useState } from 'react'

const Ledger = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllLedgerQuery(tableParams)
  const columns = [
    { accessorKey: 'account_code', header: 'Account Code' },
    { accessorKey: 'account_name', header: 'Accounts Name' },
    { accessorKey: 'account_type', header: 'Account Type' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'date', header: 'Payroll Date' },
    { accessorKey: 'credit', header: 'Credit' },
    { accessorKey: 'debit', header: 'Debit' },
    { accessorKey: 'balance', header: 'Balance' },
    { accessorKey: 'entry_number', header: 'Entry Number' },
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

export default Ledger
