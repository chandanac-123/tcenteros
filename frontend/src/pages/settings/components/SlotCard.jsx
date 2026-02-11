import deleteicon from '@assets/form-icons/delete.svg'

const SlotCard = ({ startTime, endTime, capacity, onDelete }) => {
  return (
    <div className='border border-textgrey rounded-md p-4 flex justify-between items-center bg-white hover:shadow-md transition-all duration-200'>
      <div className='flex flex-col'>
        <span className='text-sm text-grey'>
          {startTime} - {endTime}
        </span>
        <span className='text-sm text-grey'>Capacity: {capacity}</span>
      </div>

      <button
        onClick={onDelete}
        className='p-1 rounded hover:bg-red-50 transition'
      >
        <img src={deleteicon} alt='delete' className='w-4 h-4' />
      </button>
    </div>
  )
}

export default SlotCard
