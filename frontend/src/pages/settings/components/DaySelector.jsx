const DaySelector = ({ label, days = [], selectedDays = [], onChange }) => {
  const toggleDay = dayId => {
    let updatedDays

    if (selectedDays.includes(dayId)) {
      updatedDays = selectedDays.filter(id => id !== dayId)
    } else {
      updatedDays = [...selectedDays, dayId]
    }

    onChange?.(updatedDays)
  }

  return (
    <div className='flex flex-col gap-2 w-full'>
      {label && <span className='font-medium'>{label}</span>}

      <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full'>
        {days.map(day => {
          const isSelected = selectedDays.includes(day.id)

          return (
            <div
              key={day.id}
              onClick={() => toggleDay(day.id)}
              className={`cursor-pointer px-4 py-2 rounded-md transition-all duration-200
                ${
                  isSelected
                    ? 'bg-day_select text-primary'
                    : 'bg-day_select_bg text-grey'
                }
              `}
            >
              {day.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DaySelector
