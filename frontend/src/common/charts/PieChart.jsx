import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useState } from 'react'
import { Pie } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const PieChart = ({ dataConfig }) => {
  const [visible, setVisible] = useState(
    Object.fromEntries(dataConfig.map(item => [item.key, true]))
  )

  const toggle = key => {
    setVisible(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const chartData = {
    labels: dataConfig.map(item => item.label),
    datasets: [
      {
        data: dataConfig.map(item =>
          visible[item.key] ? item.value : 0
        ),
        backgroundColor: dataConfig.map(item => item.color),
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
        font: { weight: 'bold', size: 12 },
        formatter: (value, context) => {
          const dataArr = context.dataset.data
          const total = dataArr.reduce((sum, val) => sum + val, 0)
          const percentage = total ? ((value / total) * 100).toFixed(0) : 0
          return value ? `${percentage}%` : ''
        }
      }
    }
  }

  return (
    <div className='flex items-center justify-between w-full gap-6'>
      
      {/* 🔥 PIE CHART */}
      <div className='h-44 w-44'>
        <Pie data={chartData} options={options} />
      </div>

      {/* 🔥 LEGEND (MATCHING YOUR UI) */}
      <div className='grid grid-cols-2 gap-x-6 gap-y-3 flex-1'>
        {dataConfig.map(item => {
          const isActive = visible[item.key]

          return (
            <div
              key={item.key}
              onClick={() => toggle(item.key)}
              className='flex items-center gap-2 cursor-pointer'
            >
              {/* color dot */}
              <span
                className='w-3 h-3 rounded-full'
                style={{
                  backgroundColor: isActive ? item.color : '#d1d5db'
                }}
              />

              {/* text */}
              <div className='flex flex-col'>
                <span
                  className={`text-xs ${
                    !isActive ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </span>

                <span className='text-sm font-medium text-black'>
                  ₹{item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PieChart