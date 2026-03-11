import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { Badge } from '@pages/components/ui/badge'
import { useEffect, useState } from 'react'
import AddEditForm from './AddEditForm'
import ViewForm from './View'
import DeleteModal from '@common/CustomeDelete'
import {
  useDeleteEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useDeleteMultipleEmployeeMutation
} from '@api-queries/employee-management/Query'
import useTableSelection from '@common/UseTableSelection'

const EmployeeTable = ({ data, tableParams, setTableParams, pagination }) => {
  const { selectedIds, selectionColumn, setSelectedIds } =
    useTableSelection(data)

  const [viewopen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editopen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [viewId, setViewId] = useState(null)
  const { mutateAsync: deleteEmployee } = useDeleteEmployeeMutation()
  const { mutate: updateEmployeeStatus, isPending: isStatusUpdating } =
    useUpdateEmployeeStatusMutation()
  const { mutateAsync: deleteMultipleEmployees } =
    useDeleteMultipleEmployeeMutation()

  useEffect(() => {
    if (data) {
      setSelectedIds([])
    }
  }, [data])

  const handleDelete = async () => {
    try {
      // MULTIPLE DELETE
      if (selectedIds.length > 0) {
        await deleteMultipleEmployees({
          employee_ids: selectedIds // confirm this matches backend
        })
        setSelectedIds([]) // clear checkbox selection
      }
      // SINGLE DELETE
      else if (deleteId) {
        await deleteEmployee(deleteId)
      }
      // Reset modal & id
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleStatusChange = async (value, id) => {
    const newStatus = value ? 'active' : 'inactive'
    try {
      await updateEmployeeStatus({
        id: id,
        data: { status: newStatus }
      })
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  const statusVariantMap = {
    active: 'active',
    inactive: 'inactive'
  }

  const columns = [
    selectionColumn,
    { accessorKey: 'full_name', header: 'Full Name' },
    { accessorKey: 'designation_name', header: 'Designation' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Phone Number' },
    { accessorKey: 'joining_date', header: 'Join Date' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge
          label={row.original.status.replace('_', ' ').toUpperCase()}
          variant={statusVariantMap[row.original.status] || 'inactive'}
        />
      )
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={() => {
              setViewId(row.original.id)
              setViewOpen(true)
            }}
          >
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
          <button
            onClick={() => {
              setEditId(row.original.id)
              setEditOpen(true)
            }}
          >
            <img src={edit} alt='edit' className='w-6 h-6' />
          </button>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
          <Switch
            checked={row.original.status === 'active'}
            disabled={isStatusUpdating}
            onCheckedChange={value =>
              handleStatusChange(value, row.original.id)
            }
          />
        </div>
      )
    }
  ]

  return (
    <>
      {selectedIds.length > 0 && (
        <div className='mb-2'>
          <button
            className='bg-red_text text-white px-3 py-1 rounded'
            onClick={() => setDeleteOpen(true)}
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={pagination}
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
        description={
          selectedIds.length > 0
            ? `Are you sure you want to delete ${selectedIds.length} employees?`
            : 'Are you sure you want to delete this employee?'
        }
        onConfirm={handleDelete}
      />
    </>
  )
}
export default EmployeeTable
