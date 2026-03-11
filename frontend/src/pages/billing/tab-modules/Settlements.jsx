import { DataTable } from '@common/components/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'

const Settlements = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Time Period'
    },
    {
      accessorKey: 'designation_name',
      header: 'Incoming'
    },
    {
      accessorKey: 'email',
      header: 'Outgoing'
    },
    {
      accessorKey: 'mobile',
      header: 'Platform Fee'
    },
    {
      accessorKey: 'center_name',
      header: 'Net'
    },
    {
      accessorKey: 'center_name',
      header: 'Status'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex gap-3'>
          <button>
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
          <button>
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]
  return (
    <div className='gap-4'>
      <span className='font-semibold text-lg'>Settlements Listing</span>
      <DataTable columns={columns} data={[]} />
    </div>
  )
}
export default Settlements
