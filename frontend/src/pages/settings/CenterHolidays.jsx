import { useState } from 'react'
import CustomDatePicker from '@common/CustomeDatepicker'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import deleteicon from '@assets/form-icons/delete.svg'
import { DataTable } from '@common/DataTable'

const CenterHolidays = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3
  })

  const columns = [
    {
      accessorKey: 'name',
      header: 'Holiday name'
    },
    {
      accessorKey: 'tax_type',
      header: 'Start date'
    },
    {
      accessorKey: 'tax_percentage',
      header: 'End date'
    },
    {
      header: 'Day',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' />
          </button>
        </span>
      )
    },
    {
      accessorKey: 'tax_scope',
      header: 'Actions'
    }
  ]

  return (
    <div className='flex flex-col gap-6 py-2'>
      <span className='text-lg font-semibold'>Add New Holiday</span>

      <form className='space-y-4' id='center-timing'>
        <Input label='Holiday Name' />

        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomDatePicker label='Start Date' />
          </div>
          <div className='flex-1'>
            <CustomDatePicker label='End Date' />
          </div>
        </div>

        <div className='flex justify-end items-center'>
          <Button
            id='center-timing'
            size='addbutton'
            variant='default'
            type='submit'
          >
            Add Holiday
          </Button>
        </div>
      </form>
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

export default CenterHolidays
