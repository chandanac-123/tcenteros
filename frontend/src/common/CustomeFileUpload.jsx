import { Input } from '@pages/components/ui/input'
import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import file from '@assets/form-icons/file.svg'


const InputFile = ({ label, onChange, onRemove, name, error }) => {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('No file chosen')

  const handleChange = e => {
    const file = e.target.files?.[0] || null
    setFileName(file ? file.name : 'No file chosen')

    onChange?.({
      target: {
        name,
        value: file, // ✅ File object
      },
    })
  }

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = ''
    setFileName('No file chosen')
    onRemove?.()
  }

  return (
    <>
      {label && <label className="block mb-1 text-sm">{label}</label>}

      <div className="relative">
        <Input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleChange}
          className="pr-10"
        />

        {fileName !== 'No file chosen' ? (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <img
            src={file}
            alt=""
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
          />
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </>
  )
}

export default InputFile


