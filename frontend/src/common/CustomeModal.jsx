import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@pages/components/ui/dialog'

const CustomeModal = ({ label, header, children, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {label && (
        <DialogTrigger asChild>
          <Button variant='default' size='addbutton'>
            {label}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className='w-auto max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default CustomeModal
