const SelectCategory = ({ item, selected, onSelect }) => {
  return (
    <label
      onClick={() => onSelect(item?.id)}
      className={`
        flex flex-col items-center border-2 rounded-lg p-2 w-32 cursor-pointer transition justify-center
        ${selected ? 'border-secondary bg-secondary/5' : 'border-bordergreylight'}
      `}
    >
      <img src={item?.image_url} alt={item?.name} className='w-6 h-6 mr-3' />

      <span className='flex-1 text-sm'>{item?.name}</span>
    </label>
  )
}

export default SelectCategory
