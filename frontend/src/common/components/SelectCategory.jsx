const SelectCategory = ({ item, selected, onSelect }) => {
  return (
    <label
      onClick={() => onSelect(item?.id)}
      className={`
        flex flex-col items-center  border-2 rounded-lg p-2 w-32 cursor-pointer transition justify-center
        ${selected ? 'border-primary bg-primary/5' : 'border-bordergreylight'}
      `}
    >
      <img src={item?.image_url}loading="lazy" alt={item?.name} className='w-10 h-10 mr-3 rounded-lg justify-center flex' />

      <span className='flex-1 text-sm text-center'>{item?.name}</span>
    </label>
  )
}

export default SelectCategory
