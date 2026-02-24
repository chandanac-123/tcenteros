import { DataTable } from '@common/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'

const IncomingNetwork = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Home Center'
    },
    {
      accessorKey: 'email',
      header: 'Visit Date'
    },
    {
      accessorKey: 'mobile',
      header: 'Charge'
    },
    {
      accessorKey: 'center_name',
      header: 'Fee(15%)'
    },
    {
      accessorKey: 'center_name',
      header: 'Earn'
    },
    {
      accessorKey: 'center_name',
      header: 'Status'
    },
    {
      header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <div className='flex gap-3'>
          <button>
            <img src={view} alt='view' />
          </button>
          <button>
            <img src={deleteicon} alt='delete' />
          </button>
        </div>
      )
    }
  ]
  return (
    <>
      <DataTable columns={columns} data={[]} />
    </>
  )
}
export default IncomingNetwork
