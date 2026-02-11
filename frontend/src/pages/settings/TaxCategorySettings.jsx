import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { DataTable } from '@common/DataTable'
import { useState } from 'react'
import { Switch } from '@radix-ui/react-switch'
import { Button } from '@pages/components/ui/button'
import { tax_type } from '@constants/taxType'
import { tax_scope } from '@constants/taxScope'


const TaxCategorySettings = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3
  })

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Tax Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Tax Type'
    },
    {
      accessorKey: 'email',
      header: 'Tax Rate'
    },
    {
      header: 'Status',
      accessorKey: 'status',
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
    },
    {
      accessorKey: 'mobile',
      header: 'Actions'
    }
  ]

  return (
    <div className='py-4 gap-4 flex flex-col'>
      <form className='space-y-2'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Tax Category Name'
              name='full_name'
              placeholder='Enter Your Full Name'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Tax Rate (Percentage)'
              name='email'
              placeholder='Enter Your Email ID'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Tax Type'
              name='full_name'
              options={tax_type}
              placeholder='Enter Your Full Name'
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Tax Scope'
              name='email'
              options={tax_scope}
              placeholder='Enter Your Email ID'
            />
          </div>
        </div>
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            + Create Tax Category
          </Button>
        </div>
      </form>
      <span className='font-semibold'>Existing Tax Categories</span>
      <DataTable
        title='Products'
        subTitle='Products'
        columns={columns}
        data={[]}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </div>
  )
}

export default TaxCategorySettings
