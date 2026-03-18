import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const BarChart = ({
  labels = [],
  datasets = [],
  height = 'h-72',
  isDashboard = false
}) => {
  const [visible, setVisible] = useState(
    datasets.reduce((acc, ds, i) => {
      acc[i] = true
      return acc
    }, {})
  )

  const toggleDataset = index => {
    setVisible(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const data = {
    labels,
    datasets: datasets.map((ds, index) => ({
      ...ds,
      hidden: !visible[index],
      backgroundColor:
        ds.backgroundColor || (isDashboard ? '#15CAB8' : '#4581FF'),
      borderRadius: isDashboard ? 0 : 8,
      barThickness: isDashboard ? 15 : 10
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          callback: v => (v >= 1000 ? `${v / 1000}k` : v)
        }
      }
    }
  }

  return (
    <div className='w-full'>
      <div className={`${height} w-full`}>
        <Bar data={data} options={options} />
      </div>

      {/* Legend */}
      <div className='flex justify-center gap-8 mt-6'>
        {datasets.map((ds, index) => (
          <div
            key={index}
            onClick={() => toggleDataset(index)}
            className='flex items-center gap-2 cursor-pointer'
          >
            <span
              className='w-6 h-2 rounded'
              style={{
                backgroundColor: visible[index] ? ds.backgroundColor : '#D1D5DB'
              }}
            />
            <span
              className={`text-sm font-medium ${
                visible[index] ? 'text-black' : 'text-gray-400'
              }`}
            >
              {ds.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BarChart
