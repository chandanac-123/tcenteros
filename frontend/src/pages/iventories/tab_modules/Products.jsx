import React, { useState } from 'react'
import filters from '@assets/form-icons/filter.svg'
import { DataTable } from '@common/DataTable'
import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import FilterModal from '../components/FilterModal'


const Products = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    page_size: 10,
    search: ''
  });
  const [openFilter, setOpenFilter] = useState(false);

  const columns = [
    {
      accessorKey: 'product_name',
      header: 'Product Name'
    },
    {
      accessorKey: 'category',
      header: 'Category'
    },
    {
      accessorKey: 'sku',
      header: 'SKU'
    },
    {
      accessorKey: 'current_stock',
      header: 'Current Stock'
    },
    {
      accessorKey: 'cost_price',
      header: 'Cost Price'
    },
    {
      accessorKey: 'sell_price',
      header: 'Sell Price'
    },
    {
      accessorKey: 'reorder',
      header: 'Reorder'
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")?.toLowerCase();

        const styles = {
          active: "bg-[#DEF4E6] text-[#34C759]",
          in_active: "bg-[#FFE6E7] text-[#A30F0F]",

        };

        return (
          <span
            className={`inline-flex justify-center items-center min-w-[90px] px-3 py-1 rounded-[15px] text-[12px] font-poppins font-medium capitalize ${styles[status]}`}
          >
            {row.getValue("status")}
          </span>
        );
      },
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
      category: "Electronics",
      sku: "ELEC-001",
      current_stock: 120,
      cost_price: 8.5,
      sell_price: 15.99,
      reorder: 20,
      status: "in_active"
    },
    {
      product_name: "Bluetooth Headphones",
      category: "Electronics",
      sku: "ELEC-002",
      current_stock: 45,
      cost_price: 18.0,
      sell_price: 35.0,
      reorder: 15,
      status: "active"
    },
    {
      product_name: "Office Chair",
      category: "Furniture",
      sku: "FURN-001",
      current_stock: 12,
      cost_price: 55.0,
      sell_price: 89.99,
      reorder: 5,
      status: "in_active"
    },
    {
      product_name: "Notebook Pack",
      category: "Stationery",
      sku: "STAT-001",
      current_stock: 300,
      cost_price: 2.0,
      sell_price: 4.5,
      reorder: 50,
      status: "active"
    },
    {
      product_name: "Water Bottle",
      category: "Accessories",
      sku: "ACC-001",
      current_stock: 80,
      cost_price: 3.25,
      sell_price: 7.99,
      reorder: 25,
      status: "active"
    },
  ];

  return (
    <div className='flex flex-col'>
      <div className="flex justify-between px-4 py-2 items-center">
        <h1 className="text-xl font-medium">Products Lists</h1>

        <button >
          <img
          onClick={()=>setOpenFilter(true)}
            src={filters}
            alt="filter"
            className="border-2 h-10 w-12 p-1 shadow-lg rounded-[9px]"
          />
        </button>
           <FilterModal
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />

      </div>
      <div className="">
        <DataTable
          columns={columns}
          data={dummyProducts}
          setTableParams={setTableParams}
          tableParams={tableParams}
          pagination={31}
          paginationVisibile={true}
        />
      </div>
    </div>
  )
}

export default Products
