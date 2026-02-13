const CustomeVerticalSelect = ({
  children,
  options = [],
  selected,
  onSelect,
  heading
}) => {
  return (
    <div className='flex min-h-screen gap-2'>
      <div className='flex flex-col gap-2 w-64 pr-4 border-r border-gray-300 min-h-screen'>
        {options.map(opt => (
          <button
            key={opt?.id}
            type='button'
            onClick={() => onSelect?.(opt?.id)}
            className={`text-left p-3 transition-all rounded-l-lg font-medium text-base ${
              selected === opt?.id
                ? 'bg-primarybglight text-primary border-r-8 border-primary'
                : 'hover:bg-gray-100 text-textblack'
            }`}
          >
            {opt?.name}
          </button>
        ))}
      </div>
      <div className='pl-4 flex-1'>
        <span className='font-semibold text-lg'>{heading}</span>
        {children}
      </div>
    </div>
  )
}

export default CustomeVerticalSelect
