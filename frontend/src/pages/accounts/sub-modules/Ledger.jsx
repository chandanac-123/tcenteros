import { DataTable } from '@common/components/DataTable'
import { useAllLedgerQuery } from '@api-queries/center-admin/accounts/Query'
import { useState } from 'react'

const Ledger = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllLedgerQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'account_name', header: 'Accounts Name' },
    { accessorKey: 'account_type', header: 'Account Type' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'credit', header: 'Credit' },
    { accessorKey: 'debit', header: 'Debit' },
    { accessorKey: 'balance', header: 'Balance' },
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
