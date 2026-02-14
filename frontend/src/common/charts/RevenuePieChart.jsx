import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useState } from 'react'
import { Pie } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const RevenuePieChart = () => {
  const [visible, setVisible] = useState({
    membership: true,
    training: true,
    inventory: true,
    other: true
  })

  const rawData = {
    membership: 5000,
    training: 3000,
    inventory: 2000,
    other: 1000
  }

  const data = {
    labels: [
      'Membership Income',
      'Training Service Income',
      'Inventory Sales',
      'Other Income'
    ],
    datasets: [
      {
        data: [
          visible.membership ? rawData.membership : 0,
          visible.training ? rawData.training : 0,
          visible.inventory ? rawData.inventory : 0,
          visible.other ? rawData.other : 0
        ],
        backgroundColor: ['#8A00FF', '#EB4824', '#FFCD0FFC', '#A3AED0'],
        borderWidth: 0
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, context) => {
          const dataArr = context.dataset.data
          const total = dataArr.reduce((sum, val) => sum + val, 0)
          const percentage = ((value / total) * 100).toFixed(0)
          return value ? `${percentage}%` : ''
        }
      }
    }
  }

  return (
    <div className='w-full flex items-center gap-10'>
      {/* Pie Chart */}
      <div className='h-72 w-72'>
        <Pie data={data} options={options} />
      </div>

      {/* Custom Legend on Right */}
      <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
        <LegendItem
          color='#8A00FF'
          label='Membership Income'
          active={visible.membership}
          onClick={() => toggle('membership')}
        />
        <LegendItem
          color='#EB4824    '
          label='Training Service Income'
          active={visible.training}
          onClick={() => toggle('training')}
        />
        <LegendItem
          color='#FFCD0FFC'
          label='Inventory Sales'
          active={visible.inventory}
          onClick={() => toggle('inventory')}
        />
        <LegendItem
          color='#A3AED0'
          label='Other Income'
          active={visible.other}
          onClick={() => toggle('other')}
        />
      </div>
    </div>
  )
}

const LegendItem = ({ color, label, active, onClick }) => {
  return (
    <div className='flex flex-col'>
      <div onClick={onClick} className='flex items-center gap-3 cursor-pointer'>
        <span
          className={`w-4 h-4 rounded-full`}
          style={{ backgroundColor: active ? color : '#d1d5db' }}
        ></span>
        <span className={`text-xs ${!active && 'text-gray line-through'}`}>
          {label}
        </span>
      </div>
      <span className='pl-5 text-sm '>$125,000 </span>
    </div>
  )
}

export default RevenuePieChart
