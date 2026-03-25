import { convertTo12Hour } from '@utils/helper'

const TimeSlotSelector = ({
  label,
  slots = [],
  selectedSlot = null,
  onChange
}) => {
  const selectSlot = slot => {
    if (slot.status !== 'available') return // ❌ block click
    onChange?.(slot.id)
  }

  return (
    <div className='flex flex-col gap-2 w-full'>
      {label && <label className='text-sm font-medium'>{label}</label>}

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full'>
        {slots.map(slot => {
          const isSelected = selectedSlot === slot.id
          const isAvailable = slot.status === 'available'

          return (
            <div
              key={slot.id}
              onClick={() => selectSlot(slot)}
              className={`
                px-4 py-2 rounded-md transition-all duration-200 text-center

                ${
                  isAvailable
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                }

                ${
                  isSelected && isAvailable
                    ? 'bg-day_select text-primary border border-primary'
                    : isAvailable
                    ? 'bg-day_select_bg text-grey hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 line-through'
                }
              `}
            >
              {convertTo12Hour(slot.start_time)} -{' '}
              {convertTo12Hour(slot.end_time)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TimeSlotSelector
