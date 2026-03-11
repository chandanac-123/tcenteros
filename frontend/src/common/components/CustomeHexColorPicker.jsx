import { HexColorPicker } from 'react-colorful'
import { Input } from '@pages/components/ui/input'

const CustomHexColorPicker = ({ label, value, onChange ,name}) => {
  // Validate hex format
  const handleInputChange = e => {
    const inputValue = e.target.value

    // Allow typing # and partial hex
    if (/^#?[0-9A-Fa-f]{0,6}$/.test(inputValue)) {
      // Auto add # if missing
      const formatted =
        inputValue.charAt(0) === '#' ? inputValue : `#${inputValue}`
      onChange(formatted)
    }
  } 


  return (
    <div className='space-y-3 w-full'>
      {label && <label className='text-sm font-normal'>{label}</label>}
      {/* Color Picker */}
      <HexColorPicker
        className='!w-full'
        color={value || '#000000'}
        onChange={onChange}
      />
      {/* Manual Input */}
      <Input value={value} name={name} onChange={handleInputChange} placeholder='#1452D4' />
    </div>
  )
}

export default CustomHexColorPicker
