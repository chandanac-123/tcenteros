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

const BarChart = ({ variant = 'accounts' }) => {
  const [showIncome, setShowIncome] = useState(true)
  const [showExpense, setShowExpense] = useState(true)

  const isDashboard = variant === 'dashboard'

  const data = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    datasets: [
      {
        label: 'Income',
        data: isDashboard
          ? [
              12500, 5500, 17500, 12500, 9000, 15000, 8000, 14000, 11000, 9000,
              12000, 16000
            ]
          : [25, 70, 100, 80, 60, 90, 75, 95, 85, 65, 70, 100],
        backgroundColor: isDashboard ? '#15CAB8' : '#4581FF',
        borderRadius: isDashboard ? 0 : 8,
        barThickness: isDashboard ? 15 : 10,
        hidden: !showIncome
      },
      {
        label: 'Expenses',
        data: isDashboard
          ? [
              5000, 3000, 7000, 1200, 6000, 4000, 3500, 8000, 5000, 6000, 7000,
              9000
            ]
          : [15, 40, 60, 50, 30, 70, 55, 65, 60, 45, 50, 80],
        backgroundColor: isDashboard ? '#377CF6' : '#8A00FF',
        borderRadius: isDashboard ? 0 : 8,
        barThickness: isDashboard ? 15 : 10,
        hidden: !showExpense
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false } // disables value labels }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: isDashboard ? undefined : 25,
          callback: value => (isDashboard ? `${value / 1000}k` : value)
        },
        grid: { display: false }
      }
    }
  }

  return (
    <div className='w-full'>
      <div className={isDashboard ? 'h-72 w-full' : 'h-40 w-full'}>
        <Bar data={data} options={options} />
      </div>

      {/* Legend */}
      <div className='flex justify-center gap-8 mt-6'>
        <div
          onClick={() => setShowIncome(prev => !prev)}
          className='flex items-center gap-2 cursor-pointer'
        >
          <span
            className={` w-6 h-2 rounded ${
              showIncome
                ? isDashboard
                  ? 'bg-teal-500'
                  : 'bg-blue '
                : 'bg-gray-300'
            }`}
          ></span>
          <span className='text-sm font-medium'>Income</span>
        </div>

        <div
          onClick={() => setShowExpense(prev => !prev)}
          className='flex items-center gap-2 cursor-pointer'
        >
          <span
            className={`w-6 h-2 rounded ${
              showExpense
                ? isDashboard
                  ? 'bg-[#377CF6] '
                  : 'bg-purple-600 '
                : 'bg-gray-300 '
            }`}
          ></span>
          <span className='text-sm font-medium'>Expenses</span>
        </div>
      </div>
    </div>
  )
}

export default BarChart
