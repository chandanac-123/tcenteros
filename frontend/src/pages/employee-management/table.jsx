import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { Badge } from '@pages/components/ui/badge'
import CustomeModal from '@common/CustomeModal'
import { useState } from 'react'
import AddEditForm from './AddEditForm'
import ViewForm from './View'

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

  const columns = [
    {
      accessorKey: 'status',
      header: 'First Name'
    },
    {
      accessorKey: 'email',
      header: 'Last Name'
    },
    {
      accessorKey: 'amount',
      header: 'Designation'
    },
    {
      accessorKey: 'amount',
      header: 'Email'
    },
    {
      accessorKey: 'amount',
      header: 'Phone number'
    },
    {
      accessorKey: 'amount',
      header: 'Center'
    },
    {
      accessorKey: 'amount',
      header: 'Join Date'
    },
    {
      header: 'STATUS',
      accessorKey: '',
      cell: () => (
        <span className='flex gap-3'>
          <Badge label='Active Member' variant='active' />
          <button onClick={() => setViewOpen(true)}>
            <img src={view} alt='view' />
          </button>
          <button onClick={handleOpen}>
            <img src={edit} alt='edit' />
          </button>
          <button>
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
    </>
  )
}
export default EmployeeTable
