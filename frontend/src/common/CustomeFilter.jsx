import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import filter from '@assets/form-icons/filter.svg'

const CustomFilter = ({ onApply, options ,filterName}) => {
  const [selectedRole, setSelectedRole] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const handleSelect = value => {
  setSelectedRole(value)
  onApply(value)   // 🔥 send id directly
  setOpen(false)
}

const handleClear = e => {
  e.stopPropagation()
  setSelectedRole('')
  onApply(null)   // 🔥 reset
  setOpen(false)
}

  const selectedLabel =
    options?.find(r => r.value === selectedRole)?.label || filterName || 'Filter'

  // ✅ Close when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className='relative w-36'>
      {/* Input Box */}
      <div
        onClick={() => setOpen(true)}
        className='flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white'
      >
        <div className='flex items-center gap-2'>
          <img src={filter} alt='Filter' className='w-4 h-4' />
          <span className='text-sm'>{selectedLabel}</span>
        </div>

        {selectedRole && (
          <X
            size={14}
            onClick={handleClear}
            className='text-gray-500 cursor-pointer'
          />
        )}
      </div>

      {/* Custom Dropdown */}
      {open && (
        <div className='absolute mt-2 w-full bg-white rounded-2xl shadow-lg py-2 z-50'>
          {options?.map(role => (
            <div
              key={role.value}
              onClick={() => handleSelect(role.value)}
              className={`px-4 py-2 text-sm cursor-pointer rounded-lg mx-2
                ${
                  selectedRole === role.value
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'hover:bg-gray-100'
                }`}
            >
              {role.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomFilter
