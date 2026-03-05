import React, { useState } from 'react'
import SalaryStructureTable from './Table'
import { useAllSalariesQuery } from '@api-queries/employee-salary/Query'

const SalaryStructure = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data: salaryData, isLoading } = useAllSalariesQuery(tableParams)
  return (
    <div>
      <SalaryStructureTable
        data={salaryData?.employees || []}
        tableParams={tableParams}
        setTableParams={setTableParams}
        pagination={1}
      />
    </div>
  )
}

export default SalaryStructure
