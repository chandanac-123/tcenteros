import { DataTable } from '@common/DataTable'
import { useEffect, useState } from 'react'
import { useAllEmployeesAttendanceQuery } from '@api-queries/attendance/Query'

const EmployeeAttendance = ({ categoryId }) => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data: employees, isLoading: isEmployeesLoading } =
    useAllEmployeesAttendanceQuery(tableParams, categoryId)

  useEffect(() => {
    setTableParams(prev => ({ ...prev, page: 1 }))
  }, [categoryId])

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member  Name'
    },
    {
      accessorKey: 'date',
      header: 'Date'
    },

    {
      accessorKey: 'designation',
      header: 'Designation'
    },
    {
      accessorKey: 'check_in_time',
      header: 'Check In Time'
    },
    {
      accessorKey: 'check_out_time',
      header: 'Check Out Time '
    },
    {
      accessorKey: 'duration',
      header: 'Duration'
    }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={employees?.attendance || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={employees}
        loading={isEmployeesLoading}
        paginationVisibile={true}
      />
    </>
  )
}
export default EmployeeAttendance
