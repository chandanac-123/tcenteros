import { DataTable } from '@common/components/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'
import { useState } from 'react'
import RenewMembership from '../component/RenewMembership'
const data = [
  {
    full_name: 'Arjun Nair',
    plan_name: 'Gold Plan',
    expiry_date: '15 Mar 2026',
    renewal_due: '₹1,500',
    amount: '₹1,500',
    status: 'Active',
    actions: 'View'
  }
]
const Memberships = () => {
  const [renewOpen, setRenewOpen] = useState(false)

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Plan'
    },
    {
      accessorKey: 'email',
      header: 'Expiry Date'
    },
    {
      accessorKey: 'mobile',
      header: 'Renewal Due'
    },
    {
      accessorKey: 'center_name',
      header: 'Amount'
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
          <button
            className='border-2 border-primary rounded-md px-4 py-1 text-primary'
            onClick={() => setRenewOpen(true)}
          >
            Renew
          </button>
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
    <div className='gap-4 flex flex-col'>
      <span className='font-semibold text-lg'>Membership Listing</span>
      <DataTable columns={columns} data={data} />
      <RenewMembership open={renewOpen} setOpen={setRenewOpen} />
    </div>
  )
}
export default Memberships
