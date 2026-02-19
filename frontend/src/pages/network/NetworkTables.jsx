import React from 'react'
import { DataTable } from '@common/DataTable'

const NetworkTables = ({ activeTab  }) => {

  console.log("Pararra",activeTab );
  
      const columns = [
    {
      accessorKey: 'full_name',
      header: 'Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Home  Center '
    },
    {
      accessorKey: 'email',
      header: 'Center Number'
    },
    {
      accessorKey: 'mobile',
      header: 'Start Date'
    },
    {
      accessorKey: 'center_name',
      header: 'End Date'
    },
    {
      accessorKey: 'joining_date',
      header: 'Action'
    },
   
  ]
  return (
        <DataTable
           columns={columns}
           paginationVisibile={true}
         />
  )
}

export default NetworkTables
