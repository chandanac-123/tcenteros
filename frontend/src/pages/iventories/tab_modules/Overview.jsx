import React, { useState } from 'react'
import StatusDisplaycard from '../components/StatusDisplaycard'
import { useInventoryDashboardQuery } from '@api-queries/inventory/Query'
import LineChart from '@common/charts/LineChart'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { Card } from '@pages/components/ui/card'
import BarChart from '@common/charts/BarChart'

const Overview = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data: dashboardData } = useInventoryDashboardQuery()
  console.log('dashboardData: ', dashboardData)
  const stockLabels =
    dashboardData?.stock_distribution_chart?.map(i => i.month) || []

  const inStockData =
    dashboardData?.stock_distribution_chart?.map(i => i.in_stock) || []

  const lowStockData =
    dashboardData?.stock_distribution_chart?.map(i => i.low_stock) || []

  const outStockData =
    dashboardData?.stock_distribution_chart?.map(i => i.out_of_stock) || []

  const salesLabels = dashboardData?.sales_trend_chart?.map(i => i.month) || []

  const salesData = dashboardData?.sales_trend_chart?.map(i => i.sales) || []

  const purchaseData =
    dashboardData?.sales_trend_chart?.map(i => i.purchases) || []

  return (
    <div className='flex flex-col gap-3'>
      <StatusDisplaycard data={dashboardData} />
      {/* Charts */}

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
        {/* Chart Section */}
        <div className='lg:col-span-2'>
          <Card className='p-4 h-full '>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
              <span className='font-semibold text-base'>
                Total Revenue Summary
              </span>
              <span>
                <CustomDatePicker pickerType='year' />
              </span>
            </div>
            <LineChart
              title='Stock Distribution'
              labels={stockLabels}
              datasets={[
                {
                  label: 'In Stock',
                  data: inStockData,
                  borderColor: '#377CF6'
                },
                {
                  label: 'Low Stock',
                  data: lowStockData,
                  borderColor: '#FFCD0F'
                },
                {
                  label: 'Out of Stock',
                  data: outStockData,
                  borderColor: '#55EFC2'
                }
              ]}
              onYearChange={setYear}
            />
          </Card>
        </div>

        <div className='lg:col-span-2'>
          <Card className='p-4 h-full'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
              <span className='font-semibold text-base'>Revenue Trend</span>
              <span>
                <CustomDatePicker pickerType='year' />
              </span>
            </div>
            <BarChart
              labels={salesLabels}
              datasets={[
                {
                  label: 'Sales',
                  data: salesData,
                  backgroundColor: '#377CF6'
                },
                {
                  label: 'Purchases',
                  data: purchaseData,
                  backgroundColor: '#55EFC2'
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Overview
