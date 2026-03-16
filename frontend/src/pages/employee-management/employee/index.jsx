import { useState } from 'react'
import { useEmployeeQuery } from '@api-queries/employee-management/Query'
import MultiColorProgressBar from '@common/components/MulticolorProgressBar'
import EmployeeTable from './table'

const Employee = ({ tableParams, setTableParams }) => {
  // const [tableParams, setTableParams] = useState({
  //   page: 1,
  //   search: ''
  // })
  const { data, isFetching } = useEmployeeQuery(tableParams)

  return (
    <div>
      <div className='gap-2 flex items-center'>
        <span className='font-semibold text-3xl'>{data?.total_count}</span>
        <span className='text-textgrey'>Total Employees</span>
      </div>
      <div>
        <MultiColorProgressBar data={data?.employee_counts} />
      </div>
      <EmployeeTable
        data={data?.employees || []}
        tableParams={tableParams}
        pagination={data?.total_count}
        loading={isFetching}
        setTableParams={setTableParams}
      />
    </div>
  )
}
export default Employee
