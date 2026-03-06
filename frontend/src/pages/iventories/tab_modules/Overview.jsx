import React, { useState } from 'react'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'

import StatusDisplaycard from '../components/StatusDisplaycard'

const Overview = () => {
  const [year, setYear] = useState(new Date().getFullYear())

  console.log('Year', year)

  const datasets = [
    {
      label: 'Membership',
      data: [
        3000, 4500, 6000, 4000, 8000, 9500, 7000, 8500, 9000, 10000, 11000,
        12000
      ],
      borderColor: '#377CF6'
    },
    {
      label: 'Inventory',
      data: [
        2000, 3500, 5500, 6500, 7000, 8500, 6000, 7500, 8000, 9500, 10000, 10500
      ],
      borderColor: '#FFCD0F'
    },
    {
      label: 'Network',
      data: [
        1000, 2500, 4000, 5000, 6000, 7500, 6500, 7000, 7200, 8500, 9000, 9500
      ],
      borderColor: '#55EFC2'
    }
  ]

  const barDatasets = [
    {
      label: 'Last 7 Days',
      data: [11],
      backgroundColor: '#377CF6'
    },
    {
      label: 'Last 30 Days',
      data: [8],
      backgroundColor: '#55EFC2'
    }
  ]

  return (
    <div className='flex flex-col gap-3'>
      <StatusDisplaycard />
      {/* Charts */}
      <div className='flex flex-col lg:flex-row gap-4 items-stretch'>
        <div className='lg:w-2/3 w-full flex'>
          <LineChart
            title='Growth Overview'
            datasets={datasets}
            onYearChange={setYear}
          />
        </div>

        <div className='lg:w-1/3 w-full flex'>
          <BarChart title='Sales vs Revenue' datasets={barDatasets} />
        </div>
      </div>
    </div>
  )
}

export default Overview
