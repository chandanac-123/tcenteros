import { DataTable } from '@common/DataTable'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'

const EmployeeAttendance = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3,
    search: ''
  })
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member  Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Date'
    },

    {
      accessorKey: 'designation_name',
      header: 'Designation'
    },
    {
      accessorKey: 'email',
      header: 'Check In Time'
    },
    {
      accessorKey: 'mobile',
      header: 'Check Out Time '
    },
    {
      accessorKey: 'center_name',
      header: 'Duration'
    },
    {
      header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <button
            onClick={() => {
              setViewId(row.original.id)
              setViewOpen(true)
            }}
          >
            <img src={view} alt='view' />
          </button>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' />
          </button>
          <Switch />
        </span>
      )
    }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={[]}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
      {/*   
          <ViewForm id={viewId} open={viewopen} setOpen={setViewOpen} />
          // <DeleteModal
          //   open={deleteOpen}
          //   setOpen={setDeleteOpen}
          //   header='Delete Employee'
          //   description='Are you sure you want to delete this employee?'
          //   onConfirm={handleDelete}
          // /> */}
    </>
  )
}
export default EmployeeAttendance
