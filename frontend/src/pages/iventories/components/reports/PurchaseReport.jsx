import { DataTable } from '@common/DataTable'
import { usePurchaseReportQuery } from '@api-queries/inventory/Query'
import { formatDate } from '@utils/helper'

const PurchaseReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = usePurchaseReportQuery(tableParams)
  console.log('data: ', data)

  const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className='flex gap-3'>{formatDate(row.original.date)}</span>
      )
    },
    { accessorKey: 'product_name', header: 'Product' },
    { accessorKey: 'invoice_number', header: 'Invoice Number' },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'supplier_name', header: 'Supplier Name' },
    { accessorKey: 'current_stock', header: 'Current Stock' },
    { accessorKey: 'unit_cost', header: 'Unit Cost' },
    { accessorKey: 'total', header: 'Total' }
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.purchases || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default PurchaseReport
