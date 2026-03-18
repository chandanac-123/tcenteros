import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useState } from 'react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const FinancialChart = ({ data }) => {
  // 🔥 Track hidden labels
  const [hiddenItems, setHiddenItems] = useState([])

  // 🔥 Toggle function
  const toggleItem = label => {
    setHiddenItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  // 🔥 Filter visible data
  const visibleData = data.filter(item => !hiddenItems.includes(item.label))

  const chartData = {
    labels: visibleData.map(item => item.label),
    datasets: [
      {
        label: 'Financial Flow',
        data: visibleData.map(() => 100),
        backgroundColor: visibleData.map(item => item.color),
        borderRadius: 8,
        barThickness: 14
      }
    ]
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        display: false,
        max: 100
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#6B7280',
          font: { size: 12 }
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* 🔥 Chart */}
      <div className="flex-1">
        <Bar data={chartData} options={options} />
      </div>

      {/* 🔥 Custom Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {data.map(item => {
          const isHidden = hiddenItems.includes(item.label)

          return (
            <div
              key={item.label}
              onClick={() => toggleItem(item.label)}
              className={`flex items-center gap-2 cursor-pointer text-sm ${
                isHidden ? 'opacity-40' : ''
              }`}
            >
              {/* color box */}
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />

              {/* label */}
              <span>{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FinancialChart


//  const progresscolorPalette = [
//     {
//       label: 'Membership Sale',
//       bg: 'bg-primary_light',
//       bglight: 'bg-memberprogress_light'
//     },
//     {
//       label: 'Inventory Sale',
//       bg: 'bg-progress_yellow',
//       bglight: 'bg-inventory_light'
//     },
//     {
//       label: 'Inventory Purchase',
//       bg: 'bg-purchase',
//       bglight: 'bg-purchase_light'
//     },
//     {
//       label: 'Payroll Processing',
//       bg: 'bg-barchartexpense',
//       bglight: 'bg-payroll_light'
//     },
//     {
//       label: 'Trainer Charges',
//       bg: 'bg-green_text',
//       bglight: 'bg-progress_light_green'
//     },
//     {
//       label: 'Network Settlements',
//       bg: 'bg-Network',
//       bglight: 'bg-Network_light'
//     },
//     {
//       label: 'General Expenses',
//       bg: 'bg-progress_blue',
//       bglight: 'bg-general_bg'
//     }
//   ]