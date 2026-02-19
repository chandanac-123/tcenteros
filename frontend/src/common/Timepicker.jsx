import { Clock, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function TimePicker ({ label, value, onChange }) {
  console.log('value: ', value)
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [period, setPeriod] = useState('AM')

  // If parent value changes, update local UI
  useEffect(() => {
    if (!value) {
      setHour('')
      setMinute('')
      setPeriod('AM')
      return
    }
    const [h, m] = value.split(':')
    const hour24 = parseInt(h, 10)
    const newPeriod = hour24 >= 12 ? 'PM' : 'AM'
    const hour12 = hour24 % 12 || 12
    setHour(hour12.toString())
    setMinute((m || '').slice(0, 2)) // safe minute
    setPeriod(newPeriod)
  }, [value])

const updateParent = (h, m, p) => {
  if (h !== '' && m !== '') {
    let hour24 = Number(h)
    const minuteNum = Number(m)
    if (isNaN(hour24) || isNaN(minuteNum)) {
      onChange('')
      return
    }
    if (p === 'PM' && hour24 !== 12) hour24 += 12
    if (p === 'AM' && hour24 === 12) hour24 = 0
    const formatted =
      String(hour24).padStart(2, '0') +
      ':' +
      String(minuteNum).padStart(2, '0')
    onChange(formatted)
  } else {
    onChange('')
  }
}


  const handleHourChange = e => {
    const value = e.target.value
    if (value === '') {
      setHour('')
      updateParent('', minute, period)
      return
    }
    const num = Number(value)
    if (num >= 1 && num <= 12) {
      setHour(value) // 👈 STRING
      updateParent(value, minute, period)
    }
  }

  const handleMinuteChange = e => {
    const value = e.target.value
    if (value === '') {
      setMinute('')
      updateParent(hour, '', period)
      return
    }
    const num = Number(value)
    if (num >= 0 && num <= 59) {
      setMinute(value) // 👈 STRING
      updateParent(hour, value, period)
    }
  }

  const handlePeriodChange = e => {
    const value = e.target.value
    setPeriod(value)
    updateParent(hour, minute, value)
  }

  const handleClear = () => {
    setHour('')
    setMinute('')
    setPeriod('AM')
    onChange('')
  }

  const isTimeSelected = hour !== '' && minute !== ''

  return (
    <div className='w-full'>
      <label className='block mb-1 text-sm'>{label}</label>

      <div className='relative'>
        <Clock
          size={18}
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
        />

        <div className='flex items-center justify-between border rounded-lg pl-9 pr-3 py-2 h-9  bg-white shadow-sm'>
          <div className='flex items-center'>
            <input
              // type='number'
              placeholder='HH'
              value={hour}
              onChange={handleHourChange}
              className='w-16 outline-none text-center'
            />

            <span className='mx-1'>:</span>

            <input
              // type='number'
              placeholder='MM'
              value={minute}
              onChange={handleMinuteChange}
              className='w-16 outline-none text-center'
            />
          </div>

          <div className='flex items-center gap-3'>
            <select
              value={period}
              onChange={handlePeriodChange}
              className='outline-none bg-transparent text-sm'
            >
              <option value='AM'>AM</option>
              <option value='PM'>PM</option>
            </select>

            {isTimeSelected && (
              <X
                size={16}
                onClick={handleClear}
                className='cursor-pointer text-gray-400 hover:text-red-500'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
