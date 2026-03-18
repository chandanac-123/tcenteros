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
  pickerType = 'date' // default = single date
}) => {
  const [open, setOpen] = useState(false)

  // 🔥 State handling for all modes
  const [date, setDate] = useState(() => {
    if (pickerType === 'range') {
      return {
        from: value?.from ? new Date(value.from) : null,
        to: value?.to ? new Date(value.to) : null
      }
    }
    return value ? new Date(value) : null
  })

  const [startYear, setStartYear] = useState(new Date().getFullYear() - 4)

  // 🔥 Sync with external value
  useEffect(() => {
    if (pickerType === 'range') {
      setDate({
        from: value?.from ? new Date(value.from) : null,
        to: value?.to ? new Date(value.to) : null
      })
    } else {
      setDate(value ? new Date(value) : null)
    }
  }, [value, pickerType])

  // 🔥 Handle Select
  const handleSelect = selected => {
    if (!selected) return

    if (pickerType === 'year') {
      const year = selected.getFullYear()
      const firstDayOfYear = new Date(year, 0, 1)
      setDate(firstDayOfYear)
      onChange?.(year)
      setOpen(false)
      return
    }

    // ✅ FIXED RANGE LOGIC
    if (pickerType === 'range') {
      setDate(selected)
      onChange?.(selected)

      // close only when both dates selected AND they are different
      if (selected?.from && selected?.to) {
        if (selected.from.getTime() !== selected.to.getTime()) {
          setOpen(false)
        }
      }
      return
    }
    // single date
    setDate(selected)
    onChange?.(selected)
    setOpen(false)
  }

  // 🔥 Clear
  const handleClear = () => {
    if (pickerType === 'range') {
      const cleared = { from: null, to: null }
      setDate(cleared)
      onChange?.(cleared)
    } else {
      setDate(null)
      onChange?.(null)
    }
  }

  // 🔥 Display Value
  const displayValue = () => {
    if (pickerType === 'range') {
      if (!date?.from) return 'Pick date range'
      if (!date?.to) return `${format(date.from, 'PPP')} - ...`
      return `${format(date.from, 'PPP')} - ${format(date.to, 'PPP')}`
    }
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
        <PopoverTrigger asChild>
          <div
            className='relative cursor-pointer'
            onClick={() => setOpen(true)}
          >
            <CalendarIcon
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <div className='flex items-center justify-between border border-gray-300 rounded-md pl-9 pr-3 py-2 bg-white shadow-sm'>
              <span
                className={`text-sm ${
                  date && (pickerType !== 'range' || date?.from)
                    ? 'text-black'
                    : 'text-gray-400'
                }`}
              >
                {displayValue()}
              </span>
              {(pickerType === 'range' ? date?.from || date?.to : date) && (
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
              {/* Year Header */}
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
                        setOpen(false)
                      }}
                      className={`px-3 py-2 text-sm rounded-md cursor-pointer text-center
                        ${
                          date?.getFullYear?.() === year
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
              mode={pickerType === 'range' ? 'range' : 'single'}
              selected={date}
              onSelect={handleSelect}
              defaultMonth={
                pickerType === 'range'
                  ? date?.from || new Date()
                  : date || new Date()
              }
            />
          )}
        </PopoverContent>
      </Popover>

      {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
    </div>
  )
}

export default CustomDatePicker
