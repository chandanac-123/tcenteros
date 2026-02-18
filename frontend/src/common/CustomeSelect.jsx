import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@pages/components/ui/select'

export default function CustomeSelect({
  label,
  placeholder,
  options,
  value,
  onChange
}) {
  return (
    <div>
      {label && (
        <label className='block mb-1 text-sm font-normal text-textblack'>
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='w-full h-9'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options?.map((item, index) => (
            <SelectItem key={index} value={item?.id}>
              {item?.label || item?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
