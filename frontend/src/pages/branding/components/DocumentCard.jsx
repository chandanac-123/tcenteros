import edit from '@assets/form-icons/edit.svg'
import view from '@assets/form-icons/view.svg'

const DocumentCard = ({ title, onView, onEdit }) => {
  return (
    <div className='border rounded-lg p-2 flex justify-between items-center hover:shadow-md transition'>
      <span className='font-medium'>{title}</span>

      <div className='flex items-center gap-3'>
        <button onClick={onEdit}>
          <img src={edit} alt='edit' className='w-5 h-5' />
        </button>
        <button onClick={onView}>
          <img src={view} alt='view' className='w-5 h-5' />
        </button>
      </div>
    </div>
  )
}

export default DocumentCard
