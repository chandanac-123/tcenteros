import LineChart from '@common/charts/LineChart'
import CustomDatePicker from '@common/CustomeDatepicker'
import { Card } from '@pages/components/ui/card'
import StatusDisplayCard from '../component/StatusDisplayCard'
import DisplayActionCard from '../component/DisplayActionCard'
import { useState } from 'react'
import NewSale from '../component/NewSale'
import RenewMembership from '../component/RenewMembership'

const Overview = () => {
  const [openNewSale, setOpenNewSale] = useState(false)
  const [openRenewMember, setOpenRenewMember] = useState(false)

  const handleActionClick = title => {
    if (title === '+ New Sale') {
      setOpenNewSale(true)
    }
    if (title === '+ Renew  Membership') {
      setOpenRenewMember(true)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex w-full'>
        <StatusDisplayCard />
      </div>

      <div className='flex flex-col lg:flex-row w-full gap-4 items-stretch'>
        {/* Left Section */}
        <div className='w-2/3'>
          <Card className='p-4 h-full'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
              <span className='font-semibold text-base'>
                Total Revenue Summary
              </span>
              <span>
                <CustomDatePicker pickerType='year' />
              </span>
            </div>
            <LineChart />
          </Card>
        </div>

        {/* Right Section */}
        <div className='w-full lg:w-1/3'>
          <DisplayActionCard onActionClick={handleActionClick} />
        </div>
      </div>
      <NewSale saleOpen={openNewSale} setSaleOpen={setOpenNewSale} />
      <RenewMembership overview={true} openRenewMember={openRenewMember} setOpenRenewMember={setOpenRenewMember} />
    </div>
  )
}
export default Overview
