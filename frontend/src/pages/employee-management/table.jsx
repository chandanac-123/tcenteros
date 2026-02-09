import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { Badge } from '@pages/components/ui/badge'
import { useState } from 'react'
import AddEditForm from './AddEditForm'
import ViewForm from './View'
import DeleteModal from '@common/CustomeDelete'

const EmployeeTable = ({
  data,
  pagination,
  tableParams,
  setTableParams,
  open,
  setOpen,
  handleOpen
}) => {
  const [viewopen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const columns = [
    {
      accessorKey: 'firstName',
      header: 'First Name'
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name'
    },
    {
      accessorKey: 'designation',
      header: 'Designation'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number'
    },
    {
      accessorKey: 'center',
      header: 'Center'
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge label={row.original.status} variant={row.original.status=='Active Member' ? 'active' : 'inactive'} />
          <button onClick={() => setViewOpen(true)}>
            <img src={view} alt='view' />
          </button>
          <button onClick={handleOpen}>
            <img src={edit} alt='edit' />
          </button>
          <button onClick={() => setDeleteOpen(true)}>
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
        title='Products'
        subTitle='Products'
        total={pagination?.totalCount}
        columns={columns}
        data={data}
        pagination={pagination}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
      <AddEditForm id={1} open={open} setOpen={setOpen} closeModal={() => setOpen(false)} />
      <ViewForm open={viewopen} setOpen={setViewOpen} />
      <DeleteModal open={deleteOpen} setOpen={setDeleteOpen} header="Delete Employee" description="Are you sure you want to delete this employee?" />
    </>
  )
}
export default EmployeeTable
