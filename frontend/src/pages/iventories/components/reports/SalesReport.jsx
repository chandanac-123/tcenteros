import React from 'react'
import { DataTable } from '@common/DataTable'

const SalesReport = () => {
  const columns = [
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'sales',
      header: 'Sales'
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity'
    },
    {
      accessorKey: 'transaction_Type',
      header: 'Transaction Type'
    },
    {
      accessorKey: 'Available',
      header: 'Available'
    },
    {
      accessorKey: 'status',
      header: 'status'
    },

  ]

   const data = [
    { date: "2026-02-01", sales: "₹2,500", quantity: 5, transaction_Type: "Cash", available: 120, status: "Completed" },
    { date: "2026-02-02", sales: "₹4,200", quantity: 8, transaction_Type: "UPI", available: 112, status: "Completed" },
    { date: "2026-02-03", sales: "₹1,800", quantity: 3, transaction_Type: "Card", available: 109, status: "Completed" },
    { date: "2026-02-04", sales: "₹3,600", quantity: 6, transaction_Type: "Cash", available: 103, status: "Completed" },
    { date: "2026-02-05", sales: "₹5,000", quantity: 10, transaction_Type: "UPI", available: 93, status: "Completed" },
    { date: "2026-02-06", sales: "₹950", quantity: 2, transaction_Type: "Card", available: 91, status: "Completed" },
    { date: "2026-02-07", sales: "₹6,200", quantity: 12, transaction_Type: "UPI", available: 79, status: "Completed" },
    { date: "2026-02-08", sales: "₹2,750", quantity: 5, transaction_Type: "Cash", available: 74, status: "Completed" },
    { date: "2026-02-09", sales: "₹3,300", quantity: 6, transaction_Type: "Card", available: 68, status: "Pending" },
    { date: "2026-02-10", sales: "₹4,900", quantity: 9, transaction_Type: "UPI", available: 59, status: "Completed" },
    { date: "2026-02-10", sales: "₹4,900", quantity: 9, transaction_Type: "UPI", available: 59, status: "Completed" },
     { date: "2026-02-06", sales: "₹950", quantity: 2, transaction_Type: "Card", available: 91, status: "Completed" },
    { date: "2026-02-07", sales: "₹6,200", quantity: 12, transaction_Type: "UPI", available: 79, status: "Completed" },
    { date: "2026-02-08", sales: "₹2,750", quantity: 5, transaction_Type: "Cash", available: 74, status: "Completed" },
    { date: "2026-02-09", sales: "₹3,300", quantity: 6, transaction_Type: "Card", available: 68, status: "Pending" },
    { date: "2026-02-10", sales: "₹4,900", quantity: 9, transaction_Type: "UPI", available: 59, status: "Completed" },
    { date: "2026-02-10", sales: "₹4,900", quantity: 9, transaction_Type: "UPI", available: 59, status: "Completed" },
  ]
  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        pagination={32}
        search={false}
         paginationVisibile={true}
      />
    </>
  )
}

export default SalesReport
