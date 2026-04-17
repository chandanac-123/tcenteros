import { useRef, useState, useEffect } from 'react'
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

const defaultLabels = [
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
]

const LineChart = ({
  labels = defaultLabels,
  datasets = [],
  yMin = 0,
  yMax,
  tickFormat = value => value
}) => {
  const chartRef = useRef(null)

  const [visibleDatasets, setVisibleDatasets] = useState({})

  useEffect(() => {
    const visibility = {}
    datasets.forEach(ds => {
      visibility[ds.label] = true
    })
    setVisibleDatasets(visibility)
  }, [datasets])

  const toggleDataset = label => {
    const chart = chartRef.current
    if (!chart) return

    const index = chart.data.datasets.findIndex(ds => ds.label === label)

    chart.setDatasetVisibility(index, !chart.isDatasetVisible(index))
    chart.update()

    setVisibleDatasets(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const hasData = datasets.some(ds => ds.data?.some(val => val > 0))

  const data = hasData
    ? {
        labels,
        datasets: datasets.map(ds => ({
          ...ds,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0
        }))
      }
    : {
        labels: ['No Data'],
        datasets: [
          {
            label: 'No Data',
            data: [1],
            borderColor: '#E5E7EB',
            backgroundColor: '#E5E7EB',
            tension: 0.4
          }
        ]
      }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        min: yMin,
        max: yMax,
        grid: { display: false },
        ticks: {
          stepSize: 20,
          callback: tickFormat
        }
      }
    }
  }

  return (
    <div className='w-full flex flex-col'>
      <div className='h-60 w-full flex items-center justify-center relative'>
        {!hasData && (
          <span className='absolute text-gray-400 text-sm'>
            No Data Available
          </span>
        )}

        <Line ref={chartRef} data={data} options={options} />
      </div>

      {hasData && (
        <div className='flex gap-8 justify-center py-3'>
          {datasets.map(ds => (
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
      )}
    </div>
  )
}

export default LineChart
