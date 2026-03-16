import { DataTable } from '@common/components/DataTable'
import { useConsolidatedIncomeReportQuery } from '@api-queries/report/Query'

const IncomeTable = ({ tableParams, setTableParams }) => {
  const { data, isFetching } = useConsolidatedIncomeReportQuery()
  console.log('data:1111 ', data);

  const flattenIncomeData = (data) => {
  if (!data?.by_center) return []

  const rows = []

  data.by_center.forEach(center => {
    const { center_name, income_breakdown } = center

    const categories = ['membership', 'sales', 'other']

    categories.forEach(category => {
      const details = income_breakdown?.[category]?.details || []

      details.forEach(item => {
        rows.push({
          center_name,
          category,
          order_type: item.order_type || '-',
          payment_method: item.payment_method || '-',
          subtotal: item.subtotal || item.revenue || 0,
          tax: item.tax || 0,
          total: item.total || item.revenue || 0,
          transaction_count: item.transaction_count || 0
        })
      })
    })
  })

  return rows
}

  const tableData = flattenIncomeData(data)

   const columns = [
    {
      accessorKey: 'center_name',
      header: 'Center Name'
    },
    {
      accessorKey: 'category',
      header: 'Income Type'
    },
    {
      accessorKey: 'order_type',
      header: 'Order Type'
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment Method'
    },
    {
      accessorKey: 'subtotal',
      header: 'Subtotal'
    },
    {
      accessorKey: 'tax',
      header: 'Tax'
    },
    {
      accessorKey: 'total',
      header: 'Total'
    },
    {
      accessorKey: 'transaction_count',
      header: 'Transactions'
    }
  ]
  return (
    <div>
      <DataTable
        columns={columns}
        data={tableData || []}
        paginationVisibile={true}
        search={false}
         tableParams={tableParams}
          setTableParams={setTableParams}
      />
    </div>
  )
}

export default IncomeTable
