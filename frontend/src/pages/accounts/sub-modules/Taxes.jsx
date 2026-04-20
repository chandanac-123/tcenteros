import { DataTable } from '@common/components/DataTable'
import { useAllTaxesQuery } from '@api-queries/center-admin/accounts/Query'
import { useState } from 'react'

const Taxes = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllTaxesQuery(tableParams)

  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'tax_type', header: 'Tax Type' },
    { accessorKey: 'tax_rate', header: 'Tax Rate' },
    { accessorKey: 'tax_amount', header: 'Tax Amount' },
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

export default Taxes
