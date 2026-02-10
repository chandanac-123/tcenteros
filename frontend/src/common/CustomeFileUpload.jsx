// import { Input } from '@pages/components/ui/input'
// import { useRef, useState } from 'react'
// import { X } from 'lucide-react'
// import file from '@assets/form-icons/file.svg'


// const InputFile = ({ label, onChange, onRemove, name, error }) => {
//   const inputRef = useRef(null)
//   const [fileName, setFileName] = useState('No file chosen')

//   const handleChange = e => {
//     const file = e.target.files?.[0] || null
//     setFileName(file ? file.name : 'No file chosen')

//     onChange?.({
//       target: {
//         name,
//         value: file, // ✅ File object
//       },
//     })
//   }

//   const handleRemove = () => {
//     if (inputRef.current) inputRef.current.value = ''
//     setFileName('No file chosen')
//     onRemove?.()
//   }

//   return (
//     <>
//       {label && <label className="block mb-1 text-sm">{label}</label>}

//       <div className="relative">
//         <Input
//           ref={inputRef}
//           type="file"
//           accept=".png,.jpg,.jpeg"
//           onChange={handleChange}
//           className="pr-10"
//         />

//         {fileName !== 'No file chosen' ? (
//           <button
//             type="button"
//             onClick={handleRemove}
//             className="absolute right-4 top-1/2 -translate-y-1/2"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         ) : (
//           <img
//             src={file}
//             alt=""
//             className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
//           />
//         )}
//       </div>

//       {error && <p className="text-xs text-red-500">{error}</p>}
//     </>
//   )
// }

// export default InputFile


import { X, Upload } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import file from '@assets/form-icons/file.svg'

const InputFile = ({
  label,
  name,
  value, // File | string | null
  onChange,
  onRemove,
  error,
  accept = '.png,.jpg,.jpeg'
}) => {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!value) {
      setPreview(null)
      return
    }

    if (typeof value === 'string') {
      setPreview(value)
    }

    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [value])

  const handleSelect = () => {
    inputRef.current?.click()
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    onChange?.({
      target: { name, value: file }
    })
  }

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = ''
    setPreview(null)
    onRemove?.()
  }

  return (
    <>
      {label && <label className='block text-sm mb-1'>{label}</label>}

      {/* Hidden native input */}
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleFileChange}
        className='hidden '
      />

      {/* PREVIEW */}
      {preview ? (
        <div className='relative w-16 h-16 rounded-md border overflow-hidden'>
          <img
            src={preview}
            alt='Preview'
            className='w-full h-full object-cover'
          />
          <button
            type='button'
            onClick={handleRemove}
            className='absolute top-0 right-0 bg-white rounded-full p-1 shadow'
          >
            <X className='h-3 w-3 text-red-500' />
          </button>
        </div>
      ) : (
        /* CUSTOM UPLOAD BUTTON */
        <button
          type='button'
          onClick={handleSelect}
          className='
            flex justify-between items-center w-full
            px-3 py-2
            border rounded-md
            text-sm text-textgrey
          '
        >
          <span>Upload image</span>
          <img src={file} alt='file icon' className='w-4 h-4 object-cover' />
        </button>
      )}

      {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
    </>
  )
}

export default InputFile
