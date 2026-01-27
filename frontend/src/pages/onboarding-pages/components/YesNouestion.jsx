const YesNoQuestion = ({ question, onAnswer }) => {
  return (
    <div className='flex flex-col gap-3 mt-2'>
      {['yes', 'no'].map(value => (
        <label
          key={value}
          className='flex items-center gap-3 cursor-pointer'
        >
          <input
            type='radio'
            name='yes_no'
            value={value}
            onChange={() => onAnswer(value)}
            className='w-4 h-4 accent-secondary'
          />
          <span className='text-sm capitalize'>{value}</span>
        </label>
      ))}
    </div>
  )
}

export default YesNoQuestion
