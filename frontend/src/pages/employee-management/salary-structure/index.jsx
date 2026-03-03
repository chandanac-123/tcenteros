import React, { useState } from 'react'
import SalaryStructureTable from './Table'

const SalaryStructure = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  return (
    <div>
      <SalaryStructureTable
        data={[]}
        tableParams={tableParams}
        setTableParams={setTableParams}
        pagination={1}
      />
    </div>
  )
}

export default SalaryStructure
