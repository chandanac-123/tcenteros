import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@pages/components/ui/dialog'

const CustomeModal = ({
  label,
  header,
  children,
  open,
  onOpenChange,
  className = ''
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {label && (
        <DialogTrigger asChild>
          <Button variant='default' size='addbutton'>
            {label}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={`w-auto max-h-[80vh] overflow-y-auto ${className}`}
      >
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default CustomeModal
