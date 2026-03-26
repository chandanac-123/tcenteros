import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@pages/components/ui/select'
import EmployeeTable from '@pages/employee-management/employee/table';

export default function CustomeSelect ({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  error,
  search = false,
  disabled = false
}) {
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

  return (
    <div>
      {label && (
        <label className='block mb-1 text-sm font-normal text-textblack'>
          {label}
        </label>
      )}

      <Select
        disabled={disabled}
        value={value ? String(value) : ''}
        onValueChange={val => onChange(val)}
      >
        <SelectTrigger className='w-full h-9'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className='max-h-[180px] overflow-y-auto'>
          {search && (
            <div className='p-2'>
              <input
                type='text'
                placeholder='Search...'
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                className='w-full border rounded px-2 py-1 text-sm'
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
                className={`cursor-pointer 
    ${
      String(value) ===
      String(
        item?.id ||
          item?.membership_id ||
          item?.product_id ||
          item?.member_membership_id
      )
        ? 'bg-blue-100 text-blue-600 font-medium' // ✅ selected
        : 'hover:bg-gray-100'
    }
  `}
              >
                {searchVal ? (
                  <span>
                    {label
                      .split(new RegExp(`(${searchVal})`, 'gi'))
                      .map((part, i) =>
                        part.toLowerCase() === searchVal.toLowerCase() ? (
                          <span key={i} className='bg-yellow-200 font-medium'>
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      )}
                  </span>
                ) : (
                  label
                )}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
    </div>
  )
}
