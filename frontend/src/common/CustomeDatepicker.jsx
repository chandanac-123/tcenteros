import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@pages/components/ui/popover'
import { Calendar } from '@pages/components/ui/calendar'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CustomDatePicker = ({
  label,
  value,
  onChange,
  error,
  pickerType = 'date' // 🔥 new prop
}) => {
  const [open, setOpen] = useState(false)

  const [date, setDate] = useState(value ? new Date(value) : null)
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 4)
  useEffect(() => {
    setDate(value ? new Date(value) : null)
  }, [value])

  const handleSelect = selectedDate => {
    if (!selectedDate) return

    if (pickerType === 'year') {
      const year = selectedDate.getFullYear()
      const firstDayOfYear = new Date(year, 0, 1)
      setDate(firstDayOfYear)
      onChange?.(year)
    } else {
      setDate(selectedDate)
      onChange?.(selectedDate)
    }

    setOpen(false) // 🔥 close popover
  }

  const handleClear = () => {
    setDate(null)
    onChange?.(null)
  }

  const displayValue = () => {
    if (!date) return pickerType === 'year' ? 'Year' : 'Pick a date'
    return pickerType === 'year' ? format(date, 'yyyy') : format(date, 'PPP')
  }

  return (
    <div className='w-full'>
      {label && (
        <label className='block mb-1 text-sm font-normal text-textblack'>
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild onClick={() => setOpen(true)}>
          <div className='relative cursor-pointer'>
            <CalendarIcon
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />

            <div className='flex items-center justify-between border border-gray-300 rounded-md pl-9 pr-3 py-2 bg-white shadow-sm'>
              <span
                className={`text-sm ${date ? 'text-black' : 'text-gray-400'}`}
              >
                {displayValue()}
              </span>

              {date && (
                <X
                  size={16}
                  onClick={e => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className='text-gray-400 hover:text-red-500 cursor-pointer'
                />
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className='w-64 p-4' align='start'>
          {pickerType === 'year' ? (
            <>
              {/* Header with Arrows */}
              <div className='flex justify-between items-center mb-3'>
                <ChevronLeft
                  className='cursor-pointer'
                  onClick={() => setStartYear(prev => prev - 9)}
                />
                <span className='text-sm font-medium'>
                  {startYear} - {startYear + 8}
                </span>
                <ChevronRight
                  className='cursor-pointer'
                  onClick={() => setStartYear(prev => prev + 9)}
                />
              </div>

              {/* Year Grid */}
              <div className='grid grid-cols-3 gap-2'>
                {Array.from({ length: 9 }, (_, i) => {
                  const year = startYear + i

                  return (
                    <div
                      key={year}
                      onClick={() => {
                        const selectedDate = new Date(year, 0, 1)
                        setDate(selectedDate)
                        onChange?.(year)
                        setOpen(false) // 🔥 close popover
                      }}
                      className={`px-3 py-2 text-sm rounded-md cursor-pointer text-center
                ${
                  date?.getFullYear() === year
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
                    >
                      {year}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <Calendar
              mode='single'
              selected={date}
              onSelect={handleSelect}
              defaultMonth={date}
            />
          )}
        </PopoverContent>
      </Popover>

      {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
    </div>
  )
}

export default CustomDatePicker
