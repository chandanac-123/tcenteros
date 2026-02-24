const COLORS = [
  'bg-progress_yellow',
  'bg-progress_green',
  'bg-progress_blue',
  'bg-Network_light',
  'bg-primary_light',
  'bg-inventory_bg',
  'bg-taxes_bg',
  'bg-profile_brown',
  'bg-plan_green'
]

const MultiColorProgressBar = ({
  data = {},
  height = 'h-2'
}) => {
  const total = Object.values(data).reduce((acc, val) => acc + val, 0)

  const segments = Object.entries(data).map(([role, count], index) => ({
    role,
    count,
    percentage: total ? (count / total) * 100 : 0,
    colorClass: COLORS[index % COLORS.length]
  }))

  return (
    <div className='w-full my-4'>
      
      {/* Progress Bar */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden flex ${height}`}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${segment.colorClass} ${height}`}
            style={{ width: `${segment.percentage}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className='flex flex-wrap gap-4 mt-4'>
        {segments.map((segment, index) => (
          <div key={index} className='flex items-center gap-2'>
            <span
              className={`w-3 h-3 rounded-full ${segment.colorClass}`}
            />
            <span className='text-xs text-gray-500'>
              {segment.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiColorProgressBar