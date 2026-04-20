import React from 'react'
import { DataTable } from '@common/components/DataTable'
import { useInventoryReportQuery } from '@api-queries/center-admin/inventory/Query'
import { Badge } from '@pages/components/ui/badge'

const statusVariantMap = {'In Stock': 'active', 'Out of Stock': 'inactive' }

const InventoryReport = ({ tableParams, setTableParams }) => {
  const { data, isLoading } = useInventoryReportQuery(tableParams)

  const columns = [
    { accessorKey: 'product_name', header: 'Product Name' },
    { accessorKey: 'sku_code', header: 'SKU Code' },
    { accessorKey: 'base_price', header: 'Base Price' },
    { accessorKey: 'selling_price', header: 'Selling Price' },
    { accessorKey: 'reorder_level', header: 'Reorder Level' },
    {
      accessorKey: 'status',
      header: 'status',
      cell: ({ row }) => (
        <Badge
          label={row.original.status.replace('_', ' ').toUpperCase()}
          variant={
            statusVariantMap[row.original.status] ||
            'inactive'
          }
        />
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.inventory || []}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total || 0}
      search={false}
      loading={isLoading}
      paginationVisibile={true}
    />
  )
}

export default InventoryReport
