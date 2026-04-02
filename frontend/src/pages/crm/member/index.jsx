import { DataTable } from '@common/components/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { Badge } from '@pages/components/ui/badge'
import { useState } from 'react'
import DeleteModal from '@common/components/CustomeDelete'
import { memberType } from '@constants/members'
import Card from '../components/Cards'
import {
  useMembersQuery,
  useMembersCountQuery,
  useDeleteMemberMutation,
  useUpdateMemberStatusMutation
} from '@api-queries/crm/Query'
const statusVariantMap = { active: 'active', inactive: 'inactive' }
const paymentVariantMap = { paid: 'future_lead', null: 'inactive' }

const Members = ({ onView, onEdit }) => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isFetching } = useMembersQuery(tableParams)
  const { data: memberCountData, isFetching: isMemberCountFetching } =
    useMembersCountQuery()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const { mutate: deleteMember } = useDeleteMemberMutation(deleteId)
  const { mutate: updateStatus } = useUpdateMemberStatusMutation()

  const handleDelete = () => {
    if (deleteId) {
      deleteMember(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateStatus({ id, status })
    } catch (error) {
      console.error('Failed to update status', error)
    }
  }

  const columns = [
    { accessorKey: 'full_name', header: 'Member  Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Phone Number' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={row.original.status.replace('_', ' ').toUpperCase()}
            variant={statusVariantMap[row.original.status] || 'inactive'}
          />
        </span>
      )
    },
    {
      accessorKey: 'payment_status',
      header: 'Payment Status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={
              row.original.payment_status == null
                ? 'UNPAID'
                : row.original.payment_status.toUpperCase()
            }
            variant={
              paymentVariantMap[row.original.payment_status] || 'inactive'
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
          <button onClick={() => onView(row.original.id)}>
            <img src={view} alt='view' />
          </button>
          <button onClick={() => onEdit(row.original.id)}>
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
          <Switch
            checked={row.original.status === 'active'}
            onCheckedChange={checked => {
              handleStatusUpdate(
                row.original.id,
                checked ? 'active' : 'inactive'
              )
            }}
          />
        </span>
      )
    }
  ]

  return (
    <>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6'>
        {memberType?.map(member => (
          <Card
            key={member.id}
            label={member.name}
            value={memberCountData?.[member.key] || 0}
          />
        ))}
      </div>

      <DataTable
        loading={isFetching}
        columns={columns}
        data={data?.members}
        pagination={data?.total}
        search={false}
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
