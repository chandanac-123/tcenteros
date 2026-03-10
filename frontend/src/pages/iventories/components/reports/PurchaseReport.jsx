import { DataTable } from '@common/DataTable'
import { usePurchaseReportQuery } from '@api-queries/inventory/Query'

const PurchaseReport = () => {
    const {data} = usePurchaseReportQuery()
  
  const columns = [
    {
      accessorKey: 'date',
      header: 'Date'
    },
    {
      accessorKey: 'product',
      header: 'Product'
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
    }
  ]
  return (
    <>
      <DataTable columns={columns} search={false} data={ []} />
    </>
  )
}

export default PurchaseReport
