import { useState, useEffect } from 'react';
import CustomeModal from '@common/components/CustomeModal';
import { Button } from '@pages/components/ui/button';
import { Textarea } from '@pages/components/ui/textarea';
import { Input } from '@pages/components/ui/input';  // Use Input for title

const DocumentModal = ({
  open,
  onClose,
  title,
  initialContent,
  mode = 'view',
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);
  const [documentTitle, setDocumentTitle] = useState(title); // State for editing title

  useEffect(() => {
    setContent(initialContent);
    setDocumentTitle(title); // Reset title when initial content changes
  }, [initialContent, title]);

  return (
    <CustomeModal open={open} onOpenChange={onClose} className="w-full max-w-2xl">
      {mode === 'view' ? (
        <div className="max-h-[70vh] overflow-y-auto text-sm leading-6 space-y-4">
          <span className="font-semibold text-lg justify-center flex">
            {title}
          </span>
          {content?.split('\n').map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      ) : (
        <>
          {/* Input for editing title */}
          <span className="font-semibold text-lg justify-center flex">
            <Input
              value={documentTitle} // Bind title to input
              onChange={(e) => setDocumentTitle(e.target.value)} // Update title state
              className="mb-4"
            />
          </span>
          <Textarea
            title={documentTitle}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px]"
          />
        </>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline_secondary" size="addbutton" onClick={onClose}>
          Close
        </Button>

        {mode === 'edit' && (
          <Button
            size="addbutton"
            onClick={() => {
              onSave(documentTitle, content); // Pass updated title and content
              onClose();
            }}
          >
            Save Changes
          </Button>
        )}
      </div>
    </CustomeModal>
  );
};

export default DocumentModal;