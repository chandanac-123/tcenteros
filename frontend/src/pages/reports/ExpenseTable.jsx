import { DataTable } from "@common/components/DataTable"

const ExpenseTable = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member  Name'
    },
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'check_in_time',
      header: 'Check In Time',
    },
    {
      accessorKey: 'check_out_time',
      header: 'Check Out Time ',
    },
    {
      accessorKey: 'duration',
      header: 'Duration'
    },
    {
      header: 'Actions',
      accessorKey: 'status',
    //   cell: ({ row }) => (
    //     <span className='flex gap-3'>
    //       <button
    //         onClick={() => {
    //           setDeleteId(row.original.id)
    //           setDeleteOpen(true)
    //         }}
    //       >
    //         <img src={deleteicon} alt='delete' />
    //       </button>
    //     </span>
    //   )
    }
  ]
  return (
    <div>
      <DataTable columns={columns} data={[]} paginationVisibile={true} search={false}/>
    </div>
  )
}

export default ExpenseTable
