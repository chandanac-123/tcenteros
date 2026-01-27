import elipes from '@assets/images/elipes.svg'
import selection from '@assets/images/selected.svg'

const SelectionCardTick = ({ item, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`
        relative cursor-pointer transition-all duration-300
        rounded-xl border-2 p-1 w-full
        ${selected ? 'scale-110 shadow-xl' : 'border-bordergrey border-dotted'}
      `}
    >
      <div className='flex gap-4 justify-items-start items-center'>
        <div className='flex'>
          {' '}
          <img src={item?.image} alt={item?.label} className='w-8' />
        </div>

        <div className='flex flex-col'>
          <span className='font-medium text-sm'>{item?.label}</span>
          <span className='w-40 text-xs text-grey '>{item?.sublabel}</span>
        </div>
      </div>

      <div className='absolute top-3 right-3'>
        <img
          src={selected ? selection : elipes}
          alt='status'
          className='w-6 h-6'
        />
      </div>
    </div>
  )
}

export default SelectionCardTick
