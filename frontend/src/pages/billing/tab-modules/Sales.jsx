import { DataTable } from '@common/components/DataTable'
import CustomFilter from '@common/components/CustomeFilter'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'

const Sales = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Customer Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Invoice'
    },
    {
      accessorKey: 'email',
      header: 'Type'
    },
    {
      accessorKey: 'mobile',
      header: 'Source'
    },
    {
      accessorKey: 'center_name',
      header: 'Join Date'
    },
    {
      accessorKey: 'center_name',
      header: 'Amount'
    },
    {
      accessorKey: 'center_name',
      header: 'Payment'
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
            <img src={deleteicon} alt='delete'className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]
  return (
    <div>
      <div className='w-full flex justify-between mb-4'>
        <span className='font-semibold text-lg'>Sale Listing</span>
        <div className='flex gap-1'>
          <CustomFilter filterName='Status' />
          <CustomFilter filterName='Type' />
          <CustomFilter filterName='Payment Mode' />
        </div>
      </div>
      <DataTable columns={columns} data={[]} />
    </div>
  )
}
export default Sales
