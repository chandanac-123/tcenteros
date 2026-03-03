import React from 'react'
import { DataTable } from '@common/DataTable'

const SalaryStructureTable = ({
  pagination,
  data,
  setTableParams,
  tableParams
}) => {
  const columns = [
    {
      accessorKey: 'designation_name',
      header: 'Designation'
    },
    {
      accessorKey: 'email',
      header: 'Salary Type'
    },
    {
      accessorKey: 'mobile',
      header: 'Pay Cycle'
    },
    {
      accessorKey: 'joining_date',
      header: 'Basic Salary'
    },
     {
      accessorKey: 'joining_date',
      header: 'Action'
    }
  ]

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={pagination}
        paginationVisibile={true}
      />
    </div>
  )
}

export default SalaryStructureTable
