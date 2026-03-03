import { useState, useEffect } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Textarea } from '@pages/components/ui/textarea'

const DocumentModal = ({
  open,
  onClose,
  title,
  initialContent,
  mode = 'view',
  onSave
}) => {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  return (
    <CustomeModal open={open} onOpenChange={onClose}>
      {mode === 'view' ? (
        <div className='max-h-[70vh] overflow-y-auto text-sm leading-6 space-y-4'>
          <span className='font-semibold text-lg justify-center flex'>
            {title}
          </span>
          {content?.split('\n').map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className='min-h-[300px]'
        />
      )}

      <div className='flex justify-end gap-3 mt-4'>
        <Button variant='outline_secondary' size='addbutton' onClick={onClose}>
          Cancel
        </Button>

        {mode === 'edit' && (
          <Button
            size='addbutton'
            onClick={() => {
              onSave(content)
              onClose()
            }}
          >
            Save Changes
          </Button>
        )}
      </div>
    </CustomeModal>
  )
}

export default DocumentModal
