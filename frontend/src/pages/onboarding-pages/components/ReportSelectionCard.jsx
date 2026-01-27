const ReportSelectionCard = ({ item, selected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`
        relative cursor-pointer transition-all duration-300
        rounded-xl border-2 p-4
        ${selected ? 'scale-110 shadow-xl' : 'border-bordergrey border-dotted'}
      `}
    >
      <img
        src={item.image}
        alt={item.label}
        className='object-contain rounded-lg w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] lg:w-[222px] lg:h-[162px]'
      />

      <label className='mt-3 flex justify-center items-center gap-2 text-sm font-medium'>
        <input
          type='radio'
          checked={selected}
          readOnly
          className='accent-secondary'
        />
        {item.label}
      </label>
    </div>
  )
}

export default ReportSelectionCard
