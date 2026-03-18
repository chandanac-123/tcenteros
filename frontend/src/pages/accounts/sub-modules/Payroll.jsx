import { DataTable } from '@common/components/DataTable'
import { useAllPayrollQuery } from '@api-queries/accounts/Query'
import { useState } from 'react'

const Payroll = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isLoading, isError } = useAllPayrollQuery(tableParams)
  const columns = [
    { accessorKey: 'entry_number', header: 'Entry Number' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'employee_name', header: 'Employee Name' },
    { accessorKey: 'gross_salary', header: 'Gross Salary' },
    { accessorKey: 'net_salary', header: 'Net Salary' },
    { accessorKey: 'status', header: 'Status' },
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

export default Payroll
