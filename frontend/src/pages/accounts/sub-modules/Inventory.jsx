import { DataTable } from '@common/components/DataTable'
import { useAllInventoryQuery } from '@api-queries/accounts/Query'
import { useState } from 'react'

const Inventory = () => {
   const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllInventoryQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },

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

export default Inventory
