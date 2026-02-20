import { DataTable } from '@common/DataTable'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'
import { useAllEmployeesAttendanceQuery } from '@api-queries/attendance/Query'

const EmployeeAttendance = ({categoryId}) => {
  console.log('categoryId: ', categoryId);
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    search: ''
  })
  const { data: employees, isLoading: isEmployeesLoading } =
    useAllEmployeesAttendanceQuery(tableParams, categoryId)
  

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
        paginationVisibile={true}
      />
    </>
  )
}
export default EmployeeAttendance
