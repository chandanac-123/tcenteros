const SelectionWithoutCheckbox = ({ item, selected, onSelect }) => {
  return (
    <label
      onClick={() => onSelect(item?.id)}
      className={`
        flex items-center border-2 rounded-lg px-4 py-3 cursor-pointer transition justify-center
        ${selected ? 'border-onboard_primary bg-onboard_primary/5' : 'border-bordergreylight'}
      `}
    >
      <img src={item?.image} alt={item?.label} className='w-6 h-6 mr-3' />

      <span className='flex-1'>{item?.label}</span>
    </label>
  )
}

export default SelectionWithoutCheckbox
