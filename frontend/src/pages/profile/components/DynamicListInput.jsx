import { Input } from '@pages/components/ui/input'
import { X, Plus } from 'lucide-react'

const DynamicListInput = ({ label, values = [], setValues }) => {
  return (
    <div className='flex w-full gap-2'>
      <div className='flex w-1/2 gap-2'>
        <button
          type='button'
          onClick={() => setValues([...values, ''])}
          className='flex items-center gap-1 text-primary mt-2'
        >
          <Plus size={16} /> Add {label}
        </button>
      </div>

      <div className='grid grid-cols-4 gap-4'>
        {values.map((item, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Input
              value={item}
              onChange={e => {
                const updated = [...values]
                updated[index] = e.target.value
                setValues(updated)
              }}
            />

            <button
              type='button'
              onClick={() => {
                const updated = values.filter((_, i) => i !== index)
                setValues(updated)
              }}
              className='text-red_text hover:text-red-700'
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DynamicListInput
