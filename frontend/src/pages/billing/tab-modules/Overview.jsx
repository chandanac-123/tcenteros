import LineChart from '@common/charts/LineChart'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { Card } from '@pages/components/ui/card'
import StatusDisplayCard from '../component/StatusDisplayCard'
import DisplayActionCard from '../component/DisplayActionCard'
import { useState } from 'react'
import NewSale from '../component/NewSale'
import { useCartOpenMutation } from '@api-queries/billing/Query'
import AddCharge from '../component/AddCharge'

const Overview = () => {
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

  return (
    <div className='space-y-4'>
      <div className='flex w-full'>
        <StatusDisplayCard />
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
              datasets={[
                {
                  label: 'Membership',
                  data: [3000, 4500, 6000],
                  borderColor: '#377CF6'
                },
                {
                  label: 'Inventory',
                  data: [2000, 3500, 5500],
                  borderColor: '#FFCD0F'
                },
                {
                  label: 'Network',
                  data: [1000, 2500, 4000],
                  borderColor: '#55EFC2'
                }
              ]}
              yMin={0}
              yMax={10000}
              tickFormat={v => v / 1000 + 'k'}
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
