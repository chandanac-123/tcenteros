import { useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const LineChart = () => {
  const chartRef = useRef(null)

  const [visibleDatasets, setVisibleDatasets] = useState({
    Membership: true,
    Inventory: true,
    Network: true
  })

  const toggleDataset = label => {
    const chart = chartRef.current
    if (!chart) return

    const datasetIndex = chart.data.datasets.findIndex(ds => ds.label === label)

    chart.setDatasetVisibility(
      datasetIndex,
      !chart.isDatasetVisible(datasetIndex)
    )

    chart.update()

    setVisibleDatasets(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

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
        label: 'Membership',
        data: [
          3000, 4500, 6000, 4000, 8000, 9500, 7000, 8500, 9000, 10000, 11000,
          12000
        ],
        borderColor: '#377CF6',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Inventory',
        data: [
          2000, 3500, 5500, 6500, 7000, 8500, 6000, 7500, 8000, 9500, 10000,
          10500
        ],
        borderColor: '#FFCD0F',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Network',
        data: [
          1000, 2500, 4000, 5000, 6000, 7500, 6500, 7000, 7200, 8500, 9000, 9500
        ],
        borderColor: '#55EFC2',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index', // show all datasets at same x
      intersect: false // no need to touch the exact line
    },

    plugins: {
      legend: { display: false },

      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10
      },

      datalabels: {
        display: false
      }
    },

    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        min: 0,
        max: 10000,
        grid: { display: false },
        afterBuildTicks: scale => {
          scale.ticks = [
            { value: 1000 },
            { value: 2000 },
            { value: 5000 },
            { value: 10000 }
          ]
        },
        ticks: {
          callback: value => value / 1000 + 'k'
        }
      }
    }
  }

  return (
    <div className='w-full  flex flex-col'>
      <div className='h-60 w-full'>
        <Line ref={chartRef} data={data} options={options} />
      </div>

      <div className='flex gap-8 justify-center py-3 rounded-lg'>
        {data.datasets.map(ds => (
          <div
            key={ds.label}
            onClick={() => toggleDataset(ds.label)}
            className='flex items-center gap-2 cursor-pointer'
          >
            <span
              className='w-6 h-2 rounded'
              style={{ backgroundColor: ds.borderColor }}
            />
            <span
              className={`text-sm ${
                visibleDatasets[ds.label] ? 'text-black' : 'text-gray-400'
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

export default LineChart
