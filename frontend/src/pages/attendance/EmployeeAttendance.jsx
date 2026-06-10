import { DataTable } from '@common/components/DataTable'
import { useEffect, useState } from 'react'
import deleteicon from '@assets/form-icons/delete.svg'
import {
  useAllEmployeesAttendanceQuery,
  useDeleteAttendanceMutation
} from '@api-queries/center-admin/attendance/Query'
import DeleteModal from '@common/components/CustomeDelete'
import { formatTo12Hour } from '@utils/helper'

const EmployeeAttendance = ({ categoryId, dateRange }) => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: '',
    categoryId: null,
    from: null,
    to: null
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

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
  const { mutate: deleteAttendance } = useDeleteAttendanceMutation()

  const columns = [
    { accessorKey: 'full_name', header: 'Member  Name' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'designation', header: 'Designation' },
    {accessorKey: 'check_in_time', header: 'Check In Time',
      cell: ({ row }) => formatTo12Hour(row.original.check_in_time)
    },
    { accessorKey: 'check_out_time',
      header: 'Check Out Time ',
      cell: ({ row }) => formatTo12Hour(row.original.check_out_time)
    },
    { accessorKey: 'duration', header: 'Duration' },
    {header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' loading="lazy"/>
          </button>
        </span>
      )
    }
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteAttendance(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={employees?.attendance || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={employees?.total}
        loading={isEmployeesLoading}
        paginationVisibile={true}
        search={false}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Attendance Record'
        description='Are you sure you want to delete this attendance record?'
        onConfirm={handleDelete}
      />
    </>
  )
}
export default EmployeeAttendance
