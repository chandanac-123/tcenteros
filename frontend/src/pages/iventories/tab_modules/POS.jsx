import React, { useState } from 'react'
import { DataTable } from '@common/components/DataTable'
import view from '@assets/form-icons/view.svg'
import { useSalesQuery } from '@api-queries/center-admin/billing/Query'
import ViewForm from '../components/View'

const POS = () => {
  const [tableParams, setTableParams] = useState({
    page: 1
  })
  const { data, isFetching } = useSalesQuery(tableParams)
  const [viewopen, setViewOpen] = useState(false)
  const [viewId, setViewId] = useState(null)

  const columns = [
    {
      accessorKey: 'sale_number',
      header: 'Sale Number'
    },
    {
      accessorKey: 'created_at',
      header: 'Sale Date',
      cell: ({ row }) => {
        const date = row.original.created_at
        return <span>{date?.split('T')[0]}</span>
      }
    },
    {
      accessorKey: 'product_name',
      header: 'Sale Products',
      cell: ({ row }) => {
        return (
          <span className='flex flex-col'>
            {row?.original?.items.map(item => item.product_name).join(', ')}
          </span>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Sale Status'
    },
    {
      accessorKey: 'total',
      header: 'Total Amount'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={() => {
              setViewId(row.original.sale_id)
              setViewOpen(true)
            }}
          >
            <img src={view} alt='view' loading="lazy" className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className='flex flex-col gap-4'>
        <h1 className='text-lg font-semibold'>POS</h1>
      <div className=''>
        <DataTable
          columns={columns}
          data={data?.sales || []}
          setTableParams={setTableParams}
          tableParams={tableParams}
          pagination={data?.total}
          search={false}
          paginationVisibile={true}
        />
      </div>
      <ViewForm id={viewId} open={viewopen} setOpen={setViewOpen} />
    </div>
  )
}

export default POS
