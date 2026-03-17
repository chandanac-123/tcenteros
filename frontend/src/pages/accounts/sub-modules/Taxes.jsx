import { DataTable } from "@common/components/DataTable"
import { useAllTaxesQuery } from "@api-queries/accounts/Query"
import { useState } from "react"

const Taxes = () => {
    const [tableParams, setTableParams] = useState({
      page: 1,
      search: ''
    })
   const { data, isLoading, isError } = useAllTaxesQuery(tableParams)

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'GST Collected'
    },
    {
      accessorKey: 'designation_name',
      header: 'GST Paid'
    },
    {
      accessorKey: 'email',
      header: 'GST Payable'
    },
    {
      accessorKey: 'mobile',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'center_name',
      header: 'Tax Period Reports'
    },
    {
      accessorKey: 'center_name',
      header: 'Action'
    }
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
