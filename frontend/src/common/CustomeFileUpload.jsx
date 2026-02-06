import { Input } from '@pages/components/ui/input'
import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import file from '@assets/form-icons/file.svg'

const InputFile = ({ label }) => {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('No file chosen')

  const handleChange = e => {
    if (e.target.files?.length) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setFileName('No file chosen')
  }

  return (
    <>
      {label && (
        <label className='block mb-1 text-sm font-normal text-textblack'>
          {label}
        </label>
      )}

      {/* wrapper */}
      <div className='relative'>
        <Input
          ref={inputRef}
          id='picture'
          type='file'
          onChange={handleChange}
          className='
            pr-10
            file:text-gray-500
            file:bg-transparent
            file:border-0
            file:font-normal
            cursor-pointer
          '
        />

        {fileName !== 'No file chosen' ?(
          <button
            type='button'
            onClick={handleRemove}
            className='
              absolute right-4 top-1/2 -translate-y-1/2
              text-muted-foreground
    
            '
          >
            <X className='h-4 w-4' />
          </button>
        ) : (
          <img
            src={file}
            alt='File Icon'
            className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4'
          />
        )}
      </div>
    </>
  )
}

export default InputFile
