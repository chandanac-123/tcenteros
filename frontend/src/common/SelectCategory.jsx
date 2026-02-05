const SelectCategory = ({ item, selected, onSelect }) => {
  return (
    <label
      onClick={() => onSelect(item?.id)}
      className={`
        flex flex-col items-center border-2 rounded-lg p-2 w-36 cursor-pointer transition justify-center
        ${selected ? 'border-secondary bg-secondary/5' : 'border-bordergreylight'}
      `}
    >
      <img src={item?.image} alt={item?.label} className='w-6 h-6 mr-3' />

      <span className='flex-1 text-sm'>{item?.label}</span>
    </label>
  )
}

export default SelectCategory
