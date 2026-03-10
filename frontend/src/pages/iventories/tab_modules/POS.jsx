import React from 'react'
import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { useAllSalesQuery } from '@api-queries/billing/Query'


const POS = () => {
    const { data, isFetching } = useAllSalesQuery()
  console.log('data: ', data);
  const columns = [
    {
      accessorKey: 'product_name',
      header: 'Product Name'
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock Quantity'
    },
    {
      accessorKey: 'Price',
      header: 'price'
    },
    {
      header: 'Add',
      cell: () => (
        <button className="px-6 py-[2px] rounded-full border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 transition">
          Add
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button >
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
          <button  >
            <img src={edit} alt='edit' className='w-6 h-6' />
          </button>
          <button  >
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
          <Switch />
        </div>
      )
    }

  ]

  const dummyProducts = [
    {
      product_name: "Wireless Mouse",
      stock_quantity: 120,
      Price: 599,
    },
    {
      product_name: "Mechanical Keyboard",
      stock_quantity: 45,
      Price: 2499,
    },
    {
      product_name: "USB-C Hub",
      stock_quantity: 75,
      Price: 899,
    },
    {
      product_name: "27\" Monitor",
      stock_quantity: 16,
      Price: 14999,
    },
    {
      product_name: "Laptop Stand",
      stock_quantity: 58,
      Price: 1099,
    }
  ];

  return (
    <div>
      <div className="">
        <h1 className="text-xl font-medium py-4">POS</h1>
      </div>
      <div className="">
        <DataTable
          columns={columns}
          data={dummyProducts}
          pagination={31}
          paginationVisibile={true}
        />
      </div>
    </div>
  )
}

export default POS
