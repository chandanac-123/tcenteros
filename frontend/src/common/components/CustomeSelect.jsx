import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@pages/components/ui/select'
import { cn } from '@pages/lib/utils'

const CustomeSelect = ({ label,
  placeholder,
  options = [],
  value,
  onChange,
  error,
  search = false,
  disabled = false,
  icon,
  iconPosition = 'start' // NEW
}) => {
  const [searchVal, setSearchVal] = useState('')

  const filteredOptions = useMemo(() => {
    return options.filter(item => {
      const text =
        item?.label ||
        item?.name ||
        item?.full_name ||
        item?.center_name ||
        item?.membership_name ||
        ''

      return text.toLowerCase().includes(searchVal.toLowerCase())
    })
  }, [options, searchVal])

  const hasIcon = !!icon

  return (
    <div>
      {label && (
        <label className='block mb-1 text-sm font-normal text-textblack'>
          {label}
        </label>
      )}

      {/* 🔥 Same wrapper like Input */}
      {hasIcon ? (
        <div className='flex items-center relative rounded-lg border border-bordergreylight'>
          
          {/* LEFT ICON */}
          {iconPosition === 'start' && (
            <span className='absolute left-3 flex items-center text-gray-400'>
              {icon}
            </span>
          )}

          <Select
            disabled={disabled}
            value={value ? String(value) : ''}
            onValueChange={val => onChange(val)}
          >
            <SelectTrigger
              className={cn(
                'w-full h-9 bg-transparent border-0 focus:ring-0',
                iconPosition === 'start' ? 'pl-10' : 'pr-10'
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className='max-h-[180px] overflow-y-auto'>
              {search &&  (
                <div className='p-2'>
                  <input
                    type='text'
                    placeholder='Search...'
                    autoFocus
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    onKeyDown={e => {
                      if (
                        e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'Enter'
                      ) return
                      e.stopPropagation()
                    }}
                    className='w-full border rounded px-2 py-1 text-sm focus:outline-none border-input'
                  />
                </div>
              )}

              {filteredOptions.map(item => {
                const label =
                  item?.label ||
                  item?.name ||
                  item?.full_name ||
                  item?.center_name ||
                  (item?.membership_name
                    ? `${item.membership_name} - ₹${item.default_price}`
                    : '')

                return (
                  <SelectItem
                    key={
                      item?.id ||
                      item?.membership_id ||
                      item?.product_id ||
                      item?.member_membership_id
                    }
                    value={String(
                      item?.id ||
                        item?.membership_id ||
                        item?.product_id ||
                        item?.member_membership_id
                    )}
                    className='cursor-pointer focus:bg-greylight focus:text-textblack'
                  >
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {/* RIGHT ICON */}
          {iconPosition === 'end' && (
            <span className='absolute right-8 flex items-center text-gray-400'>
              {icon}
            </span>
          )}
        </div>
      ) : (
        // 🔥 Without icon (same style as input)
        <Select
          disabled={disabled}
          value={value ? String(value) : ''}
          onValueChange={val => onChange(val)}
        >
          <SelectTrigger className='w-full h-9 rounded-lg border border-bordergreylight'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent className='max-h-[180px] overflow-y-auto'>
            {filteredOptions.map(item => {
              const label =
                item?.label ||
                item?.name ||
                item?.full_name ||
                item?.center_name

              return (
                <SelectItem key={item.id} value={String(item.id)}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )}

      {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
    </div>
  )
}
export default CustomeSelect