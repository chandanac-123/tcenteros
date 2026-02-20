import { DataTable } from '@common/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'
import {
  useAllMemberAttendanceQuery,
  useDeleteAttendanceMutation
} from '@api-queries/attendance/Query'

const MemberAttendance = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  })
  const { data: members, isLoading: isMembersLoading } =
    useAllMemberAttendanceQuery()
  const { mutate: deleteAttendance } = useDeleteAttendanceMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

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
    },
    {
      header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' />
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
      console.error('Delete failed:', error)
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={members?.attendance || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={members}
        loading={isMembersLoading}
        paginationVisibile={true}
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
export default MemberAttendance
