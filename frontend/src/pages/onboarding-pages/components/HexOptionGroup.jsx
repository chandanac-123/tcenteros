import HexButton from '@pages/components/ui/hexbutton'

const HexOptionGroup = ({
  title,
  options,
  value,
  onChange,
}) => {
  return (
    <div className='text-center space-y-4'>
      <p className='font-medium items-start flex justify-start'>{title}</p>

      <div className='flex gap-4 justify-center flex-wrap'>
        {options.map(option => (
          <HexButton
            key={option}
            label={option}
            active={value === option}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  )
}

export default HexOptionGroup
