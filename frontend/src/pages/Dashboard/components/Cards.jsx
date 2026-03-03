const CARD_COLORS = [
  {
    text: 'text-plan_purple',
    bg: 'bg-plan_purple/10'
  },
  {
    text: 'text-badge_blue',
    bg: 'bg-badge_blue/10'
  },
  {
    text: 'text-green_text',
    bg: 'bg-green_text/10'
  },
  {
    text: 'text-payroll_bg',
    bg: 'bg-payroll_bg/10'
  },
  {
    text: 'text-inventory_bg',
    bg: 'bg-inventory_bg/10'
  },
  {
    text: 'text-progress_yellow',
    bg: 'bg-progress_yellow/10'
  },
   {
    text: 'text-taxes_bg',
    bg: 'bg-taxes_bg/10'
  }
]

const getColorIndex = label => {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % CARD_COLORS.length
}

const SubCard = ({ label, value }) => {
  const color = CARD_COLORS[getColorIndex(label)]

  return (
    <div className='h-16 w-full flex items-center justify-between px-4 bg-textwhite rounded-xl shadow-md'>
      {/* Label */}
      <span className='text-sm font-medium text-textblack'>{label}</span>

      {/* Value */}
      <span
        className={`text-sm py-1 px-3 rounded-xl font-semibold ${color.text} ${color.bg}`}
      >
        {value ?? 0}
      </span>
    </div>
  )
}

export default SubCard
