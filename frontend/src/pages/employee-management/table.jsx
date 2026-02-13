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
import { useDeleteEmployeeMutation } from '@api-queries/employee-management/Query'

const EmployeeTable = ({ data, tableParams, setTableParams }) => {
  const [viewopen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editopen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [viewId, setViewId] = useState(null)
  const { mutate: deleteEmployee } = useDeleteEmployeeMutation(deleteId)

  const handleDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    }
  }

   const statusVariantMap = {
    active: 'active',
    inactive: 'inactive',
  }

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Designation'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'mobile',
      header: 'Phone Number'
    },
    {
      accessorKey: 'center_name',
      header: 'Center'
    },
    {
      accessorKey: 'joining_date',
      header: 'Join Date'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
         <Badge
            label={row.original.status.replace('_', ' ').toUpperCase()}
            variant={statusVariantMap[row.original.status] || 'inactive'}
          />
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
              setEditId(row.original.id)
              setEditOpen(true)
            }}
          >
            <img src={edit} alt='edit' />
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
        title='Products'
        subTitle='Products'
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
      <AddEditForm
        id={editId}
        open={editopen}
        setOpen={setEditOpen}
        closeModal={() => setEditOpen(false)}
      />
      <ViewForm id={viewId} open={viewopen} setOpen={setViewOpen} />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Employee'
        description='Are you sure you want to delete this employee?'
        onConfirm={handleDelete}
      />
    </>
  )
}
export default EmployeeTable
