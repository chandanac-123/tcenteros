import { useState } from 'react'
import { Files } from 'lucide-react'

const PublicWebUrl = () => {
  const url = 'https://fitrec//ghhsbsmcom/app/3d6d4be9fb218e5c#fd3ad6ed6390f1b0'

  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className='flex flex-col mt-3'>
      <div className='flex justify-between items-start'>
        <div className='flex flex-col gap-2'>
          <span className='text-sm text-pricing_text'>Website URL</span>
          <div className='flex items-center gap-4 border border-tableborder p-2 rounded-md'>
            <span className='text-sm break-all text-primary_light'>{url}</span>
            <button
              onClick={handleCopy}
              className='text-primary text-sm font-medium'
            >
              {copied ? (
                <Files className='text-primary w-4 h-4' />
              ) : (
                <Files className='w-4 h-4 text-pricing_text' />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicWebUrl
