import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import filter from '@assets/form-icons/filter.svg'

const CustomFilter = ({ onApply, options = [], filterName = 'Filter' }) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const handleSelect = option => {
    const value = option.value ?? option.id
    setSelectedValue(value)
    onApply(value)
    setOpen(false)
  }

  const handleClear = e => {
    e.stopPropagation()
    setSelectedValue('')
    onApply(null)
    setOpen(false)
  }

  const selectedOption = options.find(
    opt => (opt.value ?? opt.id) === selectedValue
  )

  const selectedLabel =
    selectedOption?.label || selectedOption?.center_name || filterName

  // close dropdown outside click
  useEffect(() => {
    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={wrapperRef} className='relative w-36'>
      {/* Filter Input */}
      <div
        onClick={() => setOpen(prev => !prev)}
        className='flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white'
      >
        <div className='flex items-center gap-2'>
          <img src={filter} alt='Filter' className='w-4 h-4' />
          <span className='text-sm truncate'>{selectedLabel}</span>
        </div>

        {selectedValue && (
          <X
            size={14}
            onClick={handleClear}
            className='text-gray-500 cursor-pointer'
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className='absolute mt-2 w-full bg-white rounded-xl shadow-lg py-2 z-50 max-h-60 overflow-auto'>
          {options.map(option => {
            const value = option.value ?? option.id
            const label = option.label ?? option.center_name

            return (
              <div
                key={value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 text-sm cursor-pointer rounded-lg mx-2
                ${
                  selectedValue === value
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                {label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomFilter