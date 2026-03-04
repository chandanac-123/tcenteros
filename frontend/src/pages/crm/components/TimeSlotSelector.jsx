import { convertTo12Hour } from "@utils/helper"

const TimeSlotSelector = ({
  label,
  slots = [],
  selectedSlot = null,
  onChange
}) => {
  const selectSlot = slotId => {
    onChange?.(slotId)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
        {slots.map(slot => {
          const isSelected = selectedSlot === slot.id

          return (
            <div
              key={slot.id}
              onClick={() => selectSlot(slot.id)}
              className={`cursor-pointer px-4 py-2 rounded-md transition-all duration-200
                ${
                  isSelected
                    ? "bg-day_select text-primary"
                    : "bg-day_select_bg text-grey"
                }
              `}
            >
              {convertTo12Hour(slot.start_time)} - {convertTo12Hour(slot.end_time)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TimeSlotSelector