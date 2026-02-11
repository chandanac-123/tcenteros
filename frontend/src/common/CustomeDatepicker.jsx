import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@pages/components/ui/popover'
import { Calendar } from '@pages/components/ui/calendar'
import { useState } from 'react'

const CustomDatePicker = ({ label, value, onChange }) => {
  const [date, setDate] = useState(value || null)

  const handleSelect = selectedDate => {
    setDate(selectedDate)
    onChange?.(selectedDate)
  }

  const handleClear = () => {
    setDate(null)
    onChange?.(null)
  }

  return (
    <div className="w-full">
      <label className="block mb-1 text-sm font-normal text-textblack">
        {label}
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <div className="relative cursor-pointer">
            {/* Date Icon */}
            <CalendarIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <div className="flex items-center justify-between border border-gray-300 rounded-xl pl-9 pr-3 py-2 bg-white shadow-sm">
              {/* Date Text */}
              <span
                className={`text-sm ${
                  date ? 'text-black' : 'text-gray-400'
                }`}
              >
                {date ? format(date, 'PPP') : 'Pick a date'}
              </span>

              {/* Clear Icon */}
              {date && (
                <X
                  size={16}
                  onClick={e => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                />
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default CustomDatePicker
