import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { Badge } from '@pages/components/ui/badge'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'
import { useDeleteEmployeeMutation } from '@api-queries/employee-management/Query'
import Card from './components/Cards'
import { memberType } from '@constants/members'

const Members = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3,
    search: ''
  })
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

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member  Name'
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={
              row.original.status == 'active'
                ? 'Active Member'
                : 'Inactive Member'
            }
            variant={
              row.original.status == 'Active Member' ? 'active' : 'inactive'
            }
          />
        </span>
      )
    },
    {
      header: 'Action',
      accessorKey: '',
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
      <div className='flex flex-wrap gap-4 mb-6'>
        {memberType?.map(member => (
          <Card key={member.id} label={member.name} />
        ))}
      </div>

      <DataTable
        title='Products'
        subTitle='Products'
        columns={columns}
        data={[]}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
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

export default Members
