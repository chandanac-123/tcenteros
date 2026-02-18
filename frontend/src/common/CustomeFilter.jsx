import { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import { Checkbox } from '@pages/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@pages/components/ui/popover'
import filter from '@assets/form-icons/filter.svg'

const ROLES = [
  { label: 'Trainee', value: 'trainee' },
  { label: 'Employee', value: 'employee' },
  { label: 'Staff', value: 'staff' }
]

export default function CustomFilter ({ onApply }) {
  const [status, setStatus] = useState('')
  const [roles, setRoles] = useState([])

  const toggleRole = role => {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const clearFilter = () => {
    setStatus('')
    setRoles([])
    onApply({})
  }

  const applyFilter = () => {
    onApply({ status, roles })
  }

  return (
    <div className='flex items-center gap-3'>
      {/* Role Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='button_filter' size='filterbutton'>
            <img src={filter} alt='Filter Icon' className='w-5 h-5 ' />
            Filter
          </Button>
        </PopoverTrigger>

        <PopoverContent className='w-48 space-y-2'>
          {ROLES.map(role => (
            <div key={role.value} className='flex items-center gap-2'>
              <Checkbox
                checked={roles.includes(role.value)}
                onCheckedChange={() => toggleRole(role.value)}
              />
              <span className='text-sm text-filter_border'>{role.label}</span>
            </div>
          ))}
          <div className='flex justify-center items-center gap-4'>
            <button onClick={applyFilter} className='bg-textwhite text-primary border border-primary text-sm rounded-xl px-3 py-1'>Apply</button>
            <button className='bg-textwhite text-textgrey border border-textgrey text-sm rounded-xl px-3 py-1' onClick={clearFilter}>
              Clear
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Actions */}
    </div>
  )
}
