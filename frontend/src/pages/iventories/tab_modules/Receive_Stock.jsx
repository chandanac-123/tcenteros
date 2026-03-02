import React, { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import AddProductModal from '../components/AddProductModal'
import AddStockEntry from '../components/AddStockEntry'



const Receive_Stock = () => {
  const [open, setOpen] = useState(false);
  const [openStockEntry,setOpenStockEntry] = useState(false)


  const columns = [
    {
      accessorKey: 'product_name',
      header: 'Product Name'
    },
    {
      accessorKey: 'invoice_name',
      header: 'Invoice Name'
    },
    {
      accessorKey: 'invoice_date',
      header: 'Invoice Date'
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity'
    },
    {
      accessorKey: 'cost_price',
      header: 'Cost Price'
    },
    {
      accessorKey: 'purchase_cost',
      header: 'Purchase Cost'
    },
    {
      accessorKey: 'total_cost',
      header: 'Total Cost'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button
          >
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
          <button

          >
            <img src={edit} alt='edit' className='w-6 h-6' />
          </button>
          <button

          >
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
        </div>
      )
    }

  ]

  const dummyProducts = [
    {
      product_name: "Wireless Mouse",
      invoice_name: "INV-1001",
      invoice_date: "2026-02-10",
      quantity: 25,
      cost_price: 450,
      purchase_cost: 11250,
      total_cost: 11812.5,
    },
    {
      product_name: "Mechanical Keyboard",
      invoice_name: "INV-1002",
      invoice_date: "2026-02-11",
      quantity: 15,
      cost_price: 2200,
      purchase_cost: 33000,
      total_cost: 34650,
    },
    {
      product_name: "USB-C Hub",
      invoice_name: "INV-1003",
      invoice_date: "2026-02-12",
      quantity: 30,
      cost_price: 800,
      purchase_cost: 24000,
      total_cost: 25200,
    },
    {
      product_name: "27\" Monitor",
      invoice_name: "INV-1004",
      invoice_date: "2026-02-14",
      quantity: 8,
      cost_price: 14500,
      purchase_cost: 116000,
      total_cost: 121800,
    },
    {
      product_name: "Laptop Stand",
      invoice_name: "INV-1005",
      invoice_date: "2026-02-15",
      quantity: 20,
      cost_price: 950,
      purchase_cost: 19000,
      total_cost: 19950,
    }
  ];

  return (
    <div>
      <div className="flex justify-between px-4 py-2 items-center">
        <h1 className="text-xl font-medium">Receive Stock</h1>
        <div className="flex gap-3">
          <Button size='addbutton' type='submit' variant="outline_secondary" onClick={()=>setOpenStockEntry(true)}>
            Stock Entry
          </Button>
          <AddStockEntry  openStockEntry={openStockEntry} setOpenStockEntry={setOpenStockEntry}/>
          <Button size='addbutton' type='submit' onClick={()=>setOpen(true)}>
            + Add Product
          </Button>
          <AddProductModal open={open} setOpen={setOpen}/>
        </div>


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

export default Receive_Stock
