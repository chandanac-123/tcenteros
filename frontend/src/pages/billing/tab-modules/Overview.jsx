import LineChart from '@common/charts/LineChart'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { Card } from '@pages/components/ui/card'
import { useState } from 'react'
import NewSale from '../component/NewSale'
import { useCartOpenMutation } from '@api-queries/center-admin/billing/Query'
import AddCharge from '../component/AddCharge'
import { useBillingDashboardQuery } from '@api-queries/center-admin/billing/Query'
import StatusDisplayCard from '../component/statusDisplayCard'
import DisplayActionCard from '../component/displayActionCard'

const Overview = () => {
  const { data: dashboardData } = useBillingDashboardQuery()
  console.log('dashboardData: ', dashboardData)
  const [openNewSale, setOpenNewSale] = useState(false)
  const [openAddCharge, setOpenAddCharge] = useState(false)
  const { mutate: openCart } = useCartOpenMutation()

  const handleActionClick = title => {
    if (title === '+ New Sale') {
      openCart()
      setOpenNewSale(true)
    }
    if (title === '+ Add Charge') {
      setOpenAddCharge(true)
    }
  }

  const labels = dashboardData?.revenue_trend_chart?.map(i => i.month) || []

  const membershipData =
    dashboardData?.revenue_trend_chart?.map(i => i.memberships) || []

  const inventoryData =
    dashboardData?.revenue_trend_chart?.map(i => i.inventory_sales) || []

  const networkData =
    dashboardData?.revenue_trend_chart?.map(i => i.networking) || []

  return (
    <div className='space-y-4'>
      <div className='flex w-full'>
        <StatusDisplayCard data={dashboardData} />
      </div>

      <div className='flex justify-end'>
        <DisplayActionCard onActionClick={handleActionClick} />
      </div>

      <div className=''>
        {/* Left Section */}
        <div className='lg:col-span-2'>
          <Card className='p-4 h-full'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
              <span className='font-semibold text-base'>
                Total Revenue Summary
              </span>
              <span>
                <CustomDatePicker pickerType='year' />
              </span>
            </div>
            <LineChart
              labels={labels}
              datasets={[
                {
                  label: 'Membership',
                  data: membershipData,
                  borderColor: '#377CF6'
                },
                {
                  label: 'Inventory',
                  data: inventoryData,
                  borderColor: '#FFCD0F'
                },
                {
                  label: 'Network',
                  data: networkData,
                  borderColor: '#55EFC2'
                }
              ]}
              yMin={0}
              tickFormat={v => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
          </Card>
        </div>
      </div>
      <NewSale saleOpen={openNewSale} setSaleOpen={setOpenNewSale} />
      <AddCharge
        openAddCharge={openAddCharge}
        setOpenAddCharge={setOpenAddCharge}
      />
    </div>
  )
}
export default Overview
