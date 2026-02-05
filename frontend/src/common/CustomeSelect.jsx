import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@pages/components/ui/select'

export default function CustomeSelect ({
  label,
  placeholder,
  constant = false,
  options,
  onSelect
}) {
  function handleSelect () {
    if (onSelect) {
      onSelect(value)
    }
  }

  return (
    <Select onValueChange={handleSelect}>
      <label className='block mb-1 text-sm font-normal text-textblack'>
        {label}
      </label>
      <SelectTrigger className='w-full h-9'>
        <SelectValue placeholder={placeholder} className='placeholder:text-textwhite text-textwhite'/>
      </SelectTrigger>
      <SelectContent>
        {options?.map((item, index) => {
          return (
            <SelectItem key={index} value={item?.id}>
              {' '}
              {item?.label || item?.name}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
