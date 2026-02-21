import { DataTable } from '@common/DataTable'
import { useEffect, useState } from 'react'
import { useAllEmployeesAttendanceQuery } from '@api-queries/attendance/Query'

const EmployeeAttendance = ({ categoryId, dateRange }) => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: '',
    categoryId: null,
    from: null,
    to: null
  })

  useEffect(() => {
    setTableParams(prev => ({
      ...prev,
      categoryId,
      page: 1
    }))
  }, [categoryId])

  useEffect(() => {
    setTableParams(prev => ({
      ...prev,
      from: dateRange?.from,
      to: dateRange?.to,
      page: 1
    }))
  }, [dateRange])

  const { data: employees, isLoading: isEmployeesLoading } =
    useAllEmployeesAttendanceQuery(tableParams)

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
