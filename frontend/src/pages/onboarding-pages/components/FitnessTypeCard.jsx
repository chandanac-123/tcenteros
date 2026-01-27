import elipes from '@assets/images/elipes.svg'
import selection from '@assets/images/selected.svg'

const FitnessTypeCard = ({ item, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`
        relative cursor-pointer transition-all duration-300
        rounded-xl border-2 p-1
        ${selected ? 'scale-110 shadow-xl' : 'border-bordergrey border-dotted'}
      `}
    >
      <img
        src={item.image}
        alt={item.label}
        className='w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] lg:w-[222px] lg:h-[220px] object-cover rounded-lg'
      />

      <div className='absolute top-3 right-3'>
        <img
          src={selected ? selection : elipes}
          alt='status'
          className='w-6 h-6'
        />
      </div>

      <div className='absolute bottom-3 left-1/2 -translate-x-1/2 w-5/6 px-2 py-1 rounded-xl text-center bg-black/30 backdrop-blur-sm text-white'>
        {item.label}
      </div>
    </div>
  )
}

export default FitnessTypeCard
