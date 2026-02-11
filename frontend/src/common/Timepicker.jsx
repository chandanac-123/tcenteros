import { useState } from 'react'
import { Clock, X } from 'lucide-react'

export default function TimePicker ({ label }) {
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [period, setPeriod] = useState('AM')

  const isTimeSelected = hour !== '' && minute !== ''

  // Hour validation (1–12 only)
  const handleHourChange = e => {
    let value = e.target.value

    if (value === '') {
      setHour('')
      return
    }

    value = Number(value)

    if (value >= 1 && value <= 12) {
      setHour(value)
    }
  }

  // Minute validation (0–59 only)
  const handleMinuteChange = e => {
    let value = e.target.value

    if (value === '') {
      setMinute('')
      return
    }

    value = Number(value)

    if (value >= 0 && value <= 59) {
      setMinute(value)
    }
  }

  const handleClear = () => {
    setHour('')
    setMinute('')
    setPeriod('AM')
  }

  return (
    <div className='w-full'>
      <label className='block mb-1 text-sm font-normal text-textblack'>
        {label}
      </label>

      <div className='relative'>
        {/* Clock Icon */}
        <Clock
          size={18}
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
        />

        <div className='flex items-center justify-between border border-gray-300 rounded-xl pl-9 pr-3 py-2 bg-white shadow-sm'>
          {/* HH : MM */}
          <div className='flex items-center'>
            <input
              type='number'
              placeholder='HH'
              value={hour}
              onChange={handleHourChange}
              className='w-16 outline-none text-center'
            />

            <span className='mx-1'>:</span>

            <input
              type='number'
              placeholder='MM'
              value={minute}
              onChange={handleMinuteChange}
              className='w-16 outline-none text-center'
            />
          </div>

          {/* AM/PM + Clear */}
          <div className='flex items-center gap-3'>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className='outline-none bg-transparent cursor-pointer text-sm  text-textgrey'
            >
              <option value='AM'>AM</option>
              <option value='PM'>PM</option>
            </select>

            {isTimeSelected && (
              <X
                size={16}
                onClick={handleClear}
                className='text-gray-400 hover:text-red-500 cursor-pointer'
              />
            )}
          </div>
        </div>
      </div>

      {isTimeSelected && (
        <p className='mt-2 text-sm text-gray-600'>
          Selected Time: {hour}:{minute.toString().padStart(2, '0')} {period}
        </p>
      )}
    </div>
  )
}
