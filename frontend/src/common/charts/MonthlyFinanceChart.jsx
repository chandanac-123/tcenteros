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

const MonthlyFinanceChart = () => {
  const [showIncome, setShowIncome] = useState(true)
  const [showExpense, setShowExpense] = useState(true)

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
        data: [25, 70, 100, 80, 60, 90, 75, 95, 85, 65, 70, 100],
        backgroundColor: '#4581FF',
        borderRadius: { topLeft: 12, topRight: 12 },
        barThickness: 10,
        hidden: !showIncome
      },
      {
        label: 'Expense',
        data: [15, 40, 60, 50, 30, 70, 55, 65, 60, 45, 50, 80],
        backgroundColor: '#8A00FF',
        borderRadius: { topLeft: 12, topRight: 12 },
        barThickness: 10,
        hidden: !showExpense
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ IMPORTANT
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 25 },
        grid: { display: false }
      }
    }
  }

  return (
    <div className='w-full'>
      <div className='h-40 w-full'>
        <Bar data={data} options={options} />
      </div>

      {/* Custom Legend with Toggle */}
      <div className='flex justify-center gap-8 mt-6'>
        <div
          onClick={() => setShowIncome(prev => !prev)}
          className='flex items-center gap-2 cursor-pointer'
        >
          <span
            className={`w-4 h-4 rounded-full ${
              showIncome ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          ></span>
          <span className='text-sm font-medium'>Income</span>
        </div>

        <div
          onClick={() => setShowExpense(prev => !prev)}
          className='flex items-center gap-2 cursor-pointer'
        >
          <span
            className={`w-4 h-4 rounded-full ${
              showExpense ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          ></span>
          <span className='text-sm font-medium'>Expense</span>
        </div>
      </div>
    </div>
  )
}

export default MonthlyFinanceChart
